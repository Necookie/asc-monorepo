import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NavBar } from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';
import { SystemAnnouncementBanner } from '@/components/layout/system-announcement';
import { AscMotionProvider } from '@/components/motion/motion-provider';
import { MascotLoader } from '@/components/motion/mascot-loader';
import { resolveCurrentSession } from '@/lib/auth/session';
import { getNavigationAccount } from '@/lib/auth/navigation';
import { getPublicAnnouncement } from '@/lib/queries/site-settings';

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  variable: '--font-atkinson',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://asc.necookie.dev'),
  title: {
    template: '%s | ASC',
    default: 'ASC (Beta) — Community Identity & Member Discovery',
  },
  description:
    'A community-first digital identity, member discovery, and profile customization platform. Currently in public beta.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/asc-mark-v2.png', type: 'image/png' },
    ],
    apple: '/asc-mark-v2.png',
  },
  openGraph: {
    title: 'ASC (Beta) — Community Identity & Member Discovery',
    description:
      'A community-first digital identity, member discovery, and profile customization platform. Currently in public beta.',
    images: [{ url: '/asc-banner.png', width: 1200, height: 630, alt: 'ASC' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

async function MemberNavigation() {
  return <NavBar account={getNavigationAccount(await resolveCurrentSession())} />;
}

async function SystemAnnouncement() {
  const announcement = await getPublicAnnouncement();
  return <SystemAnnouncementBanner announcement={announcement} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k'}
      signInUrl="/login"
      signUpUrl="/login"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: 'var(--asc-primary)',
          colorBackground: 'var(--asc-surface-onyx)',
          colorText: 'var(--asc-ink)',
          colorTextSecondary: 'var(--asc-ink-secondary)',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html
        lang="en"
        className={`${atkinson.variable} ${bricolage.variable} dark`}
        suppressHydrationWarning
      >
        <head>
          <script
            id="asc-theme-init"
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    var stored = window.localStorage.getItem('asc-theme');
                    var theme = stored === 'light' || stored === 'dark'
                      ? stored
                      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                    var root = document.documentElement;
                    root.classList.toggle('dark', theme === 'dark');
                    root.classList.toggle('light', theme === 'light');
                    root.dataset.theme = theme;
                  } catch (_) {}
                })();
              `,
            }}
          />
        </head>
        <body className="asc-mesh-bg text-ink min-h-screen flex flex-col antialiased selection:bg-primary selection:text-ink-dark">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink-dark">
            Skip to main content
          </a>
          <AscMotionProvider>
            <Suspense fallback={null}><SystemAnnouncement /></Suspense>
            <Suspense fallback={<NavBar account={{ status: 'LOADING' }} />}><MemberNavigation /></Suspense>
            <main id="main-content" tabIndex={-1} className="flex-1 scroll-mt-20">{children}</main>
            <Footer />
            <MascotLoader />
          </AscMotionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
