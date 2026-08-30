'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Briefcase,
  PenSquare,
  MessagesSquare,
} from 'lucide-react';
import ThemeSelector from '../app/theme-selector';
import { useAuth } from '../context/auth-provider';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/works', label: 'Works', icon: Briefcase },
  { href: '/submissions', label: 'Submissions', icon: MessagesSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const mobileNavItems = [
  { href: '/', label: 'Posts', icon: LayoutDashboard },
  { href: '/works', label: 'Works', icon: Briefcase },
  { href: '/posts/new', label: 'New', icon: PenSquare },
  { href: '/submissions', label: 'Inbox', icon: MessagesSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                D
              </span>
              <span className="font-bold tracking-tight">
                dikshant<span className="text-accent">.admin</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/posts/new"
                className="ml-1 inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            {user ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            ) : (
              <div className="hidden h-4 w-16 animate-pulse rounded bg-muted sm:inline" />
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-border/80 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6 sm:pb-8 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="hidden border-t border-border/40 py-4 text-center text-xs text-muted-foreground sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4">
          <FileText className="h-3.5 w-3.5" />
          <span>Post + Works CMS · connected to dikshant API</span>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-md sm:hidden"
        aria-label="Mobile"
      >
        <div className="grid grid-cols-5">
          {mobileNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default AdminShell;