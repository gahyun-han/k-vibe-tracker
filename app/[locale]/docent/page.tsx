'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Captions, MapPin, Mic2, Pause, Play, RotateCcw, Square, VolumeX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { getUiCopy, normalizeUiLocale, type UiLocale } from '@/lib/ui-copy';

interface DocentPlace {
  name: string;
  category: string;
  address: string;
  description: string;
  stayMinutes: string;
  startTime: string;
  tags: string[];
}

const SPEECH_LANG: Record<UiLocale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

function formatTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function getQueryValue(search: { get: (key: string) => string | null }, key: string, fallback: string) {
  const value = search.get(key)?.trim();
  return value ? value : fallback;
}

export default function DocentPage() {
  return (
    <Suspense fallback={null}>
      <DocentContent />
    </Suspense>
  );
}

function DocentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const place = useMemo<DocentPlace>(() => {
    const tags = getQueryValue(searchParams, 'tags', '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      name: getQueryValue(searchParams, 'name', copy.docent.fallbackName),
      category: getQueryValue(searchParams, 'category', copy.docent.fallbackCategory),
      address: getQueryValue(searchParams, 'address', copy.docent.fallbackAddress),
      description: getQueryValue(searchParams, 'description', copy.docent.defaultDescription),
      stayMinutes: getQueryValue(searchParams, 'stayMinutes', '30'),
      startTime: getQueryValue(searchParams, 'startTime', ''),
      tags,
    };
  }, [copy.docent.defaultDescription, copy.docent.fallbackAddress, copy.docent.fallbackCategory, copy.docent.fallbackName, searchParams]);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const script = useMemo(() => {
    const values = {
      name: place.name,
      category: place.category,
      address: place.address,
      description: place.description,
      stayMinutes: place.stayMinutes,
      tags: place.tags.join(', '),
    };

    return [
      formatTemplate(copy.docent.scriptIntro, values),
      formatTemplate(copy.docent.scriptBody, values),
      place.tags.length > 0 ? formatTemplate(copy.docent.scriptTags, values) : '',
      copy.docent.scriptOutro,
    ]
      .filter(Boolean)
      .join(' ');
  }, [copy.docent.scriptBody, copy.docent.scriptIntro, copy.docent.scriptOutro, copy.docent.scriptTags, place]);

  function resetSpeechState() {
    setSpeaking(false);
    setPaused(false);
    utteranceRef.current = null;
  }

  function playScript() {
    if (!speechSupported) return;

    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = SPEECH_LANG[locale];
    utterance.rate = locale === 'en' ? 0.95 : 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utterance.onpause = () => setPaused(true);
    utterance.onresume = () => setPaused(false);
    utterance.onend = resetSpeechState;
    utterance.onerror = resetSpeechState;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function pauseScript() {
    if (!speechSupported || !speaking) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }

  function stopScript() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    resetSpeechState();
  }

  function replayScript() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    resetSpeechState();
    window.setTimeout(playScript, 0);
  }

  const isActive = speaking && !paused;
  const primaryLabel = paused ? copy.docent.resume : copy.docent.play;

  return (
    <AppLayout activeTab="route" title={copy.docent.title} showBack>
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
        <section className="px-4 pb-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#FF3A5C]">{copy.docent.eyebrow}</p>
              <h2 className="mt-1 text-xl font-bold leading-7 text-white">{place.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">{place.category}</span>
                {place.startTime && <span>{place.startTime}</span>}
                <span>{place.stayMinutes}min</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
              <Mic2 size={13} className="text-[#FF3A5C]" />
              {copy.docent.localMode}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/45">
            <MapPin size={14} className="mt-0.5 shrink-0 text-white/35" />
            <span>{place.address}</span>
          </div>
        </section>

        <section className="mx-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex h-32 items-center justify-center gap-1.5 rounded-xl bg-[#111123] px-3">
            {Array.from({ length: 28 }).map((_, index) => {
              const height = 18 + ((index * 11) % 46);
              return (
                <span
                  key={index}
                  className={`w-1 rounded-full bg-[#FF3A5C] transition-opacity ${
                    isActive ? 'animate-pulse opacity-90' : 'opacity-35'
                  }`}
                  style={{
                    height,
                    animationDelay: `${index * 45}ms`,
                    animationDuration: `${700 + (index % 5) * 120}ms`,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-2">
            <button
              type="button"
              onClick={playScript}
              disabled={!speechSupported || (speaking && !paused)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e] disabled:opacity-45"
            >
              <Play size={16} />
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={pauseScript}
              disabled={!speechSupported || !speaking || paused}
              aria-label={copy.docent.pause}
              title={copy.docent.pause}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/65 transition-colors hover:bg-white/20 disabled:opacity-35"
            >
              <Pause size={16} />
            </button>
            <button
              type="button"
              onClick={stopScript}
              disabled={!speechSupported || (!speaking && !paused)}
              aria-label={copy.docent.stop}
              title={copy.docent.stop}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/65 transition-colors hover:bg-white/20 disabled:opacity-35"
            >
              <Square size={15} />
            </button>
            <button
              type="button"
              onClick={replayScript}
              disabled={!speechSupported}
              aria-label={copy.docent.replay}
              title={copy.docent.replay}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/65 transition-colors hover:bg-white/20 disabled:opacity-35"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {!speechSupported && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/50">
              <VolumeX size={15} className="mt-0.5 shrink-0 text-[#FF3A5C]" />
              <span>{copy.docent.audioUnavailable}</span>
            </div>
          )}
        </section>

        <section className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Captions size={16} className="text-[#FF3A5C]" />
            {copy.docent.captionTitle}
          </div>
          <p className="mt-3 text-sm leading-7 text-white/70">{script}</p>
          {place.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {place.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/50">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/route`)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copy.docent.backToRoute}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
