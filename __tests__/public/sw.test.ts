import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

type CacheLookupKey = string | { url: string };

function loadServiceWorker(fetchImpl = vi.fn()) {
  const handlers = new Map<string, (event: any) => void>();
  const addAll = vi.fn((urls: string[]) => Promise.resolve(urls));
  const put = vi.fn(() => Promise.resolve());
  const match = vi.fn((cacheKey: CacheLookupKey) => Promise.resolve<unknown | undefined>(undefined));
  const open = vi.fn(() => Promise.resolve({ addAll, put }));
  const keys = vi.fn(() => Promise.resolve([]));
  const deleteCache = vi.fn(() => Promise.resolve(true));
  const skipWaiting = vi.fn(() => Promise.resolve());
  const claim = vi.fn(() => Promise.resolve());

  const source = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8');

  vm.runInNewContext(source, {
    URL,
    Promise,
    fetch: fetchImpl,
    caches: {
      open,
      keys,
      delete: deleteCache,
      match,
    },
    self: {
      location: { origin: 'http://localhost:3000' },
      clients: { claim },
      skipWaiting,
      addEventListener: (eventName: string, handler: (event: any) => void) => {
        handlers.set(eventName, handler);
      },
    },
  });

  return { handlers, addAll, match };
}

describe('service worker', () => {
  it('precaches localized app shell routes', async () => {
    const { handlers, addAll } = loadServiceWorker();
    const waitUntil = vi.fn();

    handlers.get('install')?.({ waitUntil });
    await Promise.all(waitUntil.mock.calls.map(([promise]) => promise));

    expect(addAll).toHaveBeenCalledWith(
      expect.arrayContaining([
        '/ko',
        '/en',
        '/ja',
        '/zh',
        '/ko/profile',
        '/en/profile',
        '/ja/persona',
        '/zh/radar',
      ]),
    );
  });

  it('falls back to the current locale shell for offline navigations', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new Error('offline')));
    const { handlers, match } = loadServiceWorker(fetchImpl);
    const jaShell = { ok: true, locale: 'ja' };
    const request = {
      method: 'GET',
      mode: 'navigate',
      url: 'http://localhost:3000/ja/profile',
    };
    let responsePromise: Promise<unknown> | undefined;

    match.mockImplementation((cacheKey: CacheLookupKey) => {
      const key = typeof cacheKey === 'string' ? cacheKey : cacheKey.url;
      return Promise.resolve(key === '/ja' ? jaShell : undefined);
    });

    handlers.get('fetch')?.({
      request,
      respondWith: (promise: Promise<unknown>) => {
        responsePromise = promise;
      },
    });

    await expect(responsePromise).resolves.toBe(jaShell);
    expect(match.mock.calls.map(([cacheKey]) => (typeof cacheKey === 'string' ? cacheKey : cacheKey.url))).toEqual([
      request.url,
      '/ja',
    ]);
  });
});
