import { Metadata } from 'next';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Users, RefreshCw, LogOut, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Not a Community Member',
  description: 'Join the ASC community on Discord to activate your profile.',
};

export default function NotAMemberPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* Radial atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#f59e0b]/10 rounded-full blur-[130px] pointer-events-none" />

      <Card className="relative max-w-lg w-full bg-[#0e1245]/90 border-[rgba(245,158,11,0.3)] shadow-2xl p-8 text-center">
        <CardContent className="p-0 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center mx-auto text-[#f59e0b]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
              Not a Community Member Yet
            </h1>
            <p className="text-sm text-[#c7c9e5] leading-relaxed">
              You’ve successfully authenticated with Discord, but we couldn’t find an active member record for your account in the ASC community server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.15)] text-left text-xs text-[#8b92d6] space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-[#5865f2]" />
              How ASC Profiles Work
            </div>
            <p>
              ASC does not use manual registration forms. Profiles are created automatically when members join the ASC Discord server.
            </p>
            <p>
              If you just joined Discord in the last few seconds, please wait a moment for the synchronization bot to ingest your membership, then refresh.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="green" size="lg" className="w-full gap-2 text-sm font-bold">
                Join ASC on Discord
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" size="md" className="w-full gap-1.5 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Check Again
                </Button>
              </Link>
              <SignOutButton redirectUrl="/">
                <Button variant="ghost" size="md" className="w-full gap-1.5 text-xs text-[#ff8f91] hover:bg-[#ed4245]/15">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(88,101,242,0.15)]">
            <Link
              href="/members"
              className="text-xs text-[#8b92d6] hover:text-white transition-colors"
            >
              ← Or browse public community members
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
