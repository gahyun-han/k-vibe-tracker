import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K-Vibe Tracker',
  description: 'AI 기반 K-컬처 관광 가이드 — SNS 트렌드 장소 발견, 페르소나 루트 생성',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'K-Vibe',
  },
  openGraph: {
    type: 'website',
    title: 'K-Vibe Tracker',
    description: 'AI가 찾아주는 K-컬처 핫플레이스',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF3A5C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#0D0D1A] text-white antialiased">{children}</body>
    </html>
  );
}
