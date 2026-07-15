import type { Metadata } from 'next';
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Works — Dikshant Yadav',
  description: 'Selected works and projects by Dikshant Yadav.',
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
