import { isRouteDetailForTheme, isRouteTheme, type RouteTheme } from '@/lib/domain';

export const PERSONA_PREFERENCE_STORAGE_KEY = 'k-vibe-persona-preference';

export type PersonaFeedCategory = 'culture' | 'food' | 'fun' | 'photo';

export interface PersonaPreference {
  theme: RouteTheme;
  detail: string;
  updatedAt: string;
}

const THEME_FEED_CATEGORY: Record<RouteTheme, PersonaFeedCategory> = {
  kpop: 'fun',
  drama: 'culture',
  mood: 'culture',
  foodie: 'food',
  creator: 'photo',
  history: 'culture',
};

const DETAIL_FEED_CATEGORY: Record<string, PersonaFeedCategory> = {
  food: 'food',
  street_food: 'food',
  market: 'food',
  dessert: 'food',
  night_food: 'food',
  local_table: 'food',
  photo: 'photo',
  reels: 'photo',
  fashion: 'photo',
  design: 'photo',
  night_shot: 'photo',
};

export function createPersonaPreference(theme: RouteTheme, detail: string, updatedAt = new Date().toISOString()) {
  return {
    theme,
    detail,
    updatedAt,
  };
}

export function serializePersonaPreference(preference: PersonaPreference) {
  return JSON.stringify(preference);
}

export function parsePersonaPreference(value: string | null): PersonaPreference | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return null;
    if (typeof parsed['theme'] !== 'string' || !isRouteTheme(parsed['theme'])) return null;
    if (typeof parsed['detail'] !== 'string' || !isRouteDetailForTheme(parsed['theme'], parsed['detail'])) return null;
    if (typeof parsed['updatedAt'] !== 'string' || Number.isNaN(Date.parse(parsed['updatedAt']))) return null;

    return {
      theme: parsed['theme'],
      detail: parsed['detail'],
      updatedAt: parsed['updatedAt'],
    };
  } catch {
    return null;
  }
}

export function getPersonaFeedCategory(preference: PersonaPreference): PersonaFeedCategory {
  return DETAIL_FEED_CATEGORY[preference.detail] ?? THEME_FEED_CATEGORY[preference.theme];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
