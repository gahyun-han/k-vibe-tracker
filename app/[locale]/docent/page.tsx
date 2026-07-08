'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Captions, LocateFixed, MapPin, Mic2, Navigation, Pause, Play, RotateCcw, Square, VolumeX } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import {
  buildDocentScriptSections,
  getDocentSectionIndexForChar,
  joinDocentScript,
  shouldAutoPlayDocentAfterProximityCheck,
} from '@/lib/domain';
import { haversineKm } from '@/lib/features';
import { getDocentProximityCopy, getUiCopy, normalizeUiLocale, type UiLocale } from '@/lib/ui-copy';

interface DocentPlace {
  name: string;
  category: string;
  address: string;
  description: string;
  stayMinutes: string;
  startTime: string;
  tags: string[];
  lat: number | null;
  lng: number | null;
}

type ProximityStatus = 'idle' | 'checking' | 'near' | 'far' | 'unavailable' | 'unsupported' | 'denied' | 'timeout' | 'error';

const DOCENT_RADIUS_METERS = 100;

const SPEECH_LANG: Record<UiLocale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

function getQueryValue(search: { get: (key: string) => string | null }, key: string, fallback: string) {
  const value = search.get(key)?.trim();
  return value ? value : fallback;
}

function getQueryNumber(search: { get: (key: string) => string | null }, key: string) {
  const rawValue = search.get(key)?.trim();
  if (!rawValue) return null;

  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function formatDistanceMeters(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(distanceMeters >= 10000 ? 0 : 1)}km`;
  }
  return `${Math.max(0, Math.round(distanceMeters))}m`;
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
  const proximityCopy = getDocentProximityCopy(locale);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [proximityStatus, setProximityStatus] = useState<ProximityStatus>('idle');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

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
      lat: getQueryNumber(searchParams, 'lat'),
      lng: getQueryNumber(searchParams, 'lng'),
    };
  }, [copy.docent.defaultDescription, copy.docent.fallbackAddress, copy.docent.fallbackCategory, copy.docent.fallbackName, searchParams]);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    setProximityStatus(place.lat === null || place.lng === null ? 'unavailable' : 'idle');
    setDistanceMeters(null);
  }, [place.lat, place.lng]);

  const scriptSections = useMemo(() => buildDocentScriptSections(place, copy.docent), [copy.docent, place]);
  const script = useMemo(() => joinDocentScript(scriptSections), [scriptSections]);

  useEffect(() => {
    setActiveSectionIndex(0);
  }, [script]);

  useEffect(() => {
    if (!speaking) return;

    sectionRefs.current[activeSectionIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeSectionIndex, speaking]);

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
      setActiveSectionIndex(0);
    };
    utterance.onpause = () => setPaused(true);
    utterance.onresume = () => setPaused(false);
    utterance.onboundary = (event) => {
      setActiveSectionIndex(getDocentSectionIndexForChar(scriptSections, event.charIndex));
    };
    utterance.onend = () => {
      setActiveSectionIndex(Math.max(0, scriptSections.length - 1));
      resetSpeechState();
    };
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
    setActiveSectionIndex(0);
  }

  function replayScript() {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    resetSpeechState();
    window.setTimeout(playScript, 0);
  }

  function checkProximity() {
    if (place.lat === null || place.lng === null) {
      setProximityStatus('unavailable');
      setDistanceMeters(null);
      return;
    }

    if (!('geolocation' in navigator)) {
      setProximityStatus('unsupported');
      setDistanceMeters(null);
      return;
    }

    setProximityStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextDistanceMeters =
          haversineKm(position.coords.latitude, position.coords.longitude, place.lat as number, place.lng as number) * 1000;
        const isNearby = nextDistanceMeters <= DOCENT_RADIUS_METERS;
        setDistanceMeters(nextDistanceMeters);
        setProximityStatus(isNearby ? 'near' : 'far');

        if (shouldAutoPlayDocentAfterProximityCheck({ isNearby, speechSupported, speaking, paused })) {
          playScript();
          return;
        }

        if (!isNearby && (speaking || paused)) {
          stopScript();
        }
      },
      (error) => {
        setDistanceMeters(null);
        if (error.code === error.PERMISSION_DENIED) {
          setProximityStatus('denied');
          return;
        }
        if (error.code === error.TIMEOUT) {
          setProximityStatus('timeout');
          return;
        }
        setProximityStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  const isActive = speaking && !paused;
  const primaryLabel = paused ? copy.docent.resume : copy.docent.play;
  const hasCoordinates = place.lat !== null && place.lng !== null;
  const activeSection = scriptSections[activeSectionIndex] ?? scriptSections[0];
  const scriptProgressPercent = scriptSections.length > 0
    ? Math.round(((activeSectionIndex + 1) / scriptSections.length) * 100)
    : 0;
  const scriptProgressValue = copy.docent.progressValue
    .replace('{current}', String(activeSectionIndex + 1))
    .replace('{total}', String(scriptSections.length));
  const proximityMessage = (() => {
    switch (proximityStatus) {
      case 'near':
        return proximityCopy.ready;
      case 'far':
        return proximityCopy.far;
      case 'unavailable':
        return proximityCopy.noCoordinates;
      case 'unsupported':
        return proximityCopy.unsupported;
      case 'denied':
        return proximityCopy.denied;
      case 'timeout':
        return proximityCopy.timeout;
      case 'error':
        return proximityCopy.error;
      default:
        return '';
    }
  })();
  const proximityTone =
    proximityStatus === 'near'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
      : proximityStatus === 'far' || proximityStatus === 'denied' || proximityStatus === 'timeout' || proximityStatus === 'error'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
        : 'border-white/10 bg-white/5 text-white/55';

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

        <section className={`mx-4 rounded-2xl border p-4 ${proximityTone}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              {proximityStatus === 'near' ? <Navigation size={17} /> : <LocateFixed size={17} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{proximityCopy.title}</p>
              <p className="mt-0.5 text-xs text-current/70">{proximityCopy.radiusLabel}</p>
              {distanceMeters !== null && (
                <p className="mt-2 text-xs font-semibold text-white">
                  {proximityCopy.distanceLabel.replace('{distance}', formatDistanceMeters(distanceMeters))}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={checkProximity}
              disabled={!hasCoordinates || proximityStatus === 'checking'}
              className="min-h-10 shrink-0 rounded-xl bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-45"
            >
              {proximityStatus === 'checking' ? proximityCopy.checking : proximityCopy.checkButton}
            </button>
          </div>

          {proximityMessage && (
            <div className="mt-3 flex items-start gap-2 text-xs leading-5" aria-live="polite">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{proximityMessage}</span>
            </div>
          )}
        </section>

        <section className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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

          <div className="mt-3 rounded-xl bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-white/55">{copy.docent.progressLabel}</span>
              <span className="shrink-0 font-semibold text-[#FF8BA0]">{scriptProgressValue}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[#FF3A5C] transition-all duration-300"
                style={{ width: `${scriptProgressPercent}%` }}
              />
            </div>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Captions size={16} className="text-[#FF3A5C]" />
              {copy.docent.captionTitle}
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/45">
              {copy.docent.textOnly}
            </span>
          </div>

          {activeSection && (
            <div className="mt-3 border-l-2 border-[#FF3A5C] bg-[#FF3A5C]/10 py-3 pl-3 pr-2">
              <p className="text-[11px] font-semibold uppercase text-[#FF8BA0]">{activeSection.title}</p>
              <p className="mt-1 text-sm leading-7 text-white">{activeSection.text}</p>
            </div>
          )}

          <div className="mt-3 max-h-72 divide-y divide-white/10 overflow-y-auto pr-1" aria-label={copy.docent.captionTitle}>
            {scriptSections.map((section, index) => {
              const active = index === activeSectionIndex;
              return (
                <div
                  key={section.id}
                  ref={(node) => {
                    sectionRefs.current[index] = node;
                  }}
                  aria-current={active ? 'step' : undefined}
                  className={`border-l-2 py-3 pl-3 transition-colors ${
                    active ? 'border-[#FF3A5C] text-white' : 'border-white/10 text-white/55'
                  }`}
                >
                  <p className={`text-xs font-semibold ${active ? 'text-[#FF8BA0]' : 'text-white/45'}`}>{section.title}</p>
                  <p className="mt-1 text-sm leading-7">{section.text}</p>
                </div>
              );
            })}
          </div>

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
