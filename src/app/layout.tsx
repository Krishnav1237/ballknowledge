import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BallKnowledge | World Cup 2026 Reputation Arena',
  description: "Enter the world's most premium football debate arena. Lock in match predictions, submit bold hot takes, claim collectible Verdict Cards, and build your season-based BallKnowledge Profile.",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'BallKnowledge | World Cup 2026 Reputation Arena',
    description: "Enter the world's most premium football debate arena. Lock in match predictions, submit bold hot takes, claim collectible Verdict Cards, and build your season-based BallKnowledge Profile.",
    type: 'website',
    locale: 'en_US',
    siteName: 'BallKnowledge',
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
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
