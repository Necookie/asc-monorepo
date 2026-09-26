import { Metadata } from 'next';
import Link from 'next/link';
import { SignIn, SignOutButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { resolveCurrentSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, UserCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in with Discord to access and customize your ASC community profile.',
};

export default async function LoginPage() {
  const session = await resolveCurrentSession();
  if (session?.status === 'RESOLVED') redirect('/dashboard');
  if (session?.status === 'NOT_FOUND') redirect('/not-a-member');
  const unavailable = session?.status === 'UNAVAILABLE';
  const discordRequired = session?.status === 'UNLINKED_DISCORD';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Community Identity Explainer */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-muted border border-primary/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Community Digital Identity
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
              Welcome back to ASC
            </h1>
            <p className="mt-3 text-ink-secondary text-base leading-relaxed">
              Your community profile is already here. Sign in with the Discord account you use in ASC to make it yours.
            </p>
          </div>

          {discordRequired && (
            <div className="p-4 rounded-xl bg-[#ed4245]/15 border border-[#ed4245]/30 text-sm text-[#ff8f91] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#ed4245]" />
              <div>
                <span className="font-semibold text-ink">Discord Account Required</span>
                <p className="mt-0.5 text-xs text-[#ffb0b2]">
                  Your Clerk account must be connected with Discord to verify your community identity.
                </p>
              </div>
            </div>
          )}

          {/* Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-indigo/60 border border-border">
              <UserCheck className="w-5 h-5 text-[#35ed7e] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-ink">Automatic Profile</div>
                <div className="text-xs text-muted mt-0.5">
                  No registration form. Your profile was automatically generated when you joined Discord.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-indigo/60 border border-border">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-ink">Zero-Trust Ownership</div>
                <div className="text-xs text-muted mt-0.5">
                  Profile mutations are verified server-side against your immutable Discord Snowflake.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clerk Sign-In */}
        <div className="lg:col-span-6 flex justify-center">
          <Card className="w-full max-w-md bg-surface-indigo border-border p-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-ink">{unavailable ? 'We couldn’t open your profile' : discordRequired ? 'Use your Discord account' : 'Sign in with Discord'}</CardTitle>
              <CardDescription className="text-xs text-muted">
                {unavailable ? 'There is a temporary problem checking your session or member profile. Your saved profile is safe.' : discordRequired ? 'This session has no linked Discord identity. Sign out, then continue with Discord.' : 'Continue to your existing ASC profile'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {unavailable ? (
                <Link href="/login" prefetch={false}><Button>Try again</Button></Link>
              ) : discordRequired ? (
                <SignOutButton redirectUrl="/login"><Button>Sign out and try Discord</Button></SignOutButton>
              ) : <SignIn
                routing="hash"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton:
                      'bg-primary hover:bg-primary-hover text-ink-dark border-none py-3 font-semibold rounded-xl transition-all shadow-md',
                    socialButtonsBlockButtonText: 'text-ink font-semibold text-sm',
                    dividerRow: 'hidden',
                    formFieldInput: 'bg-surface-indigo border-border text-ink rounded-xl',
                    formButtonPrimary: 'bg-primary hover:bg-primary-hover text-ink-dark rounded-xl',
                    footerAction: 'hidden',
                  },
                }}
              />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
