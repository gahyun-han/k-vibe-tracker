'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getInitialViewMode,
  normalizeViewMode,
  VIEW_MODE_CHANGE_EVENT,
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from '@/lib/ui-state';

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

    function handleSameTabChange(event: Event) {
      setViewModeState(normalizeViewMode((event as CustomEvent<ViewMode>).detail));
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(VIEW_MODE_CHANGE_EVENT, handleSameTabChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(VIEW_MODE_CHANGE_EVENT, handleSameTabChange);
    };
  }, []);

  const setViewMode = useCallback((nextMode: ViewMode) => {
    setViewModeState(nextMode);
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
    } catch {
      // View mode is a preference only; storage failures should not block rendering.
    }
    window.dispatchEvent(new CustomEvent(VIEW_MODE_CHANGE_EVENT, { detail: nextMode }));
  }, []);

  return { viewMode, setViewMode };
}
