import * as React from 'react';
import Link from 'next/link';
import { AscLogo } from '@/components/ui/asc-logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-surface-black pt-16 pb-12 text-ink-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <AscLogo size="md" href="/" />
            <p className="text-sm text-muted leading-relaxed">
              Community-first digital identity, member discovery, and expressive profile customization.
            </p>
          </div>

          {/* Column: Community */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/members" className="hover:text-white transition-colors">
                  Members Directory
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Explore Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-white transition-colors">
                  Customize Profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard/appearance" className="hover:text-white transition-colors">
                  Appearance
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Information
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & decorative watermark */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted gap-4">
          <p>© {new Date().getFullYear()} ASC. All rights reserved.</p>
          <div className="font-semibold tracking-widest text-muted/40 text-xl font-[var(--font-display)] select-none">
            ASC
          </div>
        </div>
      </div>
    </footer>
  );
}
