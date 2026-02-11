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
      domains: ['avatars.githubusercontent.com', 'github.com'],
    },
    serverExternalPackages: ['pg', '@prisma/adapter-pg'],
  };
};

export default nextConfig;
