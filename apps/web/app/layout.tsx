import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NavBar } from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';
import { AscMotionProvider } from '@/components/motion/motion-provider';
import { CommunityMascot } from '@/components/motion/community-mascot';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | ASC',
    default: 'ASC — Community Identity & Member Discovery',
  },
  description:
    'A community-first digital identity, member discovery, and profile customization platform.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/asc-mark.png', type: 'image/png' },
    ],
    apple: '/asc-mark.png',
  },
  openGraph: {
    title: 'ASC — Community Identity & Member Discovery',
    description:
      'A community-first digital identity, member discovery, and profile customization platform.',
    images: [{ url: '/asc-banner.png', width: 1200, height: 630, alt: 'ASC' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0d3a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k'}
      appearance={{
        variables: {
          colorPrimary: '#5865f2',
          colorBackground: '#0e1245',
          colorText: '#ffffff',
          colorTextSecondary: '#8b92d6',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  window.addEventListener('unhandledrejection', function(event) {
                    if (event.reason && (
                      (typeof event.reason.message === 'string' && event.reason.message.includes('Clerk')) ||
                      (typeof event.reason.code === 'string' && event.reason.code.includes('clerk'))
                    )) {
                      event.preventDefault();
                    }
                  });
                }
              `,
            }}
          />
        </head>
        <body className="asc-mesh-bg text-white min-h-screen flex flex-col antialiased selection:bg-[#5865f2] selection:text-white relative">
          {/* Atmospheric After School Club Classroom Background */}
          <div
            className="fixed inset-0 -z-50 pointer-events-none overflow-hidden select-none"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -50,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <img
              src="/asc-clubroom-bg.webp"
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: 0.45,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(7, 9, 30, 0.5)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, #050716, rgba(7, 9, 36, 0.4), rgba(10, 13, 58, 0.65))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(ellipse at center, transparent 30%, #050716 92%)',
              }}
            />
          </div>

          <AscMotionProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CommunityMascot />
          </AscMotionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
