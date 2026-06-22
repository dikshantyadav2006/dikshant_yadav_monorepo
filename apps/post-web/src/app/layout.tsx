import type { Metadata } from 'next';
import { Playfair_Display, Newsreader, Special_Elite, JetBrains_Mono } from 'next/font/google';
import Providers from '@/components/providers';
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

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Dikshant Yadav`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Premium editorial reading experience. Intelligence dossiers, technical reports, and archived publications.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: SITE_NAME,
    description: 'Intelligence archive and editorial dossier system.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@dikshantyadav',
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
        </Providers>
      </body>
    </html>
  );
}
