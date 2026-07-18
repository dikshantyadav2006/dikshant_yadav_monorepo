import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Newsreader, Special_Elite, JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/providers';
import NavigationProvider from '@/components/ui/navigation-provider';
import CommandMenu from '@/components/search/command-menu';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PaperTexture from '@/components/ui/paper-texture';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

const newsreader = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const specialElite = Special_Elite({
  variable: '--font-label',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#091223',
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Abhay Singh Yadav`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Reflections from the intersection of law, leadership, and social consciousness.',
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
    title: SITE_NAME,
    description: 'Reflections from the intersection of law, leadership, and social consciousness.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Reflections from the intersection of law, leadership, and social consciousness.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${newsreader.variable} ${specialElite.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen paper-texture relative">
        <PaperTexture />
        <Providers>
          <NavigationProvider>
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
            <CommandMenu />
          </NavigationProvider>
        </Providers>
      </body>
    </html>
  );
}
