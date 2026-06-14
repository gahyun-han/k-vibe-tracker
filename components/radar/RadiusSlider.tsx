'use client';

interface RadiusSliderProps {
  value: number; // meters
  onChange: (v: number) => void;
}

const STEPS = [300, 500, 800, 1000, 1500];

export function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">반경</span>
        <span className="text-xs font-semibold text-[#FF3A5C]">
          {value >= 1000 ? `${value / 1000}km` : `${value}m`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        value={STEPS.indexOf(value) === -1 ? 1 : STEPS.indexOf(value)}
        onChange={(e) => onChange(STEPS[Number(e.target.value)])}
        className="w-full accent-[#FF3A5C] h-1.5 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-white/30">
        {STEPS.map((s) => (
          <span key={s}>{s >= 1000 ? `${s / 1000}k` : s}</span>
        ))}
      </div>
    </div>
  );
}
