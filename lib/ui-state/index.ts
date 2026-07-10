/**
 * UI state utilities - User preference and UI state management
 */

export {
  VIEW_MODE_STORAGE_KEY,
  VIEW_MODE_CHANGE_EVENT,
  VIEW_MODES,
  normalizeViewMode,
  getInitialViewMode,
  type ViewMode,
} from './view-mode';
export {
  PREFERRED_LOCALE_STORAGE_KEY,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  buildPreferredLocaleCookie,
  buildLocalizedPath,
  persistPreferredLocale,
  readPreferredLocale,
} from './locale-preference';
export {
  PERSONA_PREFERENCE_STORAGE_KEY,
  parsePersonaPreference,
  createPersonaPreference,
  serializePersonaPreference,
  getPersonaFeedCategory,
  type PersonaPreference,
  type PersonaFeedCategory,
} from './persona-preference';
export { RADAR_RADIUS_STEPS, getNextRadarRadius } from './radar-radius';
export {
  ANALYZE_QUOTA_STORAGE_KEY,
  DAILY_SOFT_LIMIT,
  readQuota,
  incrementQuota,
} from './analyze-quota';
