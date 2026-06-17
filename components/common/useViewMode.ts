'use client';

import { useCallback, useEffect, useState } from 'react';
import { getInitialViewMode, normalizeViewMode, VIEW_MODE_STORAGE_KEY, type ViewMode } from '@/lib/view-mode';

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>('mobile');

  useEffect(() => {
    setViewModeState(getInitialViewMode(window.innerWidth, window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === VIEW_MODE_STORAGE_KEY) {
        setViewModeState(normalizeViewMode(event.newValue));
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setViewMode = useCallback((nextMode: ViewMode) => {
    setViewModeState(nextMode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
    } catch {
      // View mode is a preference only; storage failures should not block rendering.
    }
  }, []);

  return { viewMode, setViewMode };
}
