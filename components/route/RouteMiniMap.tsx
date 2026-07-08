'use client';

import { MapPinned } from 'lucide-react';
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

export function RouteMiniMap({
  stops,
  title,
  subtitle,
  openStopMapLabel,
  onOpenStopMap,
}: RouteMiniMapProps) {
  const points = buildPreviewPoints(stops);
  if (points.length === 0) return null;

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="absolute left-[18%] top-0 h-full w-px bg-white/10" />
        <div className="absolute left-[57%] top-0 h-full w-px bg-white/10" />
        <div className="absolute left-0 top-[38%] h-px w-full bg-white/10" />
        <div className="absolute left-0 top-[68%] h-px w-full bg-white/10" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
          <polyline
            points={polyline}
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
      </div>
    </section>
  );
}
