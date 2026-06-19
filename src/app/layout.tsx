import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'BallKnowledge | World Cup 2026 Reputation Arena',
  description: "Enter the world's most premium football debate arena. Lock in match predictions, submit bold hot takes, claim collectible Verdict Cards, and build your season-based BallKnowledge Profile.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.vercel.app'),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'BallKnowledge | World Cup 2026 Reputation Arena',
    description: "Enter the world's most premium football debate arena. Lock in match predictions, submit bold hot takes, claim collectible Verdict Cards, and build your season-based BallKnowledge Profile.",
    type: 'website',
    locale: 'en_US',
    siteName: 'BallKnowledge',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'BallKnowledge — World Cup 2026 Reputation Arena',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BallKnowledge | World Cup 2026',
    description: "Football predictions, hot takes, and collectible Verdict Cards for World Cup 2026.",
    images: ['/images/og-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-background">
        <Providers>
          <SmoothScroll />
          <Navbar />
          <main className="flex-grow flex flex-col">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
