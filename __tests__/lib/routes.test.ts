import { describe, expect, it } from 'vitest';
import {
  createLocalRoutePlan,
  CURRENT_ROUTE_STORAGE_KEY,
  generateMockRoutePlan,
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
});
