import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import ServiceWorkerKiller from '@/components/ServiceWorkerKiller';

export const metadata: Metadata = {
  title: 'BallKnowledge | Prove you know ball',
  description: 'Call Premier League matches. Get an OVR card. Post it. Make your group chat look at the number.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live'),
  icons: {
    icon: '/images/ball_knowledge_logo.png',
    shortcut: '/images/ball_knowledge_logo.png',
    apple: '/images/ball_knowledge_logo.png',
  },
  openGraph: {
    title: 'BallKnowledge | Prove you know ball',
    description: 'Call Premier League matches. Get an OVR card. Post it. Make your group chat look at the number.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BallKnowledge',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'BallKnowledge — Prove you know ball',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BallKnowledge | Prove you know ball',
    description: "I'm dropping my OVR. Come take the card.",
    images: ['/images/og-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-background" suppressHydrationWarning>
        <Providers>
          <ServiceWorkerKiller />
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
