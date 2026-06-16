'use client';

export type CrowdLevel = 'low' | 'mid' | 'high';

interface Props {
  level: CrowdLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  labels?: Readonly<Record<CrowdLevel, string>>;
}

const CFG: Record<CrowdLevel, { label: string; dot: string; text: string; bg: string }> = {
  low: { label: 'Quiet', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  mid: { label: 'Normal', dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  high: { label: 'Busy', dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-400/10' },
};

export function CrowdBadge({ level, showLabel = true, size = 'md', labels }: Props) {
  const c = CFG[level];
  const px = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${px} ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {showLabel && (labels?.[level] ?? c.label)}
    </span>
  );
}

export function CrowdTrafficLight({ level }: { level: CrowdLevel }) {
  const c = CFG[level];
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`h-3 w-3 rounded-full ${level === 'high' ? c.dot : 'bg-white/10'}`} />
      <div className={`h-3 w-3 rounded-full ${level === 'mid' ? c.dot : 'bg-white/10'}`} />
      <div className={`h-3 w-3 rounded-full ${level === 'low' ? c.dot : 'bg-white/10'}`} />
    </div>
  );
}
