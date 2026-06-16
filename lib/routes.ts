import { haversineKm, walkingMinutes } from '@/lib/haversine';

export const ROUTE_THEMES = ['kpop', 'drama', 'mood', 'foodie', 'creator', 'history'] as const;
export const CURRENT_ROUTE_STORAGE_KEY = 'k-vibe-current-route';
export const ROUTE_PROGRESS_STORAGE_KEY = 'k-vibe-route-progress';
export type RouteTheme = (typeof ROUTE_THEMES)[number];
export type CrowdLevel = 'low' | 'mid' | 'high';
const MAX_SHARED_ROUTE_STOPS = 10;

export interface RouteDetailOption {
  id: string;
  label: string;
  description: string;
}

export interface RouteThemeOption {
  id: RouteTheme;
  badge: string;
  label: string;
  description: string;
  details: RouteDetailOption[];
}

export interface RouteStop {
  id: string;
  name: string;
  category: string;
  address: string;
  crowdLevel: CrowdLevel;
  lat: number;
  lng: number;
  stayMinutes: number;
  startTime: string;
  description: string;
  tags: string[];
}

export interface RoutePlan {
  id: string;
  title: string;
  theme: RouteTheme;
  detail: string;
  summary: string;
  source: 'mock';
  stops: RouteStop[];
  walkingMinutes: number;
  stayMinutes: number;
  totalMinutes: number;
  generatedAt: string;
  shareText: string;
}

export interface RouteProgressState {
  planId: string;
  completedStopIds: string[];
  updatedAt: string;
}

interface GenerateRoutePlanInput {
  theme: RouteTheme;
  detail: string;
  startTime?: string;
  copy?: LocalizedRoutePlanCopy;
}

interface CreateLocalRoutePlanInput {
  id: string;
  title: string;
  theme?: RouteTheme;
  detail?: string;
  summary: string;
  stops: RouteStop[];
}

type StopTemplate = Omit<RouteStop, 'startTime'>;

interface SharedRoutePayload {
  v: 1;
  id: string;
  title: string;
  theme: RouteTheme;
  detail: string;
  summary: string;
  stops: RouteStop[];
}

export interface LocalizedRouteOptionCopy {
  label: string;
  description: string;
}

export interface LocalizedRoutePlanCopy {
  routeTitle: string;
  routeSummary: string;
  themes: Record<
    RouteTheme,
    {
      label: string;
      description: string;
      details: Record<string, LocalizedRouteOptionCopy>;
    }
  >;
}

export const ROUTE_THEME_OPTIONS: RouteThemeOption[] = [
  {
    id: 'kpop',
    badge: 'KPOP',
    label: 'K-pop Pilgrimage',
    description: 'Agency streets, fan photo spots, music stores, and night views.',
    details: [
      { id: 'bts', label: 'BTS', description: 'HYBE, merch streets, and fan-friendly stops.' },
      { id: 'blackpink', label: 'BLACKPINK', description: 'Style-led stops with shopping and photos.' },
      { id: 'newjeans', label: 'NewJeans', description: 'Retro, cafe, and photo-forward places.' },
      { id: 'aespa', label: 'aespa', description: 'Futuristic spots and high-energy neighborhoods.' },
    ],
  },
  {
    id: 'drama',
    badge: 'TV',
    label: 'K-drama Scenes',
    description: 'Palaces, alleys, markets, and cinematic walking routes.',
    details: [
      { id: 'palace', label: 'Palace drama', description: 'Historic Seoul with classic filming moods.' },
      { id: 'romance', label: 'Romance walk', description: 'Soft scenery, cafes, and evening lights.' },
      { id: 'street_food', label: 'Street food story', description: 'Markets and snack-heavy drama energy.' },
      { id: 'night', label: 'Night episode', description: 'Bridges, towers, and after-dark city shots.' },
    ],
  },
  {
    id: 'mood',
    badge: 'MOOD',
    label: 'Mood Travel',
    description: 'Aesthetic Seoul routes tuned for pace, photos, and recovery time.',
    details: [
      { id: 'cafe', label: 'Cafe day', description: 'Cafe streets, design shops, and slower pacing.' },
      { id: 'photo', label: 'Photo walk', description: 'Color, texture, and easy photo stops.' },
      { id: 'healing', label: 'Healing', description: 'Parks, riverside walks, and lower crowd pressure.' },
      { id: 'food', label: 'Food crawl', description: 'Markets, snacks, and dinner-friendly routing.' },
    ],
  },
  {
    id: 'foodie',
    badge: 'FOOD',
    label: 'Foodie Explorer',
    description: 'Street food, markets, desserts, and late meals in a walkable day.',
    details: [
      { id: 'market', label: 'Market tasting', description: 'Classic alleys, small bites, and lively stalls.' },
      { id: 'dessert', label: 'Dessert hop', description: 'Cafes, bakeries, and sweet photo stops.' },
      { id: 'night_food', label: 'Night food', description: 'Dinner, neon streets, and easy final transit.' },
      { id: 'local_table', label: 'Local table', description: 'Comfort food, tea, and slower neighborhood pacing.' },
    ],
  },
  {
    id: 'creator',
    badge: 'SHOT',
    label: 'Content Creator',
    description: 'Photogenic backdrops, design streets, and short-form-friendly stops.',
    details: [
      { id: 'reels', label: 'Reels walk', description: 'Compact spots with quick transitions and texture.' },
      { id: 'fashion', label: 'Fashion street', description: 'Style-led neighborhoods and boutique windows.' },
      { id: 'design', label: 'Design frame', description: 'Architecture, galleries, and clean composition.' },
      { id: 'night_shot', label: 'Night shots', description: 'Lights, reflections, and skyline-friendly pacing.' },
    ],
  },
  {
    id: 'history',
    badge: 'HIST',
    label: 'History Buff',
    description: 'Palaces, hanok alleys, museums, and heritage-focused walking routes.',
    details: [
      { id: 'palace_day', label: 'Palace day', description: 'Royal sites, gates, and hanbok-friendly timing.' },
      { id: 'hanok_walk', label: 'Hanok walk', description: 'Traditional alleys with tea and craft stops.' },
      { id: 'museum', label: 'Museum route', description: 'Indoor culture stops for weather-safe exploring.' },
      { id: 'heritage_food', label: 'Heritage food', description: 'Old Seoul streets with classic market meals.' },
    ],
  },
];

const ROUTE_TEMPLATES: Record<RouteTheme, StopTemplate[]> = {
  kpop: [
    {
      id: 'hybe-yongsan',
      name: 'HYBE Yongsan Area',
      category: 'K-pop',
      address: 'Yongsan-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5241,
      lng: 126.9635,
      stayMinutes: 70,
      description: 'Start with the agency district and nearby fan photo spots.',
      tags: ['agency', 'photo'],
    },
    {
      id: 'hongdae-photo',
      name: 'Hongdae Photo Booth Street',
      category: 'Photo',
      address: 'Hongdae, Seoul',
      crowdLevel: 'high',
      lat: 37.5563,
      lng: 126.9236,
      stayMinutes: 60,
      description: 'Take quick fan-style photo booth shots before the area gets busier.',
      tags: ['photo booth', 'youth'],
    },
    {
      id: 'myeongdong-kpop',
      name: 'Myeongdong K-pop Store Loop',
      category: 'Shopping',
      address: 'Myeongdong, Seoul',
      crowdLevel: 'high',
      lat: 37.5637,
      lng: 126.985,
      stayMinutes: 80,
      description: 'Browse albums, character goods, cosmetics, and snack stops in one compact loop.',
      tags: ['shopping', 'albums'],
    },
    {
      id: 'han-river-night',
      name: 'Banpo Hangang Park',
      category: 'Night view',
      address: 'Banpo-dong, Seoul',
      crowdLevel: 'mid',
      lat: 37.51,
      lng: 126.9955,
      stayMinutes: 70,
      description: 'Close with a relaxed river view that works well for recap photos.',
      tags: ['river', 'night'],
    },
  ],
  drama: [
    {
      id: 'gyeongbokgung',
      name: 'Gyeongbokgung Palace',
      category: 'Culture',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5796,
      lng: 126.977,
      stayMinutes: 90,
      description: 'A classic opening stop for palace drama energy and hanbok photos.',
      tags: ['palace', 'history'],
    },
    {
      id: 'bukchon',
      name: 'Bukchon Hanok Village',
      category: 'Culture',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5826,
      lng: 126.983,
      stayMinutes: 60,
      description: 'Walk quiet hanok alleys and keep the pace gentle for photos.',
      tags: ['hanok', 'photo'],
    },
    {
      id: 'gwangjang',
      name: 'Gwangjang Market Food Alley',
      category: 'Food',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5701,
      lng: 126.9996,
      stayMinutes: 70,
      description: 'Add a market episode with bindaetteok, gimbap, and street-food texture.',
      tags: ['market', 'food'],
    },
    {
      id: 'namsan',
      name: 'Namsan Seoul Tower',
      category: 'View',
      address: 'Yongsan-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5512,
      lng: 126.9882,
      stayMinutes: 80,
      description: 'Finish with a skyline scene that feels made for a final episode shot.',
      tags: ['view', 'night'],
    },
  ],
  mood: [
    {
      id: 'seoul-forest',
      name: 'Seoul Forest',
      category: 'Nature',
      address: 'Seongdong-gu, Seoul',
      crowdLevel: 'low',
      lat: 37.5443,
      lng: 127.0374,
      stayMinutes: 70,
      description: 'Open with a slower park walk and quiet photo corners.',
      tags: ['park', 'healing'],
    },
    {
      id: 'seongsu-cafe',
      name: 'Seongsu Cafe Street',
      category: 'Cafe',
      address: 'Seongsu-dong, Seoul',
      crowdLevel: 'mid',
      lat: 37.5447,
      lng: 127.0564,
      stayMinutes: 90,
      description: 'Take a longer cafe stop for rest, charging, and street photos.',
      tags: ['cafe', 'design'],
    },
    {
      id: 'ddp',
      name: 'Dongdaemun Design Plaza',
      category: 'Design',
      address: 'Jung-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5665,
      lng: 127.0092,
      stayMinutes: 60,
      description: 'Add a clean design contrast with easy indoor/outdoor switching.',
      tags: ['design', 'photo'],
    },
    {
      id: 'ikseon',
      name: 'Ikseon-dong Hanok Alley',
      category: 'Food',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.574,
      lng: 126.9897,
      stayMinutes: 80,
      description: 'End around small restaurants, desserts, and evening alley lights.',
      tags: ['food', 'hanok'],
    },
  ],
  foodie: [
    {
      id: 'gwangjang-foodie',
      name: 'Gwangjang Market Food Alley',
      category: 'Food',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5701,
      lng: 126.9996,
      stayMinutes: 80,
      description: 'Start with iconic market bites and a busy, easy-to-read Seoul food scene.',
      tags: ['market', 'street food'],
    },
    {
      id: 'ikseon-dessert',
      name: 'Ikseon-dong Dessert Alley',
      category: 'Dessert',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.574,
      lng: 126.9897,
      stayMinutes: 70,
      description: 'Move into hanok cafes, desserts, and softer photo corners after the market.',
      tags: ['dessert', 'hanok'],
    },
    {
      id: 'seongsu-bakery',
      name: 'Seongsu Bakery Loop',
      category: 'Cafe',
      address: 'Seongsu-dong, Seoul',
      crowdLevel: 'mid',
      lat: 37.5447,
      lng: 127.0564,
      stayMinutes: 75,
      description: 'Add a modern bakery and cafe district with room to rest and recharge.',
      tags: ['bakery', 'cafe'],
    },
    {
      id: 'euljiro-night-food',
      name: 'Euljiro Night Food Street',
      category: 'Night food',
      address: 'Jung-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5661,
      lng: 126.9919,
      stayMinutes: 85,
      description: 'Finish with neon-lit dinner streets and a strong end-of-day atmosphere.',
      tags: ['night', 'local food'],
    },
  ],
  creator: [
    {
      id: 'seoul-forest-creator',
      name: 'Seoul Forest Photo Corners',
      category: 'Photo',
      address: 'Seongdong-gu, Seoul',
      crowdLevel: 'low',
      lat: 37.5443,
      lng: 127.0374,
      stayMinutes: 65,
      description: 'Open with greenery, wide frames, and lower-pressure shooting time.',
      tags: ['photo', 'park'],
    },
    {
      id: 'seongsu-creator',
      name: 'Seongsu Design Street',
      category: 'Design',
      address: 'Seongsu-dong, Seoul',
      crowdLevel: 'mid',
      lat: 37.5447,
      lng: 127.0564,
      stayMinutes: 85,
      description: 'Collect storefronts, pop-up textures, cafes, and design-led transitions.',
      tags: ['design', 'short-form'],
    },
    {
      id: 'ddp-creator',
      name: 'Dongdaemun Design Plaza',
      category: 'Architecture',
      address: 'Jung-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5665,
      lng: 127.0092,
      stayMinutes: 70,
      description: 'Use clean curves and open plazas for architecture and outfit frames.',
      tags: ['architecture', 'fashion'],
    },
    {
      id: 'namsan-creator',
      name: 'Namsan Seoul Tower View',
      category: 'View',
      address: 'Yongsan-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5512,
      lng: 126.9882,
      stayMinutes: 80,
      description: 'Close with skyline light and an easy final clip for the route recap.',
      tags: ['skyline', 'night'],
    },
  ],
  history: [
    {
      id: 'gyeongbokgung-history',
      name: 'Gyeongbokgung Palace',
      category: 'Culture',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5796,
      lng: 126.977,
      stayMinutes: 95,
      description: 'Begin with the royal palace axis, gates, courtyards, and classic Seoul context.',
      tags: ['palace', 'heritage'],
    },
    {
      id: 'bukchon-history',
      name: 'Bukchon Hanok Village',
      category: 'Culture',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5826,
      lng: 126.983,
      stayMinutes: 70,
      description: 'Continue through hanok alleys with slower pacing and neighborhood etiquette.',
      tags: ['hanok', 'walk'],
    },
    {
      id: 'insadong-history',
      name: 'Insadong Culture Street',
      category: 'Craft',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'mid',
      lat: 37.5743,
      lng: 126.9853,
      stayMinutes: 65,
      description: 'Add galleries, crafts, tea, and souvenir stops without leaving the heritage district.',
      tags: ['craft', 'tea'],
    },
    {
      id: 'gwangjang-history',
      name: 'Gwangjang Market Heritage Meal',
      category: 'Food',
      address: 'Jongno-gu, Seoul',
      crowdLevel: 'high',
      lat: 37.5701,
      lng: 126.9996,
      stayMinutes: 75,
      description: 'Finish with a traditional market meal that keeps the route practical and memorable.',
      tags: ['market', 'classic food'],
    },
  ],
};

export function isRouteTheme(value: string): value is RouteTheme {
  return ROUTE_THEMES.includes(value as RouteTheme);
}

export function getRouteDetails(theme: RouteTheme) {
  return ROUTE_THEME_OPTIONS.find((option) => option.id === theme)?.details ?? [];
}

export function isRouteDetailForTheme(theme: RouteTheme, detail: string) {
  return getRouteDetails(theme).some((option) => option.id === detail);
}

export function generateMockRoutePlan({ theme, detail, startTime = '10:00', copy }: GenerateRoutePlanInput): RoutePlan {
  const themeOption = ROUTE_THEME_OPTIONS.find((option) => option.id === theme)!;
  const detailOption = themeOption.details.find((option) => option.id === detail);
  const localizedTheme = copy?.themes[theme];
  const localizedDetail = localizedTheme?.details[detail];
  const baseStops = ROUTE_TEMPLATES[theme];
  const startMinutes = parseStartTime(startTime) ?? 600;

  let cursor = startMinutes;
  const stops = baseStops.map((stop, index) => {
    if (index > 0) {
      const prev = baseStops[index - 1];
      cursor += walkingMinutes(haversineKm(prev.lat, prev.lng, stop.lat, stop.lng));
    }

    const scheduledStop: RouteStop = {
      ...stop,
      startTime: formatClock(cursor),
    };
    cursor += stop.stayMinutes;
    return scheduledStop;
  });

  const walking = calculateWalkingMinutes(stops);
  const stay = stops.reduce((total, stop) => total + stop.stayMinutes, 0);
  const duration = formatDuration(walking + stay);
  const title = formatRouteTemplate(copy?.routeTitle ?? '{detail} Seoul Route', {
    detail: localizedDetail?.label ?? detailOption?.label ?? localizedTheme?.label ?? themeOption.label,
    theme: localizedTheme?.label ?? themeOption.label,
    duration,
  });
  const summary = formatRouteTemplate(
    copy?.routeSummary ?? '{themeDescription} Planned as a {duration} local preview route.',
    {
      theme: localizedTheme?.label ?? themeOption.label,
      themeDescription: localizedTheme?.description ?? themeOption.description,
      detail: localizedDetail?.label ?? detailOption?.label ?? '',
      detailDescription: localizedDetail?.description ?? detailOption?.description ?? '',
      duration,
    },
  );

  return createLocalRoutePlan({
    id: `${theme}-${detail}`,
    title,
    theme,
    detail,
    summary,
    stops,
  });
}

export function calculateWalkingMinutes(stops: Pick<RouteStop, 'lat' | 'lng'>[]) {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i += 1) {
    total += walkingMinutes(haversineKm(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng));
  }
  return total;
}

export function createLocalRoutePlan({
  id,
  title,
  theme = 'mood',
  detail = 'custom',
  summary,
  stops,
}: CreateLocalRoutePlanInput): RoutePlan {
  const walking = calculateWalkingMinutes(stops);
  const stay = stops.reduce((total, stop) => total + stop.stayMinutes, 0);

  return {
    id,
    title,
    theme,
    detail,
    summary,
    source: 'mock',
    stops,
    walkingMinutes: walking,
    stayMinutes: stay,
    totalMinutes: walking + stay,
    generatedAt: new Date().toISOString(),
    shareText: `${title}: ${stops.map((stop) => stop.name).join(' -> ')}`,
  };
}

export function encodeRoutePlanForShare(plan: RoutePlan) {
  const payload: SharedRoutePayload = {
    v: 1,
    id: plan.id,
    title: plan.title,
    theme: plan.theme,
    detail: plan.detail,
    summary: plan.summary,
    stops: plan.stops.slice(0, MAX_SHARED_ROUTE_STOPS).map((stop) => ({
      id: stop.id,
      name: stop.name,
      category: stop.category,
      address: stop.address,
      crowdLevel: stop.crowdLevel,
      lat: stop.lat,
      lng: stop.lng,
      stayMinutes: stop.stayMinutes,
      startTime: stop.startTime,
      description: stop.description,
      tags: stop.tags.slice(0, 8),
    })),
  };

  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeRoutePlanFromShare(value: string) {
  try {
    const payload = JSON.parse(base64UrlDecode(value)) as unknown;
    if (!isRecord(payload)) return null;

    const title = coerceNonEmptyString(payload.title);
    const summary = coerceNonEmptyString(payload.summary);
    const rawStops = Array.isArray(payload.stops) ? payload.stops : [];
    const stops = rawStops
      .slice(0, MAX_SHARED_ROUTE_STOPS)
      .map((stop, index) => coerceSharedRouteStop(stop, index))
      .filter((stop): stop is RouteStop => stop !== null);

    if (!title || !summary || stops.length === 0) return null;

    return createLocalRoutePlan({
      id: coerceNonEmptyString(payload.id) ?? 'shared-route',
      title,
      theme: typeof payload.theme === 'string' && isRouteTheme(payload.theme) ? payload.theme : 'mood',
      detail: coerceNonEmptyString(payload.detail) ?? 'shared',
      summary,
      stops,
    });
  } catch {
    return null;
  }
}

export function buildLocalRouteShareUrl(plan: RoutePlan, baseUrl: string) {
  const url = new URL(baseUrl);
  url.searchParams.set('route', encodeRoutePlanForShare(plan));
  return url.toString();
}

export function createRouteProgressState(
  planId: string,
  completedStopIds: string[],
  validStopIds: string[],
): RouteProgressState {
  const validIds = new Set(validStopIds);
  const seen = new Set<string>();
  const completed = completedStopIds.filter((id) => {
    if (!validIds.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return {
    planId,
    completedStopIds: completed,
    updatedAt: new Date().toISOString(),
  };
}

export function parseRouteProgressState(
  value: string | null,
  planId: string,
  validStopIds: string[],
): RouteProgressState {
  if (!value) {
    return createRouteProgressState(planId, [], validStopIds);
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed) || parsed.planId !== planId || !Array.isArray(parsed.completedStopIds)) {
      return createRouteProgressState(planId, [], validStopIds);
    }

    return createRouteProgressState(planId, parsed.completedStopIds.filter(isString), validStopIds);
  } catch {
    return createRouteProgressState(planId, [], validStopIds);
  }
}

export function buildGoogleMapsDirectionsUrl(stops: Pick<RouteStop, 'lat' | 'lng'>[]) {
  if (stops.length === 0) return null;

  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('travelmode', 'walking');

  if (stops.length === 1) {
    url.searchParams.set('destination', formatCoordinates(stops[0]));
    return url.toString();
  }

  url.searchParams.set('origin', formatCoordinates(stops[0]));
  url.searchParams.set('destination', formatCoordinates(stops[stops.length - 1]));

  const waypoints = stops.slice(1, -1).map(formatCoordinates);
  if (waypoints.length > 0) {
    url.searchParams.set('waypoints', waypoints.join('|'));
  }

  return url.toString();
}

export function buildGoogleMapsPlaceUrl(stop: Pick<RouteStop, 'lat' | 'lng'>) {
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', formatCoordinates(stop));
  return url.toString();
}

export function buildRouteMapUrl(stops: RouteStop[], title: string, locale: string) {
  const firstStop = stops[0];
  if (!firstStop) return null;

  const params = new URLSearchParams({
    lat: String(firstStop.lat),
    lng: String(firstStop.lng),
    q: title,
    source: 'route-map',
    firstStop: firstStop.name,
    stopCount: String(stops.length),
  });

  return `/${locale}/map?${params.toString()}`;
}

export function buildRouteStopDetailUrl(stop: RouteStop, locale: string) {
  const params = new URLSearchParams({
    lat: String(stop.lat),
    lng: String(stop.lng),
    q: stop.name,
    source: 'route',
    detail: '1',
    category: stop.category,
    address: stop.address,
    description: stop.description,
  });

  if (stop.tags.length > 0) params.set('tags', stop.tags.join(','));

  return `/${locale}/map?${params.toString()}`;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function parseStartTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatClock(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function formatRouteTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function formatCoordinates(stop: Pick<RouteStop, 'lat' | 'lng'>) {
  return `${stop.lat},${stop.lng}`;
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceNonEmptyString(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function coerceNumberInRange(value: unknown, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

function coerceCrowdLevel(value: unknown): CrowdLevel {
  return value === 'low' || value === 'mid' || value === 'high' ? value : 'mid';
}

function coerceSharedRouteStop(value: unknown, index: number): RouteStop | null {
  if (!isRecord(value)) return null;

  const name = coerceNonEmptyString(value.name);
  const lat = coerceNumberInRange(value.lat, -90, 90);
  const lng = coerceNumberInRange(value.lng, -180, 180);

  if (!name || lat === null || lng === null) return null;

  const stayMinutes = coerceNumberInRange(value.stayMinutes, 5, 360);

  return {
    id: coerceNonEmptyString(value.id) ?? `shared-stop-${index + 1}`,
    name,
    category: coerceNonEmptyString(value.category) ?? 'Spot',
    address: coerceNonEmptyString(value.address) ?? 'Shared route',
    crowdLevel: coerceCrowdLevel(value.crowdLevel),
    lat,
    lng,
    stayMinutes: stayMinutes === null ? 60 : Math.round(stayMinutes),
    startTime: coerceNonEmptyString(value.startTime) ?? 'Flexible',
    description: coerceNonEmptyString(value.description) ?? '',
    tags: Array.isArray(value.tags)
      ? value.tags
          .map((tag) => coerceNonEmptyString(tag))
          .filter((tag): tag is string => tag !== null)
          .slice(0, 8)
      : [],
  };
}
