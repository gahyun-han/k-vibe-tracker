import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('i18n request config', () => {
  it('loads messages for a supported locale', async () => {
    const { createI18nRequestConfig } = await import('@/i18n/request');

    const config = await createI18nRequestConfig({
      requestLocale: Promise.resolve('en'),
    });

    const messages = config.messages as { landing?: { start_btn?: string } };
    expect(config.locale).toBe('en');
    expect(messages.landing?.start_btn).toBe('Explore K-Vibe');
  });

  it('rejects unsupported locales', async () => {
    const { createI18nRequestConfig } = await import('@/i18n/request');

    await expect(
      createI18nRequestConfig({
        requestLocale: Promise.resolve('fr'),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
