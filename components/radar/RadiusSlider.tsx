'use client';

interface RadiusSliderProps {
  value: number;
  onChange: (v: number) => void;
}

const STEPS = [300, 500, 800, 1000, 1500];

function formatRadius(value: number) {
  return value >= 1000 ? `${value / 1000}km` : `${value}m`;
}

export function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  const currentIndex = STEPS.indexOf(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">Radius</span>
        <span className="text-xs font-semibold text-[#FF3A5C]">
          {formatRadius(value)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        value={currentIndex === -1 ? 1 : currentIndex}
        onChange={(e) => onChange(STEPS[Number(e.target.value)])}
        className="h-1.5 w-full cursor-pointer rounded-full accent-[#FF3A5C]"
      />
      <div className="flex justify-between text-[10px] text-white/30">
        {STEPS.map((step) => (
          <span key={step}>{formatRadius(step)}</span>
        ))}
      </div>
    </div>
  );
}
