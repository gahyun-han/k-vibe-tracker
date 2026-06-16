import { describe, expect, it } from 'vitest';
import {
  buildLocalRouteShareUrl,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  buildRouteStopDetailUrl,
  createLocalRoutePlan,
  createRouteProgressState,
  CURRENT_ROUTE_STORAGE_KEY,
  decodeRoutePlanFromShare,
  encodeRoutePlanForShare,
  generateMockRoutePlan,
  parseRouteProgressState,
  ROUTE_THEME_OPTIONS,
  ROUTE_PROGRESS_STORAGE_KEY,
  type RouteStop,
} from '@/lib/routes';

const STOPS: RouteStop[] = [
  {
    id: 'one',
    name: 'First stop',
    category: 'Cafe',
    address: 'Seoul',
    crowdLevel: 'mid',
    lat: 37.5447,
    lng: 127.0564,
    stayMinutes: 30,
    startTime: 'Flexible',
    description: 'A test stop.',
    tags: ['cafe'],
  },
  {
    id: 'two',
    name: 'Second stop',
    category: 'Food',
    address: 'Seoul',
    crowdLevel: 'high',
    lat: 37.5701,
    lng: 126.9996,
    stayMinutes: 45,
    startTime: 'Flexible',
    description: 'Another test stop.',
    tags: ['food'],
  },
];

describe('route helpers', () => {
  it('exports the shared local route storage key', () => {
    expect(CURRENT_ROUTE_STORAGE_KEY).toBe('k-vibe-current-route');
    expect(ROUTE_PROGRESS_STORAGE_KEY).toBe('k-vibe-route-progress');
  });

  it('builds a local route plan with derived duration and share text', () => {
    const plan = createLocalRoutePlan({
      id: 'custom',
      title: 'Custom Route',
      summary: 'A local test route.',
      stops: STOPS,
    });

    expect(plan.id).toBe('custom');
    expect(plan.title).toBe('Custom Route');
    expect(plan.source).toBe('mock');
    expect(plan.stayMinutes).toBe(75);
    expect(plan.walkingMinutes).toBeGreaterThan(0);
    expect(plan.totalMinutes).toBe(plan.walkingMinutes + 75);
    expect(plan.shareText).toBe('Custom Route: First stop -> Second stop');
  });

  it('keeps generated mock routes on the same local route contract', () => {
    const plan = generateMockRoutePlan({ theme: 'mood', detail: 'cafe', startTime: '09:00' });

    expect(plan.id).toBe('mood-cafe');
    expect(plan.stops[0].startTime).toBe('09:00');
    expect(plan.totalMinutes).toBe(plan.walkingMinutes + plan.stayMinutes);
    expect(plan.shareText).toContain(plan.title);
  });

  it('generates routes for the wireframe persona themes', () => {
    expect(ROUTE_THEME_OPTIONS.map((theme) => theme.id)).toEqual([
      'kpop',
      'drama',
      'mood',
      'foodie',
      'creator',
      'history',
    ]);

    const foodie = generateMockRoutePlan({ theme: 'foodie', detail: 'market', startTime: '11:30' });
    const creator = generateMockRoutePlan({ theme: 'creator', detail: 'reels' });
    const history = generateMockRoutePlan({ theme: 'history', detail: 'palace_day' });

    expect(foodie.stops.map((stop) => stop.category)).toContain('Food');
    expect(foodie.stops[0].startTime).toBe('11:30');
    expect(creator.stops.map((stop) => stop.tags).flat()).toContain('short-form');
    expect(history.stops.map((stop) => stop.tags).flat()).toContain('heritage');
  });

  it('builds free Google Maps walking links for route guidance', () => {
    const empty = buildGoogleMapsDirectionsUrl([]);
    const oneStop = new URL(buildGoogleMapsDirectionsUrl([STOPS[0]])!);
    const multiStop = new URL(buildGoogleMapsDirectionsUrl(STOPS)!);
    const waypointStop = new URL(buildGoogleMapsDirectionsUrl([
      STOPS[0],
      { ...STOPS[0], id: 'middle', lat: 37.5665, lng: 126.978 },
      STOPS[1],
    ])!);
    const place = new URL(buildGoogleMapsPlaceUrl(STOPS[0]));

    expect(empty).toBeNull();
    expect(oneStop.origin).toBe('https://www.google.com');
    expect(oneStop.searchParams.get('api')).toBe('1');
    expect(oneStop.searchParams.get('travelmode')).toBe('walking');
    expect(oneStop.searchParams.get('destination')).toBe('37.5447,127.0564');

    expect(multiStop.pathname).toBe('/maps/dir/');
    expect(multiStop.searchParams.get('origin')).toBe('37.5447,127.0564');
    expect(multiStop.searchParams.get('destination')).toBe('37.5701,126.9996');
    expect(waypointStop.searchParams.get('waypoints')).toBe('37.5665,126.978');
    expect(place.searchParams.get('query')).toBe('37.5447,127.0564');
  });

  it('builds in-app map detail handoff links for route stops', () => {
    const detailUrl = new URL(buildRouteStopDetailUrl(STOPS[0], 'ko'), 'http://localhost:3000');

    expect(detailUrl.pathname).toBe('/ko/map');
    expect(detailUrl.searchParams.get('lat')).toBe('37.5447');
    expect(detailUrl.searchParams.get('lng')).toBe('127.0564');
    expect(detailUrl.searchParams.get('q')).toBe('First stop');
    expect(detailUrl.searchParams.get('source')).toBe('route');
    expect(detailUrl.searchParams.get('detail')).toBe('1');
    expect(detailUrl.searchParams.get('category')).toBe('Cafe');
    expect(detailUrl.searchParams.get('address')).toBe('Seoul');
    expect(detailUrl.searchParams.get('description')).toBe('A test stop.');
    expect(detailUrl.searchParams.get('tags')).toBe('cafe');
  });

  it('builds and restores no-cost local route share URLs', () => {
    const plan = createLocalRoutePlan({
      id: 'custom',
      title: '서울 테스트 루트',
      summary: 'A local share test route.',
      stops: STOPS,
    });
    const shareUrl = new URL(buildLocalRouteShareUrl(plan, 'http://localhost:3000/ko/route?from=test'));
    const encoded = shareUrl.searchParams.get('route');

    expect(shareUrl.origin).toBe('http://localhost:3000');
    expect(shareUrl.pathname).toBe('/ko/route');
    expect(shareUrl.searchParams.get('from')).toBe('test');
    expect(encoded).toBeTruthy();

    const decoded = decodeRoutePlanFromShare(encoded!);
    expect(decoded?.title).toBe('서울 테스트 루트');
    expect(decoded?.summary).toBe('A local share test route.');
    expect(decoded?.stops.map((stop) => stop.name)).toEqual(['First stop', 'Second stop']);
    expect(decoded?.shareText).toBe('서울 테스트 루트: First stop -> Second stop');
  });

  it('ignores malformed shared route payloads', () => {
    expect(decodeRoutePlanFromShare('not-base64')).toBeNull();
    expect(decodeRoutePlanFromShare(encodeRoutePlanForShare({
      ...createLocalRoutePlan({
        id: 'empty',
        title: 'Empty Route',
        summary: 'No stops',
        stops: [],
      }),
      stops: [],
    }))).toBeNull();
  });

  it('limits shared route payloads to ten stops', () => {
    const manyStops = Array.from({ length: 12 }, (_, index) => ({
      ...STOPS[index % STOPS.length],
      id: `stop-${index}`,
      name: `Stop ${index}`,
    }));
    const plan = createLocalRoutePlan({
      id: 'many',
      title: 'Many Stops',
      summary: 'A long local route.',
      stops: manyStops,
    });

    const decoded = decodeRoutePlanFromShare(encodeRoutePlanForShare(plan));

    expect(decoded?.stops).toHaveLength(10);
    expect(decoded?.stops.at(-1)?.name).toBe('Stop 9');
  });

  it('keeps route progress scoped to the current plan and valid stops', () => {
    const progress = createRouteProgressState('route-a', ['one', 'missing', 'one', 'two'], ['one', 'two']);

    expect(progress.planId).toBe('route-a');
    expect(progress.completedStopIds).toEqual(['one', 'two']);
    expect(progress.updatedAt).toBeTruthy();

    const restored = parseRouteProgressState(JSON.stringify(progress), 'route-a', ['two']);
    const otherRoute = parseRouteProgressState(JSON.stringify(progress), 'route-b', ['one', 'two']);
    const malformed = parseRouteProgressState('not-json', 'route-a', ['one', 'two']);

    expect(restored.completedStopIds).toEqual(['two']);
    expect(otherRoute.completedStopIds).toEqual([]);
    expect(malformed.completedStopIds).toEqual([]);
  });
});
