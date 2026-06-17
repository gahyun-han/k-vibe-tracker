'use client';

import { Monitor, Smartphone } from 'lucide-react';
import { getUiCopy, type UiLocale } from '@/lib/ui-copy';
import type { ViewMode } from '@/lib/view-mode';

interface ViewModeToggleProps {
  locale: UiLocale;
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  compact?: boolean;
}

export function ViewModeToggle({ locale, mode, onChange, compact = false }: ViewModeToggleProps) {
  const copy = getUiCopy(locale).common;
  const options = [
    {
      id: 'mobile' as const,
      icon: Smartphone,
      label: copy.mobileView,
      ariaLabel: copy.switchToMobileView,
    },
    {
      id: 'desktop' as const,
      icon: Monitor,
      label: copy.desktopView,
      ariaLabel: copy.switchToDesktopView,
    },
  ];

  return (
    <div
      role="group"
      aria-label={copy.changeViewMode}
      className={`grid shrink-0 grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-0.5 ${
        compact ? 'w-[76px]' : 'w-full max-w-[220px]'
      }`}
    >
      {options.map(({ id, icon: Icon, label, ariaLabel }) => {
        const active = mode === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={ariaLabel}
            aria-pressed={active}
            title={label}
            className={`flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors ${
              active
                ? 'bg-[#FF3A5C] text-white shadow-sm shadow-[#FF3A5C]/20'
                : 'text-white/55 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {!compact && <span className="truncate">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
