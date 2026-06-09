import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K-Vibe Tracker',
  description: 'Discover Korea like a local — K-content powered travel curation',
  manifest: '/manifest.json',
  themeColor: '#0D0D1A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
