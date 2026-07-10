export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCoordinate(value: string | null, min: number, max: number) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : null;
}
