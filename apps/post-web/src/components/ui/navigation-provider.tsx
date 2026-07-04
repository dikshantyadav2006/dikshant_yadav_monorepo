'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextValue {
  pendingHref: string | null;
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextValue>({
  pendingHref: null,
  isNavigating: false,
});

export function useNavigation() {
  return useContext(NavigationContext);
}

function RouteProgressBar({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`route-progress ${active ? 'route-progress-active' : ''}`}
    >
      <div className="route-progress-bar" />
    </div>
  );
}

export default function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (href === pathname || href.split('#')[0] === pathname) return;

      setPendingHref(href.split('#')[0] ?? href);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{ pendingHref, isNavigating: pendingHref !== null }}
    >
      <RouteProgressBar active={pendingHref !== null} />
      {children}
    </NavigationContext.Provider>
  );
}
