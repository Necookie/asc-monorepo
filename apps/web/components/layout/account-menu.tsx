'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignOutButton, useAuth } from '@clerk/nextjs';
import { ChevronDown, ExternalLink, LogOut, Palette, Shield, UserRound, Pencil } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import type { NavigationAccount } from '@/lib/auth/navigation';

const itemClass = 'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-indigo hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export function AccountMenu({ account }: { account: NavigationAccount }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const lastSession = React.useRef<string | null | undefined>(undefined);
  const detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    if (!isLoaded || account.status === 'LOADING' || account.status === 'UNAVAILABLE') return;
    const currentSession = sessionId ?? null;
    const serverSignedIn = account.status !== 'SIGNED_OUT';
    const changed = lastSession.current !== undefined && lastSession.current !== currentSession;
    const mismatch = serverSignedIn !== Boolean(isSignedIn);
    // Persistent layouts can retain navigation fetched before OAuth completed.
    // Refresh once per browser session, rather than creating a refresh loop.
    if ((changed || mismatch) && lastSession.current !== currentSession) router.refresh();
    lastSession.current = currentSession;
  }, [account.status, isLoaded, isSignedIn, router, sessionId]);

  React.useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = false;
  }, [pathname]);

  React.useEffect(() => {
    const close = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details && !details.contains(event.target as Node)) details.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      const details = detailsRef.current;
      if (event.key === 'Escape' && details?.open) {
        details.open = false;
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  if (account.status === 'LOADING') {
    return <span className="inline-flex min-h-11 w-24 items-center justify-center rounded-xl border border-border text-sm text-muted" aria-busy="true">Account…</span>;
  }

  if (account.status === 'SIGNED_OUT') {
    if (isLoaded && isSignedIn) {
      return <Link href="/dashboard" prefetch={false} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-ink-dark hover:bg-primary-hover">Open my profile</Link>;
    }
    return <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-ink-dark hover:bg-primary-hover">Sign in</Link>;
  }

  if (isLoaded && !isSignedIn && account.status !== 'UNAVAILABLE') {
    return <Link href="/login" prefetch={false} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-ink-dark hover:bg-primary-hover">Sign in</Link>;
  }

  if (account.status !== 'MEMBER') {
    return <div className="flex items-center gap-2">
      <Link href={account.status === 'NOT_FOUND' ? '/not-a-member' : '/login'} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-3 text-sm font-semibold text-ink-dark">{account.status === 'UNAVAILABLE' ? 'Retry sign-in' : 'Continue sign-in'}</Link>
      <SignOutButton redirectUrl="/"><button type="button" aria-label="Sign out" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-ink-secondary hover:text-ink"><LogOut className="h-4 w-4" /></button></SignOutButton>
    </div>;
  }

  return <details ref={detailsRef} className="relative">
    <summary aria-label={`Open account options for ${account.displayName}`} className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-surface-onyx px-2 py-1.5 text-ink hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
      <Avatar src={account.avatar} alt={account.displayName} size={32} />
      <span className="hidden max-w-32 truncate text-sm font-semibold lg:block">{account.displayName}</span>
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </summary>
    <div className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-border-strong bg-canvas p-2 shadow-[0_8px_30px_rgba(0,0,0,.12)]">
      <div className="mb-2 border-b border-border px-3 py-3">
        <p className="truncate text-sm font-semibold text-ink">{account.displayName}</p>
        <p className="truncate text-sm text-muted">@{account.username}</p>
      </div>
      <nav aria-label="Your ASC account">
        {account.slug && <Link href={`/${account.slug}`} className={itemClass}><UserRound className="h-4 w-4" />My Profile<ExternalLink className="ml-auto h-3.5 w-3.5" /></Link>}
        <Link href="/dashboard" className={itemClass}><Pencil className="h-4 w-4" />Edit Profile</Link>
        <Link href="/dashboard/appearance" className={itemClass}><Palette className="h-4 w-4" />Appearance</Link>
        <Link href="/dashboard/privacy" className={itemClass}><Shield className="h-4 w-4" />Privacy</Link>
        {account.isAdmin && <Link href="/admin" className={itemClass}><Shield className="h-4 w-4" />Administration</Link>}
        {!account.isAdmin && account.isModerator && <Link href="/admin/profiles" className={itemClass}><Shield className="h-4 w-4" />Moderation</Link>}
        {account.isOwner && <Link href="/dashboard/permissions" className={itemClass}><Shield className="h-4 w-4" />Staff permissions</Link>}
      </nav>
      <div className="mt-2 border-t border-border pt-2"><SignOutButton redirectUrl="/"><button type="button" className={`${itemClass} w-full`}><LogOut className="h-4 w-4" />Sign Out</button></SignOutButton></div>
    </div>
  </details>;
}
