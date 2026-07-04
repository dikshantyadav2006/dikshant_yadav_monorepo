import type { Metadata } from 'next';
import SearchResults from './search-results';

export const metadata: Metadata = {
  title: 'Search Archive',
  description: 'Search intelligence reports, articles, and dossiers from the archive.',
  openGraph: {
    title: 'Search Archive',
    description: 'Search intelligence reports, articles, and dossiers from the archive.',
  },
};

export default function SearchPage() {
  return <SearchResults />;
}
