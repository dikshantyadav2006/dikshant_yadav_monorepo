import React from 'react';
import type { Metadata } from 'next';
import { Geist, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import Providers from '../components/providers';
import CommandMenu from '../components/command-menu';
import ThemeSelector from './theme-selector';
import SearchTrigger from './search-trigger';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-serif',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dikshant Yadav | Blog',
  description: 'Premium developer blogging platform covering engineering, design, architecture, and technology.',
  metadataBase: new URL('https://post.dikshantyadav.in'),
  openGraph: {
    title: 'Dikshant Yadav | Blog',
    description: 'Premium developer blogging platform covering engineering, design, architecture, and technology.',
    url: 'https://post.dikshantyadav.in',
    siteName: 'Dikshant Yadav Blog',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dikshant Yadav | Blog',
    description: 'Premium developer blogging platform covering engineering, design, architecture, and technology.',
    creator: '@dikshantyadav',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-accent/20 selection:text-accent font-sans antialiased">
        <Providers>
          {/* Main Layout wrapper */}
          <div className="flex min-h-screen flex-col">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-md transition-colors duration-300">
              <div className="mx-auto flex max-w-6xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2 group">
                  <span className="size-7 rounded-full bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center text-white font-bold leading-none">
                    D
                  </span>
                  <span className="font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                    dikshant<span className="text-accent">.post</span>
                  </span>
                </a>

                {/* Right side controls */}
                <div className="flex items-center gap-4">
                  <SearchTrigger />
                  <ThemeSelector />
                  <a
                    href="https://dikshantyadav.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border/80 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Portfolio
                  </a>
                </div>
              </div>
            </header>

            {/* Content main */}
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-muted/20 py-8 text-center text-xs text-muted-foreground/80 transition-colors duration-300">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>&copy; {new Date().getFullYear()} Dikshant Yadav. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a href="/feed.xml" className="hover:text-foreground transition-colors">RSS Feed</a>
                  <a href="https://github.com/dikshantyadav" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                  <a href="https://x.com/dikshant_yadav" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
                </div>
              </div>
            </footer>
          </div>

          <CommandMenu />
        </Providers>
      </body>
    </html>
  );
}
