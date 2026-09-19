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
        <body className="asc-mesh-bg text-white min-h-screen flex flex-col antialiased selection:bg-[#5865f2] selection:text-white">
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
