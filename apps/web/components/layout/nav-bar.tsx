import * as React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Compass, Users, Home, User } from 'lucide-react';
import { AscLogo } from '@/components/ui/asc-logo';

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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(88,101,242,0.15)] bg-[#0a0d3a]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <AscLogo size="md" href="/" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/60 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/members"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/60 transition-colors"
            >
              <Users className="w-4 h-4" />
              Members
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[#c7c9e5] hover:text-white hover:bg-[#1e2353]/60 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
          </nav>
        </div>

        {/* User CTA / Auth */}
        <div className="flex items-center gap-3">
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
                    <Button variant="primary" size="sm">
                      My Profile
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3">
              <SignedOut>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
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
    </header>
  );
}
