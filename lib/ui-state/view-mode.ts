export const VIEW_MODE_STORAGE_KEY = 'k-vibe-view-mode';
export const VIEW_MODE_CHANGE_EVENT = 'k-vibe-view-mode-change';

export const VIEW_MODES = ['mobile', 'desktop'] as const;

export type ViewMode = (typeof VIEW_MODES)[number];

export function normalizeViewMode(value: unknown): ViewMode {
  return value === 'desktop' ? 'desktop' : 'mobile';
}

export function getInitialViewMode(width: number, storedValue?: unknown): ViewMode {
  if (storedValue === 'mobile' || storedValue === 'desktop') {
    return storedValue;
  }

  return width >= 1024 ? 'desktop' : 'mobile';
}
