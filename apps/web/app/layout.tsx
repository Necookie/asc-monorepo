import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { NavBar } from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';
import { AscMotionProvider } from '@/components/motion/motion-provider';

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
          colorText: '#f7f7ff',
          colorTextSecondary: '#a3a6c2',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html lang="en" className={`${atkinson.variable} ${bricolage.variable} dark`}>
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
        <body className="asc-mesh-bg text-ink min-h-screen flex flex-col antialiased selection:bg-[#5865f2] selection:text-[#f7f7ff]">
          <AscMotionProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AscMotionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
