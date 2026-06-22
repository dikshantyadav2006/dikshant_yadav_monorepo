import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function formatDate(date: string | null | undefined, style: 'long' | 'short' = 'long'): string {
  if (!date) return 'Unpublished';
  const d = new Date(date);
  if (style === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatDossierId(id: string): string {
  return `DOS-${id.slice(0, 8).toUpperCase()}`;
}
