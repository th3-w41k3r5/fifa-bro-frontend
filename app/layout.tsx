import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppChrome, Footer } from '@/components';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'FIFA Bro - World Cup 2026 Companion',
    template: '%s | FIFA Bro',
  },
  description: 'Premium FIFA World Cup 2026 companion app. Live matches, standings, groups, teams, and exclusive storylines.',
  keywords: ['FIFA', 'World Cup', '2026', 'football', 'soccer', 'matches', 'standings', 'teams'],
  authors: [{ name: 'FIFA Bro' }],
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
    url: 'https://fifabro.com',
    siteName: 'FIFA Bro',
    title: 'FIFA Bro - World Cup 2026 Companion',
    description: 'Premium FIFA World Cup 2026 companion app with live matches, standings, and exclusive content.',
    images: [
      {
        url: '/og-image.png',
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
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://fifabro.com',
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
      </body>
    </html>
  );
}
