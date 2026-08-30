'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '../lib/api';
import type { ContactSubmission, ContactSubmissionsResponse } from '@dikshant/types';

export function useContactSubmissionsList(page = 1, limit = 50) {
  return useQuery<ContactSubmissionsResponse>({
    queryKey: ['contact-submissions', { page, limit }],
    queryFn: () => apiFetch(`/contact-submissions?page=${page}&limit=${limit}`),
    staleTime: 30_000,
  });
}

export function useDeleteContactSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/contact-submissions/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      qc.setQueriesData<ContactSubmissionsResponse>(
        { queryKey: ['contact-submissions'] },
        (old) => (old ? removeSubmissionFromPage(old, id) : old),
      );
    },
  });
}

function removeSubmissionFromPage(
  data: ContactSubmissionsResponse,
  id: string,
): ContactSubmissionsResponse {
  return {
    ...data,
    submissions: data.submissions.filter((s) => s.id !== id),
    pagination: {
      ...data.pagination,
      total: Math.max(0, data.pagination.total - 1),
    },
  };
}

export type { ContactSubmission };
