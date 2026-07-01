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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com https://frontend-cdn.perplexity.ai",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://openrouter.ai https://api.dicebear.com https://flagcdn.com https://*.cloudflareinsights.com https://cloudflareinsights.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['ballknowledge.live'],
  devIndicators: false,
  images: {
    remotePatterns: [
      // Flag CDN for team flags
      { protocol: 'https', hostname: 'flagcdn.com' },
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
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/football-court', destination: '/world-cup-hub', permanent: true },
      { source: '/match-oracle', destination: '/world-cup-hub', permanent: true },
      { source: '/rate-my-take', destination: '/world-cup-hub', permanent: true },
    ];
  },
};

export default nextConfig;
