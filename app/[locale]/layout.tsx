import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PwaRuntime from '@/components/common/PwaRuntime';
import { ToastProvider } from '@/components/common/Toast';
import { getUiCopy } from '@/lib/i18n';

const locales = ['ko', 'en', 'ja', 'zh'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const copy = getUiCopy(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider dismissLabel={copy.common.dismissNotification}>
        <PwaRuntime locale={locale} />
        {children}
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
