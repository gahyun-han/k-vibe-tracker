'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Place } from '@/components/map/PlaceDetailModal';

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
  categoryIcon: Record<string, string>;
}

type KakaoLatLng = new (lat: number, lng: number) => unknown;
type KakaoMap = {
  setCenter: (latLng: unknown) => void;
};
type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
};

interface KakaoMapsApi {
  load: (callback: () => void) => void;
  LatLng: KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMap;
  CustomOverlay: new (options: {
    position: unknown;
    content: HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlay;
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

function makeOverlayButton({
  place,
  selected,
  label,
  onClick,
}: {
  place: Place & { distanceM?: number };
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('aria-label', place.name);
  button.style.border = selected ? '1px solid #FF3A5C' : '1px solid rgba(255,255,255,0.24)';
  button.style.borderRadius = '999px';
  button.style.background = selected ? '#FF3A5C' : 'rgba(26,26,46,0.94)';
  button.style.color = '#ffffff';
  button.style.fontSize = '11px';
  button.style.fontWeight = '700';
  button.style.padding = '5px 9px';
  button.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)';
  button.style.cursor = 'pointer';
  button.style.whiteSpace = 'nowrap';
  button.onclick = onClick;
  return button;
}

export function KakaoMapView({
  center,
  places,
  selectedPlaceId,
  onSelectPlace,
  formatDistance,
  categoryIcon,
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const mapsRef = useRef<KakaoMapsApi | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const [mode, setMode] = useState<'fallback' | 'loading' | 'ready'>(
    KAKAO_MAP_KEY ? 'loading' : 'fallback',
  );

  const fallbackPins = useMemo(() => places.slice(0, 16), [places]);

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

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || mode !== 'ready') return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = places.slice(0, 30).map((place) => {
      const selected = selectedPlaceId === place.id;
      const label = `${categoryIcon[place.category] ?? 'Spot'} ${formatDistance(place.distanceM)}`.trim();
      const content = makeOverlayButton({
        place,
        selected,
        label,
        onClick: () => onSelectPlace(place),
      });
      const overlay = new maps.CustomOverlay({
        position: new maps.LatLng(place.lat, place.lng),
        content,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: selected ? 20 : 10,
      });
      overlay.setMap(map);
      return overlay;
    });

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
    };
  }, [categoryIcon, formatDistance, mode, onSelectPlace, places, selectedPlaceId]);

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
          {fallbackPins.map((place) => {
            const selected = selectedPlaceId === place.id;
            return (
              <button
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-all ${
                  selected
                    ? 'border-[#FF3A5C] bg-[#FF3A5C] text-white'
                    : 'border-white/20 bg-[#1A1A2E]/90 text-white/85 hover:border-[#FF3A5C]/70'
                }`}
                style={pinPosition(place, center)}
              >
                <span className="mr-1">{categoryIcon[place.category] ?? 'Spot'}</span>
                {formatDistance(place.distanceM)}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
