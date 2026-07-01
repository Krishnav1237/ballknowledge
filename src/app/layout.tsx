import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'BallKnowledge | World Cup 2026 Reputation Arena',
  description: "Enter the world's most premium football debate arena. Lock in match predictions, submit bold hot takes, claim collectible Verdict Cards, and build your season-based BallKnowledge Profile.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ballknowledge.live'),
  icons: {
    icon: '/images/ball_knowledge_logo.png',
    shortcut: '/images/ball_knowledge_logo.png',
    apple: '/images/ball_knowledge_logo.png',
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

const devHydrationNoiseFilter = `
(function () {
  if (window.__bkHydrationNoiseFilterInstalled) return;
  window.__bkHydrationNoiseFilterInstalled = true;

  var originalError = console.error.bind(console);
  var extensionMarkers = ['__gcruniqueid', 'apolloio', 'zp-open-popup-button', 'grammarly'];
  var hydrationMarkers = ['hydration failed', 'a tree hydrated but some attributes', "didn't match the client properties", "didn't match the server", 'does not match the server'];

  function textFrom(args) {
    return args.map(function (arg) {
      if (!arg) return '';
      if (typeof arg === 'string') return arg;
      if (arg.message || arg.stack) return [arg.message, arg.stack].filter(Boolean).join(' ');
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ').toLowerCase();
  }

  function isKnownExtensionHydrationNoise(args) {
    var text = textFrom(args);
    return hydrationMarkers.some(function (marker) { return text.indexOf(marker) !== -1; }) &&
      extensionMarkers.some(function (marker) { return text.indexOf(marker) !== -1; });
  }

  console.error = function () {
    var args = Array.prototype.slice.call(arguments);
    if (isKnownExtensionHydrationNoise(args)) return;
    originalError.apply(console, args);
  };

  window.addEventListener('error', function (event) {
    if (isKnownExtensionHydrationNoise([event.message, event.error])) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', function (event) {
    if (isKnownExtensionHydrationNoise([event.reason])) {
      event.preventDefault();
    }
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-background" suppressHydrationWarning>
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="bk-dev-hydration-noise-filter"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: devHydrationNoiseFilter }}
          />
        )}
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
