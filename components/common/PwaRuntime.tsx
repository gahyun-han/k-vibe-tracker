'use client';

import { useEffect } from 'react';

const SUPPORTED_RUNTIME_LOCALES = new Set(['ko', 'en', 'ja', 'zh']);

function normalizeRuntimeLocale(locale: string) {
  return SUPPORTED_RUNTIME_LOCALES.has(locale) ? locale : 'ko';
}

export default function PwaRuntime({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = normalizeRuntimeLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Keep PWA registration best-effort so app startup never depends on it.
    });
  }, []);

  return null;
}
