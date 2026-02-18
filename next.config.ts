import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // ESLint configuration
  eslint: {
    // Ignore ESLint during builds to prevent patching issues on Vercel
    ignoreDuringBuilds: true,
  },
  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors during builds to prevent build failures
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
