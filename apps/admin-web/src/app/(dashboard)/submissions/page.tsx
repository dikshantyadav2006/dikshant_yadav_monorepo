import React from 'react';
import ContactSubmissionsTable from '../../../components/contact-submissions-table';
import { SubmissionsCountChip } from '../../../components/shared/total-chips';

export default function SubmissionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact form submissions from the connect page.
            </p>
          </div>
          <SubmissionsCountChip />
        </div>
      </div>

      <ContactSubmissionsTable />
    </div>
  );
}
