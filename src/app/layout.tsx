import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import AppEffects from '@/components/AppEffects';
import { outfit, spaceGrotesk, oswald } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'BallKnowledge | Take #1',
  description: 'Rank is the OVR. Call the next fixture and take #1.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live'),
  icons: {
    icon: '/images/ball_knowledge_logo.png',
    shortcut: '/images/ball_knowledge_logo.png',
    apple: '/images/ball_knowledge_logo.png',
  },
  openGraph: {
    title: 'BallKnowledge | Take #1',
    description: 'Rank is the OVR. Call the next fixture and take #1.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BallKnowledge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BallKnowledge | Take #1',
    description: 'Rank is the OVR. Come take #1.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark ${outfit.variable} ${spaceGrotesk.variable} ${oswald.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-background" suppressHydrationWarning>
        <Providers>
          <AppEffects />
          <SiteHeader />
          <main className="flex-1 flex flex-col min-h-0 pt-[var(--nav-h)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
