import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-6">
      <p className="dossier-label">Error 404</p>
      <h1 className="editorial-headline text-5xl">Dossier Not Found</h1>
      <p className="font-serif text-muted-foreground max-w-md mx-auto">
        The requested intelligence report could not be located in the archive.
      </p>
      <Link
        href="/"
        className="inline-block border-2 border-foreground bg-foreground text-card px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-card hover:text-foreground transition-colors"
      >
        Return to Archive
      </Link>
    </div>
  );
}
