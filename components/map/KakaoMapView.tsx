'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Place } from '@/components/map/PlaceDetailModal';
import { buildMapPinAccessibleLabel } from '@/lib/map-pin-accessibility';

interface Coordinates {
  lat: number;
  lng: number;
}

interface KakaoMapViewProps {
  center: Coordinates;
  places: (Place & { distanceM?: number })[];
  selectedPlaceId?: string;
  onSelectPlace: (place: Place & { distanceM?: number }) => void;
  formatDistance: (meters?: number) => string;
  categoryLabels: Readonly<Partial<Record<string, string>>>;
}

type KakaoLatLng = new (lat: number, lng: number) => unknown;
type KakaoMap = {
  setCenter: (latLng: unknown) => void;
};

interface KakaoMapsApi {
  load: (callback: () => void) => void;
  LatLng: KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMap;
}

declare global {
  interface Window {
    kakao?: {
      maps?: KakaoMapsApi;
    };
  }
}

const KAKAO_SCRIPT_ID = 'kakao-map-sdk';
const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

function pinPosition(place: Place, center: Coordinates) {
  const lngOffset = (place.lng - center.lng) * 2600;
  const latOffset = (center.lat - place.lat) * 3600;
  const x = Math.max(8, Math.min(92, 50 + lngOffset));
  const y = Math.max(10, Math.min(88, 50 + latOffset));
  return { left: `${x}%`, top: `${y}%` };
}

function categoryLabelFor(category: string, labels: Readonly<Partial<Record<string, string>>>) {
  return labels[category] ?? labels.spot ?? category;
}

function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao!.maps!));
      return;
    }

    const existing = document.getElementById(KAKAO_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.kakao?.maps) window.kakao.maps.load(() => resolve(window.kakao!.maps!));
        else reject(new Error('KAKAO_MAPS_MISSING'));
      }, { once: true });
      existing.addEventListener('error', () => reject(new Error('KAKAO_MAPS_LOAD_FAILED')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.onload = () => {
      if (window.kakao?.maps) window.kakao.maps.load(() => resolve(window.kakao!.maps!));
      else reject(new Error('KAKAO_MAPS_MISSING'));
    };
    script.onerror = () => reject(new Error('KAKAO_MAPS_LOAD_FAILED'));
    document.head.appendChild(script);
  });
}

export function KakaoMapView({
  center,
  places,
  selectedPlaceId,
  onSelectPlace,
  formatDistance,
  categoryLabels,
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const mapsRef = useRef<KakaoMapsApi | null>(null);
  const [mode, setMode] = useState<'fallback' | 'loading' | 'ready'>(
    KAKAO_MAP_KEY ? 'loading' : 'fallback',
  );

  const visiblePins = useMemo(() => places.slice(0, 16), [places]);

  useEffect(() => {
    if (!KAKAO_MAP_KEY || !containerRef.current) {
      setMode('fallback');
      return;
    }

    let active = true;
    setMode('loading');

    loadKakaoMaps(KAKAO_MAP_KEY)
      .then((maps) => {
        if (!active || !containerRef.current) return;
        mapsRef.current = maps;
        const nextCenter = new maps.LatLng(center.lat, center.lng);
        mapRef.current = new maps.Map(containerRef.current, {
          center: nextCenter,
          level: 5,
        });
        setMode('ready');
      })
      .catch(() => {
        if (active) setMode('fallback');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;

    map.setCenter(new maps.LatLng(center.lat, center.lng));
  }, [center.lat, center.lng]);

  return (
    <div className="absolute inset-0" data-map-mode={mode}>
      <div
        ref={containerRef}
        className={`absolute inset-0 bg-[#101827] transition-opacity ${mode === 'ready' ? 'opacity-100' : 'opacity-0'}`}
      />

      {mode !== 'ready' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,58,92,0.20),transparent_32%),radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.14),transparent_24%)]" />
        </>
      )}

      <div className="pointer-events-none absolute inset-0 z-10">
        {visiblePins.map((place) => {
          const selected = selectedPlaceId === place.id;
          const categoryLabel = categoryLabelFor(place.category, categoryLabels);
          const distanceLabel = formatDistance(place.distanceM);
          const pinLabel = buildMapPinAccessibleLabel(place.name, categoryLabel, distanceLabel);
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place)}
              aria-label={pinLabel}
              title={pinLabel}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-all ${
                selected
                  ? 'border-[#FF3A5C] bg-[#FF3A5C] text-white'
                  : 'border-white/20 bg-[#1A1A2E]/90 text-white/85 hover:border-[#FF3A5C]/70'
              }`}
              style={pinPosition(place, center)}
            >
              <span className="mr-1">{categoryLabel}</span>
              {distanceLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
