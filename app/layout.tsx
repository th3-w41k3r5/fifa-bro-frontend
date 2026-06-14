import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppChrome, Footer } from '@/components';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://fifabro.vercel.app'),
  title: {
    default: 'FIFA Bro - World Cup 2026 Companion',
    template: '%s | FIFA Bro',
  },
  description: 'Premium FIFA World Cup 2026 companion app. Live matches, standings, groups, teams, and exclusive storylines.',
  keywords: ['FIFA', 'World Cup', '2026', 'football', 'soccer', 'matches', 'standings', 'teams'],
  authors: [{ name: 'Pritam' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fifabro.vercel.app',
    siteName: 'FIFA Bro',
    title: 'FIFA Bro - World Cup 2026 Companion',
    description: 'Premium FIFA World Cup 2026 companion app with live matches, standings, and exclusive content.',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 1200,
        height: 630,
        alt: 'FIFA Bro World Cup 2026',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fifabro',
    creator: '@fifabro',
    title: 'FIFA Bro - World Cup 2026 Companion',
    description: 'Premium FIFA World Cup 2026 companion app with live matches, standings, and exclusive content.',
    images: ['/android-chrome-512x512.png'],
  },
  alternates: {
    canonical: 'https://fifabro.vercel.app',
  },
  
  manifest: '/manifest.json',

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-text-primary">
        <AppChrome>{children}</AppChrome>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
