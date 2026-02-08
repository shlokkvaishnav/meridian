import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bullmq'],
  },
};

export default nextConfig;
