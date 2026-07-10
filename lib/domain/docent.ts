export type DocentScriptSectionId = 'intro' | 'body' | 'tags' | 'outro';

export interface DocentScriptPlace {
  name: string;
  category: string;
  address: string;
  description: string;
  stayMinutes: string;
  tags: string[];
}

export interface DocentScriptCopy {
  sectionIntroTitle: string;
  sectionBodyTitle: string;
  sectionTagsTitle: string;
  sectionOutroTitle: string;
  scriptIntro: string;
  scriptBody: string;
  scriptTags: string;
  scriptOutro: string;
}

export interface DocentScriptSection {
  id: DocentScriptSectionId;
  title: string;
  text: string;
  startIndex: number;
}

export interface DocentAutoPlayState {
  isNearby: boolean;
  speechSupported: boolean;
  speaking: boolean;
  paused: boolean;
}

function formatTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export function buildDocentScriptSections(place: DocentScriptPlace, copy: DocentScriptCopy): DocentScriptSection[] {
  const values = {
    name: place.name,
    category: place.category,
    address: place.address,
    description: place.description,
    stayMinutes: place.stayMinutes,
    tags: place.tags.join(', '),
  };

  const sections = [
    {
      id: 'intro' as const,
      title: copy.sectionIntroTitle,
      text: formatTemplate(copy.scriptIntro, values),
    },
    {
      id: 'body' as const,
      title: copy.sectionBodyTitle,
      text: formatTemplate(copy.scriptBody, values),
    },
    ...(place.tags.length > 0
      ? [
          {
            id: 'tags' as const,
            title: copy.sectionTagsTitle,
            text: formatTemplate(copy.scriptTags, values),
          },
        ]
      : []),
    {
      id: 'outro' as const,
      title: copy.sectionOutroTitle,
      text: copy.scriptOutro,
    },
  ].filter((section) => section.text.trim().length > 0);

  let cursor = 0;
  return sections.map((section, index) => {
    const startIndex = cursor;
    cursor += section.text.length + (index === sections.length - 1 ? 0 : 1);
    return { ...section, startIndex };
  });
}

export function joinDocentScript(sections: DocentScriptSection[]) {
  return sections.map((section) => section.text).join(' ');
}

export function getDocentSectionIndexForChar(sections: DocentScriptSection[], charIndex: number) {
  if (sections.length === 0) return 0;

  const safeIndex = Math.max(0, charIndex);
  let activeIndex = 0;

  sections.forEach((section, index) => {
    if (section.startIndex <= safeIndex) {
      activeIndex = index;
    }
  });

  return activeIndex;
}

export function shouldAutoPlayDocentAfterProximityCheck({
  isNearby,
  speechSupported,
  speaking,
  paused,
}: DocentAutoPlayState) {
  return isNearby && speechSupported && !speaking && !paused;
}
