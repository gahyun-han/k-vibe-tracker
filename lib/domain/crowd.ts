export type CrowdLevel = 'low' | 'mid' | 'high';

export const CROWD_DOT_CLASS: Record<CrowdLevel, string> = {
  low: 'bg-emerald-400',
  mid: 'bg-yellow-400',
  high: 'bg-red-400',
};

export const CROWD_TEXT_CLASS: Record<CrowdLevel, string> = {
  low: 'text-emerald-300',
  mid: 'text-yellow-300',
  high: 'text-red-300',
};

export function isCrowdLevel(value: unknown): value is CrowdLevel {
  return value === 'low' || value === 'mid' || value === 'high';
}

export function toCrowdLevel(value: number | null | undefined): CrowdLevel | undefined {
  if (value === null || value === undefined) return undefined;
  if (value < 40) return 'low';
  if (value < 70) return 'mid';
  return 'high';
}
