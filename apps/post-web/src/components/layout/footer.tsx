import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t-2 border-foreground bg-secondary/50 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">{SITE_NAME}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Premium editorial reading experience. Intelligence reports, technical dossiers, and archived publications.
            </p>
          </div>
          <div>
            <p className="dossier-label mb-3">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline underline-offset-4">Archive Home</Link></li>
              <li><Link href="/search" className="hover:underline underline-offset-4">Search Reports</Link></li>
              <li><a href="/feed.xml" className="hover:underline underline-offset-4">RSS Feed</a></li>
            </ul>
          </div>
          <div>
            <p className="dossier-label mb-3">External</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://dikshantyadav.in" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="https://github.com/dikshantyadav" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://x.com/dikshant_yadav" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            &copy; {new Date().getFullYear()} Dikshant Yadav. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Ref: IA-PUB-{new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
