import { getRequestConfig, type GetRequestConfigParams, type RequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['ko', 'en', 'ja', 'zh'];

export async function createI18nRequestConfig({
  requestLocale,
}: Pick<GetRequestConfigParams, 'requestLocale'>): Promise<RequestConfig> {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
}

export default getRequestConfig(createI18nRequestConfig);
