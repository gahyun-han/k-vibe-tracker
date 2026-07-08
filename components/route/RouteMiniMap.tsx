'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPinned } from 'lucide-react';
import {
  KAKAO_MAP_KEY,
  loadKakaoMaps,
  type KakaoCustomOverlay,
  type KakaoMap,
  type KakaoMapsApi,
  type KakaoPolyline,
} from '@/components/map/kakaoLoader';
import type { RouteStop } from '@/lib/domain';

interface RouteMiniMapProps {
  stops: RouteStop[];
  title: string;
  subtitle: string;
  openStopMapLabel: string;
  onOpenStopMap: (stop: RouteStop) => void;
}

interface PreviewPoint {
  stop: RouteStop;
  x: number;
  y: number;
}

function buildPreviewPoints(stops: RouteStop[]): PreviewPoint[] {
  if (stops.length === 0) return [];

  const lats = stops.map((stop) => stop.lat);
  const lngs = stops.map((stop) => stop.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.001);
  const lngRange = Math.max(maxLng - minLng, 0.001);

  return stops.map((stop) => ({
    stop,
    x: 12 + ((stop.lng - minLng) / lngRange) * 76,
    y: 14 + ((maxLat - stop.lat) / latRange) * 72,
  }));
}

function createNumberedMarker(index: number, label: string, onClick: () => void) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = label;
  button.setAttribute('aria-label', label);
  button.className =
    'flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#FF3A5C] text-xs font-bold text-white shadow-lg shadow-black/40 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FF3A5C]/70';
  button.textContent = String(index + 1);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return button;
}

export function RouteMiniMap({
  stops,
  title,
  subtitle,
  openStopMapLabel,
  onOpenStopMap,
}: RouteMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const mapsRef = useRef<KakaoMapsApi | null>(null);
  const overlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const polylineRef = useRef<KakaoPolyline | null>(null);
  const onOpenRef = useRef(onOpenStopMap);
  const [mode, setMode] = useState<'fallback' | 'loading' | 'ready'>(
    KAKAO_MAP_KEY ? 'loading' : 'fallback',
  );

  useEffect(() => {
    onOpenRef.current = onOpenStopMap;
  }, [onOpenStopMap]);

  const stopsKey = stops
    .map((stop) => `${stop.id}:${stop.lat.toFixed(5)},${stop.lng.toFixed(5)}`)
    .join('|');

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
        mapRef.current = new maps.Map(containerRef.current, {
          center: new maps.LatLng(37.5665, 126.978),
          level: 6,
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

  // Render numbered markers + polyline and fit the viewport to the stops.
  useEffect(() => {
    if (mode !== 'ready') return;
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    polylineRef.current?.setMap(null);
    polylineRef.current = null;

    const positioned = stops.filter(
      (stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng),
    );
    if (positioned.length === 0) return;

    const path = positioned.map((stop) => new maps.LatLng(stop.lat, stop.lng));

    if (positioned.length > 1 && maps.Polyline) {
      const polyline = new maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: '#FF3A5C',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }

    if (maps.CustomOverlay) {
      overlaysRef.current = positioned.map((stop, index) => {
        const overlay = new maps.CustomOverlay!({
          position: new maps.LatLng(stop.lat, stop.lng),
          content: createNumberedMarker(index, openStopMapLabel.replace('{name}', stop.name), () =>
            onOpenRef.current(stop),
          ),
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: 30,
          clickable: true,
        });
        overlay.setMap(map);
        return overlay;
      });
    }

    if (positioned.length === 1) {
      map.setCenter(path[0]!);
      map.setLevel?.(5);
    } else if (map.setBounds) {
      const bounds = new maps.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      map.setBounds(bounds);
    }

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stopsKey, openStopMapLabel]);

  const points = buildPreviewPoints(stops);
  if (points.length === 0) return null;

  const svgPolyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const showFallback = mode !== 'ready';

  return (
    <section className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-3" aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
        </div>
        <MapPinned size={18} className="shrink-0 text-[#FF3A5C]" />
      </div>

      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#101827]">
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-opacity ${mode === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />

        {showFallback && (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:36px_36px]" />
            <div className="absolute left-[18%] top-0 h-full w-px bg-white/10" />
            <div className="absolute left-[57%] top-0 h-full w-px bg-white/10" />
            <div className="absolute left-0 top-[38%] h-px w-full bg-white/10" />
            <div className="absolute left-0 top-[68%] h-px w-full bg-white/10" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
              <polyline
                points={svgPolyline}
                fill="none"
                stroke="#FF3A5C"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
            </svg>

            {points.map((point, index) => (
              <button
                key={point.stop.id}
                type="button"
                onClick={() => onOpenStopMap(point.stop)}
                aria-label={openStopMapLabel.replace('{name}', point.stop.name)}
                title={point.stop.name}
                className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#FF3A5C] text-xs font-bold text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                {index + 1}
              </button>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
