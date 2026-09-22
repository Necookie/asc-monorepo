import { Metadata } from 'next';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, UserCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in with Discord to access and customize your ASC community profile.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Community Identity Explainer */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8b92d6] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#5865f2]/15 text-[#8b92d6] border border-[#5865f2]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#5865f2]" />
              Community Digital Identity
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
              Claim & Customize Your ASC Profile
            </h1>
            <p className="mt-3 text-[#c7c9e5] text-base leading-relaxed">
              Every current member of the ASC Discord server already has a public profile. Authenticate with Discord to claim yours.
            </p>
          </div>

          {error === 'discord_required' && (
            <div className="p-4 rounded-xl bg-[#ed4245]/15 border border-[#ed4245]/30 text-sm text-[#ff8f91] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#ed4245]" />
              <div>
                <span className="font-semibold text-white">Discord Account Required</span>
                <p className="mt-0.5 text-xs text-[#ffb0b2]">
                  Your Clerk account must be connected with Discord to verify your community identity.
                </p>
              </div>
            </div>
          )}

          {/* Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141943]/60 border border-[rgba(88,101,242,0.15)]">
              <UserCheck className="w-5 h-5 text-[#35ed7e] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">Automatic Profile</div>
                <div className="text-xs text-[#8b92d6] mt-0.5">
                  No registration form. Your profile was automatically generated when you joined Discord.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141943]/60 border border-[rgba(88,101,242,0.15)]">
              <ShieldCheck className="w-5 h-5 text-[#5865f2] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">Zero-Trust Ownership</div>
                <div className="text-xs text-[#8b92d6] mt-0.5">
                  Profile mutations are verified server-side against your immutable Discord Snowflake.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clerk Sign-In */}
        <div className="lg:col-span-6 flex justify-center">
          <Card className="w-full max-w-md bg-surface-indigo border-white/[0.1] p-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-white">Sign In</CardTitle>
              <CardDescription className="text-xs text-[#8b92d6]">
                Connect your Discord account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton:
                      'bg-[#5865f2] hover:bg-[#4752c4] text-white border-none py-3 font-semibold rounded-xl transition-all shadow-md',
                    socialButtonsBlockButtonText: 'text-white font-semibold text-sm',
                    dividerRow: 'hidden',
                    formFieldInput: 'bg-[#141943] border-[rgba(88,101,242,0.3)] text-white rounded-xl',
                    formButtonPrimary: 'bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl',
                    footerAction: 'hidden',
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
