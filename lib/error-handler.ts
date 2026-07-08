/**
 * Enhanced Error Handler for K-Vibe Tracker
 * 
 * Provides centralized error handling with logging for:
 * - API errors
 * - Type errors
 * - Network errors
 * - Validation errors
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  endpoint?: string;
  userId?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
  method?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;

  constructor(
    code: string,
    message: string,
    severity: ErrorSeverity = 'medium',
    context?: ErrorContext,
  ) {
    super(message);
    this.code = code;
    this.severity = severity;
    if (context !== undefined) {
      this.context = context;
    }
    this.name = 'AppError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      timestamp: this.context?.timestamp || new Date(),
      url: this.context?.url,
      endpoint: this.context?.endpoint,
    };
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super('NETWORK_ERROR', message, 'high', context);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super('VALIDATION_ERROR', message, 'low');
    this.name = 'ValidationError';
  }
}

export class APIError extends AppError {
  constructor(
    public statusCode: number,
    message: string,
    context?: ErrorContext,
  ) {
    const severity = statusCode >= 500 ? 'critical' : 'high';
    super('API_ERROR', message, severity, context);
    this.name = 'APIError';
  }
}

/**
 * Central error handler
 * 
 * Usage:
 * ```typescript
 * try {
 *   const data = await fetchPlaces();
 * } catch (error) {
 *   const appError = handleError(error, { endpoint: '/api/places' });
 *   // Error is logged and formatted
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context?: ErrorContext,
): AppError {
  const timestamp = new Date();
  const fullContext: ErrorContext = {
    timestamp,
    ...(typeof navigator !== 'undefined' && navigator.userAgent ? { userAgent: navigator.userAgent } : {}),
    ...(context ?? {}),
  };

  if (error instanceof AppError) {
    logError(error);
    return error;
  }

  if (error instanceof TypeError) {
    const appError = new AppError(
      'TYPE_ERROR',
      error.message || 'Type error occurred',
      'medium',
      fullContext,
    );
    logError(appError);
    return appError;
  }

  if (error instanceof SyntaxError) {
    const appError = new AppError(
      'PARSE_ERROR',
      error.message || 'JSON parse error',
      'medium',
      fullContext,
    );
    logError(appError);
    return appError;
  }

  const message = error instanceof Error ? error.message : String(error);
  const appError = new AppError('UNKNOWN_ERROR', message, 'medium', fullContext);
  logError(appError);
  return appError;
}

/**
 * Log error with appropriate level
 */
function logError(error: AppError): void {
  const logData = {
    ...error.toJSON(),
    stack: error.stack,
  };

  switch (error.severity) {
    case 'critical':
      console.error('🔴 CRITICAL:', logData);
      // TODO: Send to Sentry or error tracking service
      break;
    case 'high':
      console.error('🟠 HIGH:', logData);
      break;
    case 'medium':
      console.warn('🟡 MEDIUM:', logData);
      break;
    case 'low':
      console.warn('🟢 LOW:', logData);
      break;
  }
}

/**
 * User-friendly error message
 * Returns message appropriate for UI display
 */
export function getUserMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return '네트워크 연결을 확인해주세요.';
    case 'API_ERROR':
      if ((error as APIError).statusCode >= 500) {
        return '서버에 일시적 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      return '요청 처리 중 오류가 발생했습니다.';
    case 'VALIDATION_ERROR':
      return `입력값이 올바르지 않습니다: ${(error as ValidationError).field}`;
    case 'TYPE_ERROR':
      return '예상하지 않은 데이터 형식입니다.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
}
