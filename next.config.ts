import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
};

export default nextConfig;
