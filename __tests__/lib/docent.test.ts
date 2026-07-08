import { describe, expect, it } from 'vitest';
import {
  buildDocentScriptSections,
  getDocentSectionIndexForChar,
  joinDocentScript,
  shouldAutoPlayDocentAfterProximityCheck,
} from '@/lib/domain';

const copy = {
  sectionIntroTitle: 'Intro',
  sectionBodyTitle: 'Details',
  sectionTagsTitle: 'Look for',
  sectionOutroTitle: 'Next step',
  scriptIntro: '{name} is a {category} stop.',
  scriptBody: '{description} Stay for {stayMinutes} minutes at {address}.',
  scriptTags: 'Look for {tags}.',
  scriptOutro: 'Move on when ready.',
};

describe('docent script helpers', () => {
  it('builds structured script sections with start offsets', () => {
    const sections = buildDocentScriptSections(
      {
        name: 'Bukchon',
        category: 'Culture',
        address: 'Seoul',
        description: 'A historic neighborhood.',
        stayMinutes: '25',
        tags: ['hanok', 'photos'],
      },
      copy,
    );

    expect(sections.map((section) => section.id)).toEqual(['intro', 'body', 'tags', 'outro']);
    expect(sections[0]).toMatchObject({
      title: 'Intro',
      text: 'Bukchon is a Culture stop.',
      startIndex: 0,
    });
    expect(sections[1].startIndex).toBe(sections[0].text.length + 1);
    expect(joinDocentScript(sections)).toContain('Look for hanok, photos.');
  });

  it('omits the tags section when there are no tags', () => {
    const sections = buildDocentScriptSections(
      {
        name: 'Market',
        category: 'Food',
        address: 'Jongno',
        description: 'A snack stop.',
        stayMinutes: '30',
        tags: [],
      },
      copy,
    );

    expect(sections.map((section) => section.id)).toEqual(['intro', 'body', 'outro']);
    expect(joinDocentScript(sections)).not.toContain('Look for .');
  });

  it('maps speech character indexes to the active script section', () => {
    const sections = buildDocentScriptSections(
      {
        name: 'Cafe',
        category: 'Cafe',
        address: 'Seongsu',
        description: 'A design cafe.',
        stayMinutes: '20',
        tags: ['latte'],
      },
      copy,
    );

    expect(getDocentSectionIndexForChar(sections, -10)).toBe(0);
    expect(getDocentSectionIndexForChar(sections, sections[1].startIndex)).toBe(1);
    expect(getDocentSectionIndexForChar(sections, sections[2].startIndex + 3)).toBe(2);
    expect(getDocentSectionIndexForChar(sections, Number.MAX_SAFE_INTEGER)).toBe(3);
  });

  it('auto-plays only after a nearby user-triggered proximity check when speech is idle', () => {
    expect(
      shouldAutoPlayDocentAfterProximityCheck({
        isNearby: true,
        speechSupported: true,
        speaking: false,
        paused: false,
      }),
    ).toBe(true);

    expect(
      shouldAutoPlayDocentAfterProximityCheck({
        isNearby: false,
        speechSupported: true,
        speaking: false,
        paused: false,
      }),
    ).toBe(false);

    expect(
      shouldAutoPlayDocentAfterProximityCheck({
        isNearby: true,
        speechSupported: false,
        speaking: false,
        paused: false,
      }),
    ).toBe(false);

    expect(
      shouldAutoPlayDocentAfterProximityCheck({
        isNearby: true,
        speechSupported: true,
        speaking: true,
        paused: false,
      }),
    ).toBe(false);

    expect(
      shouldAutoPlayDocentAfterProximityCheck({
        isNearby: true,
        speechSupported: true,
        speaking: false,
        paused: true,
      }),
    ).toBe(false);
  });
});
