import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, UserX } from 'lucide-react';

export default function ProfileNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[rgba(236,72,189,0.15)] border border-[rgba(236,72,189,0.3)] flex items-center justify-center mx-auto text-[#ec48bd] shadow-lg">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-[var(--font-display)] tracking-tight">
            MEMBER NOT FOUND
          </h1>
          <p className="text-sm sm:text-base text-[#c7c9e5] leading-relaxed">
            We couldn&apos;t find an ASC member with this profile slug. The member might not have joined the community yet, or their username may have changed.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/members">
            <Button variant="primary" size="md" className="gap-2">
              <Users className="w-4 h-4" />
              Browse All Members
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
