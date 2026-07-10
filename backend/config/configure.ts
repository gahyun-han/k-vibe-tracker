export const backendConfig = {
  tourApiTimeoutMs: 8_000,
  aiWorkerTimeoutMs: 15_000,
  places: {
    defaultRadius: 1_000,
    maxRadius: 20_000,
  },
  facilities: {
    defaultRadius: 500,
    maxRadius: 3_000,
    festivalLookaheadDays: 90,
  },
} as const;
