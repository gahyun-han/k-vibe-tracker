'use client';

import { RADAR_RADIUS_STEPS } from '@/lib/cache';

interface RadiusSliderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}

function formatRadius(value: number) {
  return value >= 1000 ? `${value / 1000}km` : `${value}m`;
}

export function RadiusSlider({ value, onChange, label = 'Radius' }: RadiusSliderProps) {
  const currentIndex = RADAR_RADIUS_STEPS.indexOf(value as (typeof RADAR_RADIUS_STEPS)[number]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-semibold text-[#FF3A5C]">
          {formatRadius(value)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={RADAR_RADIUS_STEPS.length - 1}
        value={currentIndex === -1 ? 1 : currentIndex}
        onChange={(e) => onChange(RADAR_RADIUS_STEPS[Number(e.target.value)])}
        className="h-1.5 w-full cursor-pointer rounded-full accent-[#FF3A5C]"
      />
      <div className="flex justify-between text-[10px] text-white/30">
        {RADAR_RADIUS_STEPS.map((step) => (
          <span key={step}>{formatRadius(step)}</span>
        ))}
      </div>
    </div>
  );
}
