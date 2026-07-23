'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from './TransitionContext';

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  target?: string;
  rel?: string;
}

export default function TransitionLink({
  href,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  target,
  rel,
}: TransitionLinkProps) {
  const { startTransition, phase } = useTransition();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (phase !== 'idle') {
      e.preventDefault();
      return;
    }
    if (target === '_blank') return;
    if (href === pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    onClick?.();
    startTransition(href);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
}
