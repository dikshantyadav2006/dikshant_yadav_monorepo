import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import WorksTable from '../../../components/works-table';

export default function WorksPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Works</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage portfolio projects, case studies, and featured work.
          </p>
        </div>
        <Link
          href="/works/new"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-glow-primary transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          New Work
        </Link>
      </div>

      <WorksTable />
    </div>
  );
}
