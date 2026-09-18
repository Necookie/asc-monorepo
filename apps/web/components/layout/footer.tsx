import * as React from 'react';
import Link from 'next/link';
import { AscLogo } from '@/components/ui/asc-logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070928] pt-16 pb-12 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <AscLogo size="md" href="/" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Community-first digital identity, member discovery, and expressive profile customization.
            </p>
          </div>

          {/* Column: Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-[var(--font-display)]">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-[var(--font-display)]">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-[var(--font-display)]">
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9498bd] gap-4">
          <p>© {new Date().getFullYear()} ASC. All rights reserved.</p>
          <div className="font-extrabold tracking-widest text-[#1e2353] text-xl font-[var(--font-display)] select-none">
            ASC
          </div>
        </div>
      </div>
    </footer>
  );
}
