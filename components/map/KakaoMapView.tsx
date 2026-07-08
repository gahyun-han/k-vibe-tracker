'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Place } from '@/components/map/PlaceDetailModal';
import { buildMapPinAccessibleLabel } from '@/lib/features';
import {
  KAKAO_MAP_KEY,
  loadKakaoMaps,
  type KakaoCustomOverlay,
  type KakaoMap,
  type KakaoMapsApi,
} from '@/components/map/kakaoLoader';

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
  fitToPlaces?: boolean;
}

const PIN_BASE_CLASS =
  'whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3A5C]/70';
const PIN_SELECTED_CLASS = 'border-[#FF3A5C] bg-[#FF3A5C] text-white';
const PIN_DEFAULT_CLASS = 'border-white/20 bg-[#1A1A2E]/90 text-white/85 hover:border-[#FF3A5C]/70';

function pinPosition(place: Place, center: Coordinates) {
  const lngOffset = (place.lng - center.lng) * 2600;
  const latOffset = (center.lat - place.lat) * 3600;
  const x = Math.max(8, Math.min(92, 50 + lngOffset));
  const y = Math.max(10, Math.min(88, 50 + latOffset));
  return { left: `${x}%`, top: `${y}%` };
}

function categoryLabelFor(category: string, labels: Readonly<Partial<Record<string, string>>>) {
  return labels[category] ?? labels['spot'] ?? category;
}

function pinClassName(selected: boolean) {
  return `${PIN_BASE_CLASS} ${selected ? PIN_SELECTED_CLASS : PIN_DEFAULT_CLASS}`;
}

function createKakaoPinContent({
  categoryLabel,
  distanceLabel,
  pinLabel,
  selected,
  onClick,
}: {
  categoryLabel: string;
  distanceLabel: string;
  pinLabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = pinClassName(selected);
  button.setAttribute('aria-label', pinLabel);
  button.title = pinLabel;

  const category = document.createElement('span');
  category.className = 'mr-1';
  category.textContent = categoryLabel;
  button.append(category);
  button.append(document.createTextNode(distanceLabel));
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  return button;
}

export function KakaoMapView({
  center,
  places,
  selectedPlaceId,
  onSelectPlace,
  formatDistance,
  categoryLabels,
  fitToPlaces = false,
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const mapsRef = useRef<KakaoMapsApi | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const initialCenterRef = useRef(center);
  const [mode, setMode] = useState<'fallback' | 'loading' | 'ready'>(
    KAKAO_MAP_KEY ? 'loading' : 'fallback',
  );
  const [nativePinLayer, setNativePinLayer] = useState(false);

  const visiblePins = useMemo(() => places.slice(0, 16), [places]);
  const boundsKey = useMemo(
    () => visiblePins.map((place) => `${place.lat.toFixed(5)},${place.lng.toFixed(5)}`).join('|'),
    [visiblePins],
  );

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
        const nextCenter = new maps.LatLng(initialCenterRef.current.lat, initialCenterRef.current.lng);
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
    if (!maps || !map || fitToPlaces) return;

    map.setCenter(new maps.LatLng(center.lat, center.lng));
  }, [center.lat, center.lng, fitToPlaces]);

  // Fit the viewport to include every visible place (used for route views).
  useEffect(() => {
    if (mode !== 'ready' || !fitToPlaces) return;
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !map.setBounds || visiblePins.length === 0) return;

    if (visiblePins.length === 1) {
      const only = visiblePins[0]!;
      map.setCenter(new maps.LatLng(only.lat, only.lng));
      map.setLevel?.(5);
      return;
    }

    const bounds = new maps.LatLngBounds();
    visiblePins.forEach((place) => bounds.extend(new maps.LatLng(place.lat, place.lng)));
    map.setBounds(bounds);
  }, [boundsKey, fitToPlaces, mode, visiblePins]);

  useEffect(() => {
    if (mode !== 'ready' || !containerRef.current) return;

    let frame = 0;
    const relayout = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const maps = mapsRef.current;
        const map = mapRef.current;
        if (!maps || !map) return;
        map.relayout?.();
        if (!fitToPlaces) map.setCenter(new maps.LatLng(center.lat, center.lng));
      });
    };

    relayout();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(relayout);
    observer?.observe(containerRef.current);
    window.addEventListener('resize', relayout);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', relayout);
    };
  }, [center.lat, center.lng, fitToPlaces, mode]);

  useEffect(() => {
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    const maps = mapsRef.current;
    const map = mapRef.current;
    if (mode !== 'ready' || !maps?.CustomOverlay || !map) {
      setNativePinLayer(false);
      return;
    }

    const overlays = visiblePins.map((place) => {
      const selected = selectedPlaceId === place.id;
      const categoryLabel = categoryLabelFor(place.category, categoryLabels);
      const distanceLabel = formatDistance(place.distanceM);
      const pinLabel = buildMapPinAccessibleLabel(place.name, categoryLabel, distanceLabel);
      const content = createKakaoPinContent({
        categoryLabel,
        distanceLabel,
        pinLabel,
        selected,
        onClick: () => onSelectPlace(place),
      });
      const overlay = new maps.CustomOverlay!({
        position: new maps.LatLng(place.lat, place.lng),
        content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: selected ? 20 : 10,
        clickable: true,
      });
      overlay.setMap(map);
      return overlay;
    });

    overlaysRef.current = overlays;
    setNativePinLayer(true);

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null));
      if (overlaysRef.current === overlays) overlaysRef.current = [];
    };
  }, [categoryLabels, formatDistance, mode, onSelectPlace, selectedPlaceId, visiblePins]);

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

      {(!nativePinLayer || mode !== 'ready') && <div className="pointer-events-none absolute inset-0 z-10">
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
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${pinClassName(selected)}`}
              style={pinPosition(place, center)}
            >
              <span className="mr-1">{categoryLabel}</span>
              {distanceLabel}
            </button>
          );
        })}
      </div>}
    </div>
  );
}
