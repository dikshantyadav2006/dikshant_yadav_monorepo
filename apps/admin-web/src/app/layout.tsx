import React from 'react';
import type { Metadata } from 'next';
import { Geist, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import Providers from '../components/providers';
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
  title: 'Dikshant Yadav | Admin',
  description: 'Admin dashboard for managing blog posts, categories, and content.',
  metadataBase: new URL('https://admin.dikshantyadav.in'),
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased transition-colors duration-300 selection:bg-accent/20 selection:text-accent">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
