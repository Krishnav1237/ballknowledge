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
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Flag CDN for team flags
      { protocol: 'https', hostname: 'flagcdn.com' },
      // DiceBear avatar API (used for default avatars)
      { protocol: 'https', hostname: 'api.dicebear.com' },
      // OpenRouter / Fal.ai CDN — serves AI-generated card images
      { protocol: 'https', hostname: '**.fal.media' },
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: '**.openrouter.ai' },
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
