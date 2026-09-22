'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Compass, Users, Home, User, Menu, X } from 'lucide-react';
import { AscLogo } from '@/components/ui/asc-logo';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/explore', label: 'Explore', icon: Compass },
] as const;

export interface NavBarProps {
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    slug?: string;
  } | null;
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || Boolean(pathname?.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <AscLogo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold" aria-label="Primary navigation">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative isolate inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors ${
                    active ? 'text-ink' : 'text-ink-secondary hover:text-ink hover:bg-surface-indigo'
                  }`}
                >
                  {active && (
                    <m.span
                      layoutId="primary-navigation-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-surface-indigo ring-1 ring-inset ring-white/[0.08]"
                      transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: EASE_OUT_EXPO }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${active ? 'text-primary-soft' : ''}`} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface-indigo text-ink-secondary border border-white/[0.1] hover:text-ink hover:border-white/[0.18] transition-colors"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-primary-navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {user !== undefined ? (
            user ? (
              <div className="flex items-center gap-2.5">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {user.slug && (
                  <Link href={`/${user.slug}`}>
                    <Button variant="primary" size="sm" className="hidden min-[420px]:inline-flex">
                      My Profile
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">Sign In</Button>
              </Link>
            )
          ) : (
            <div className="flex items-center gap-3">
              <SignedOut>
                <Link href="/login">
                  <Button variant="primary" size="sm">Sign In</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2.5">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8 ring-2 ring-[rgba(88,101,242,0.3)]',
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <m.nav
            id="mobile-primary-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full md:hidden border-b border-white/[0.08] bg-canvas px-4 py-3 shadow-[0_18px_40px_rgba(6,8,28,0.32)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -7 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.24, ease: EASE_OUT_EXPO }}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[#5865f2] text-white'
                        : 'bg-surface-indigo text-ink-secondary hover:bg-surface-elevated hover:text-ink'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
