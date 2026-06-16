import type { Metadata, Viewport } from 'next';
import './globals.css';

function getMetadataBase() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  try {
    return new URL(appUrl ?? 'http://localhost:3000');
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'K-Vibe Tracker',
  description:
    'K-content travel discovery, TourAPI place search, route planning, and nearby helper radar for visitors in Korea.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'K-Vibe',
  },
  openGraph: {
    type: 'website',
    title: 'K-Vibe Tracker',
    description: 'Discover Korea through K-content inspired places, routes, and nearby travel helpers.',
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#0D0D1A] text-white antialiased">{children}</body>
    </html>
  );
}
