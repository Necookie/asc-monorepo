'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const current = pathname === href || (href === '/dashboard' && pathname === '/dashboard/profile');

  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
        className,
        current && 'bg-surface-active text-ink ring-1 ring-inset ring-border-strong'
      )}
    >
      {children}
    </Link>
  );
}
