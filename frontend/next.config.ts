import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "node:path";

// Local dev env files live at the repo root (shared with the backend
// workspace), not here — Next.js only auto-loads .env* from its own cwd
// (this directory), so load the root files explicitly. Deployed
// environments (Render/Vercel) inject env vars directly, so this only
// matters for local `next dev`/`next start`.
config({ path: path.resolve(__dirname, "../.env.local") });
config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // 'unsafe-inline' on script-src/style-src is compatibility debt, not
            // an endorsed default: Next.js injects inline hydration data and the
            // app has no nonce infrastructure yet. Removing it requires wiring a
            // per-request nonce through the root layout (see Next.js CSP docs).
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://avatars.githubusercontent.com https://github.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      }
    ],
  },

  serverExternalPackages: ['pg', '@prisma/adapter-pg'],

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react']
  },

  // Webpack optimizations for faster dev builds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    }
  }
};

export default nextConfig;
