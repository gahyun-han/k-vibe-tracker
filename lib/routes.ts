import { haversineKm, walkingMinutes } from '@/lib/haversine';

export const ROUTE_THEMES = ['kpop', 'drama', 'mood'] as const;
export const CURRENT_ROUTE_STORAGE_KEY = 'k-vibe-current-route';
export type RouteTheme = (typeof ROUTE_THEMES)[number];
export type CrowdLevel = 'low' | 'mid' | 'high';

export interface RouteDetailOption {
  id: string;
  label: string;
  description: string;
}

export interface RouteThemeOption {
  id: RouteTheme;
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
    label: 'Mood Travel',
    description: 'Aesthetic Seoul routes tuned for pace, photos, and recovery time.',
    details: [
      { id: 'cafe', label: 'Cafe day', description: 'Cafe streets, design shops, and slower pacing.' },
      { id: 'photo', label: 'Photo walk', description: 'Color, texture, and easy photo stops.' },
      { id: 'healing', label: 'Healing', description: 'Parks, riverside walks, and lower crowd pressure.' },
      { id: 'food', label: 'Food crawl', description: 'Markets, snacks, and dinner-friendly routing.' },
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
