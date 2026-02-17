import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    process.env.SKIP_ENV_VALIDATION = "true";
  }

  return {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
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
        }
      ],
    },
    serverExternalPackages: ['pg', '@prisma/adapter-pg'],
    
    // Performance optimizations
    experimental: {
      optimizePackageImports: ['lucide-react', 'recharts'],
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
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
  };
};

export default nextConfig;
