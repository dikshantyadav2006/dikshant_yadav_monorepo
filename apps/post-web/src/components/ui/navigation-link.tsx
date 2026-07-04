'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/components/ui/navigation-provider';

type NavigationLinkProps = ComponentProps<typeof Link>;

function resolveHref(href: NavigationLinkProps['href']): string {
  if (typeof href === 'string') return href.split('#')[0] ?? href;
  if (typeof href === 'object' && href.pathname) return href.pathname;
  return '';
}

export default function NavigationLink({
  href,
  className,
  children,
  prefetch = true,
  ...props
}: NavigationLinkProps) {
  const { pendingHref } = useNavigation();
  const hrefString = resolveHref(href);
  const isPending = pendingHref !== null && pendingHref === hrefString;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(className, isPending && 'navigation-link-pending')}
      aria-busy={isPending || undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
