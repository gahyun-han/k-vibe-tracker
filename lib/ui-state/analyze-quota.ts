/**
 * Daily analysis quota tracker
 *
 * Stores a per-day counter in localStorage so users can see how many analyses
 * they've run today. Resets automatically at midnight (local time).
 *
 * Note: This is a client-side counter only — it cannot query the actual
 * remaining quota from Google/YouTube (those APIs don't expose it).
 * The free limits are:
 *   Gemini 1.5 Flash:  1,500 requests/day (15 req/min)
 *   YouTube Data API:  10,000 units/day  (each /videos list call = 1 unit)
 */

export const ANALYZE_QUOTA_STORAGE_KEY = 'kvibe:analyze:quota';

/** Soft cap shown as "daily limit" in the UI.  Keep well below the real API limit. */
export const DAILY_SOFT_LIMIT = 50;

interface QuotaRecord {
  date: string; // "YYYY-MM-DD" local time
  count: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Read the current quota record from localStorage. Returns null if unavailable. */
function readRecord(storage: Storage): QuotaRecord | null {
  try {
    const raw = storage.getItem(ANALYZE_QUOTA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'date' in parsed &&
      'count' in parsed &&
      typeof (parsed as QuotaRecord).date === 'string' &&
      typeof (parsed as QuotaRecord).count === 'number'
    ) {
      return parsed as QuotaRecord;
    }
  } catch {
    // corrupted — ignore
  }
  return null;
}

/** Return {used, remaining, isLimitReached} for today without mutating storage. */
export function readQuota(storage: Storage): { used: number; remaining: number; isLimitReached: boolean } {
  const record = readRecord(storage);
  const today = todayKey();
  const used = record?.date === today ? record.count : 0;
  const remaining = Math.max(0, DAILY_SOFT_LIMIT - used);
  return { used, remaining, isLimitReached: remaining === 0 };
}

/** Increment the counter by 1 and return the updated snapshot. */
export function incrementQuota(storage: Storage): { used: number; remaining: number; isLimitReached: boolean } {
  const today = todayKey();
  const existing = readRecord(storage);
  const prevCount = existing?.date === today ? existing.count : 0;
  const newCount = prevCount + 1;

  try {
    const record: QuotaRecord = { date: today, count: newCount };
    storage.setItem(ANALYZE_QUOTA_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage full — silently ignore
  }

  const remaining = Math.max(0, DAILY_SOFT_LIMIT - newCount);
  return { used: newCount, remaining, isLimitReached: remaining === 0 };
}
