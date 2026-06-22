import Link from 'next/link';
import SearchTrigger from '@/components/search/search-trigger';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-foreground text-card font-label text-xs font-bold">
            IA
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-lg leading-none tracking-tight">Intelligence Archive</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
              Editorial Dossier System
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-wider">
          <Link href="/" className="hover:underline underline-offset-4">
            Archive
          </Link>
          <Link href="/search" className="hover:underline underline-offset-4">
            Search
          </Link>
          <a
            href="https://dikshantyadav.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
          >
            Portfolio
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <SearchTrigger />
        </div>
      </div>
    </header>
  );
}
