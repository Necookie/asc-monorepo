import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Compass, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[rgba(88,101,242,0.15)] border border-[rgba(88,101,242,0.3)] flex items-center justify-center mx-auto text-[#5865f2] shadow-lg">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-[var(--font-display)] tracking-tight">
            PAGE NOT FOUND
          </h1>
          <p className="text-sm sm:text-base text-[#c7c9e5] leading-relaxed">
            The profile or page you are looking for does not exist, may have moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/members">
            <Button variant="primary" size="md" className="gap-2">
              <Users className="w-4 h-4" />
              Explore Members
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="md" className="gap-2">
              <Compass className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
