import type { Metadata, Viewport } from 'next';
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider';
import './globals.css';

const SITE_URL = 'https://work.dikshantyadav.in';

export const viewport: Viewport = {
  themeColor: '#091223',
};

export const metadata: Metadata = {
  title: {
    default: 'Works — Dikshant Yadav',
    template: '%s — Dikshant Yadav',
  },
  description:
    'Selected works and case studies by Dikshant Yadav. Frontend Developer specializing in React, Next.js, and immersive web experiences.',
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  openGraph: {
    title: 'Works — Dikshant Yadav',
    description:
      'Selected works and case studies by Dikshant Yadav. Frontend Developer specializing in React, Next.js, and immersive web experiences.',
    url: SITE_URL,
    siteName: 'Dikshant Yadav — Works',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Works by Dikshant Yadav',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Works — Dikshant Yadav',
    description:
      'Selected works and case studies by Dikshant Yadav.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': SITE_URL,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
