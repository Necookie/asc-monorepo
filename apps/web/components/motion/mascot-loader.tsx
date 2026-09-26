'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Mascot = dynamic(() => import('./community-mascot').then(module => module.CommunityMascot), { ssr: false });
const applicationRoutes = ['/dashboard', '/admin', '/login', '/not-a-member'];

export function MascotLoader() {
  const pathname = usePathname();
  const excluded = applicationRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (excluded) return;
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(handle);
  }, [excluded]);
  return ready && !excluded ? <Mascot /> : null;
}
