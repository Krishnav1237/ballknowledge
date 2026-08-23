import path from "node:path";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Permissive CSP for image CDNs used by OpenRouter / BFL / DiceBear
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com https://frontend-cdn.perplexity.ai",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://openrouter.ai https://api.dicebear.com https://flagcdn.com https://*.cloudflareinsights.com https://cloudflareinsights.com https://accounts.google.com https://oauth2.googleapis.com https://api.groq.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  allowedDevOrigins: ['ballknowledge.live'],
  devIndicators: false,
  images: {
    remotePatterns: [
      // Flag CDN for team flags
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
      { protocol: 'https', hostname: 'resources.premierleague.com' },
      // DiceBear avatar API (used for default avatars)
      { protocol: 'https', hostname: 'api.dicebear.com' },
      // OpenRouter CDN — image generation results
      { protocol: 'https', hostname: '**.openrouter.ai' },
      { protocol: 'https', hostname: 'openrouter.ai' },
      // Fal.ai CDN — alternative OpenRouter image delivery
      { protocol: 'https', hostname: '**.fal.media' },
      { protocol: 'https', hostname: 'fal.media' },
      // Black Forest Labs (Flux) CDN — direct BFL image delivery
      { protocol: 'https', hostname: '**.bfl.ai' },
      { protocol: 'https', hostname: 'bfl.ai' },
      { protocol: 'https', hostname: '**.blackforestlabs.ai' },
      // General CDN wildcard for any provider-specific delivery URLs
      { protocol: 'https', hostname: '**.cdn.openai.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all page routes.
        // Do not override /_next/static Cache-Control — hashed chunks must stay
        // `immutable` so a new deploy cannot mix with a previous JS graph.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/world-cup-hub', destination: '/premier-league', permanent: true },
      { source: '/football-court', destination: '/premier-league', permanent: true },
      { source: '/match-oracle', destination: '/premier-league', permanent: true },
      { source: '/rate-my-take', destination: '/premier-league', permanent: true },
    ];
  },
};

export default nextConfig;
