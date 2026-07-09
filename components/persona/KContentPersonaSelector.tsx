'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { KPersona } from '@/lib/domain';
import type { getUiCopy, UiLocale } from '@/lib/i18n';

type PersonaCopy = ReturnType<typeof getUiCopy>['persona'];

interface PersonaAvatarProps {
  persona: Pick<KPersona, 'badge' | 'profileImg'>;
  label: string;
}

interface KContentPersonaSelectorProps {
  personas: KPersona[];
  locale: UiLocale;
  copy: PersonaCopy;
  onSelectPersona: (personaId: string) => void;
}

function PersonaAvatar({ persona, label }: PersonaAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (persona.profileImg && !imageFailed) {
    return (
      <Image
        src={persona.profileImg}
        alt={`${label} profile`}
        width={40}
        height={40}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF3A5C]/15 text-xs font-bold text-[#FF3A5C]">
      {persona.badge}
    </div>
  );
}

function pickPersonaText(text: KPersona['label'], locale: UiLocale) {
  return locale === 'ko' ? text.ko : text.en;
}

export function KContentPersonaSelector({
  personas,
  locale,
  copy,
  onSelectPersona,
}: KContentPersonaSelectorProps) {
  return (
    <div className="rounded-xl border border-[#FF3A5C]/25 bg-[#FF3A5C]/[0.06] p-3">
      <p className="text-xs font-semibold text-[#FF3A5C]">{copy.kContentEyebrow}</p>
      <h3 className="mt-0.5 text-base font-bold text-white">{copy.kContentTitle}</h3>
      <p className="mt-1 text-xs leading-5 text-white/45">{copy.kContentSubtitle}</p>
      <div className="mt-3 space-y-2">
        {personas.map((persona) => {
          const label = pickPersonaText(persona.label, locale);
          const description = pickPersonaText(persona.description, locale);
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0D0D1A] p-3 text-left transition-all hover:border-[#FF3A5C]/60 hover:bg-[#FF3A5C]/10"
            >
              <PersonaAvatar persona={persona} label={label} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{label}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                    {persona.routeCnt}
                    {copy.kContentStopsSuffix}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/40">{description}</p>
              </div>
              <ChevronRight size={16} className="ml-auto shrink-0 text-white/30" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
