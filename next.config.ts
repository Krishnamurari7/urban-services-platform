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
    // Set to true temporarily if build fails due to type errors
    // Set to false for strict type checking in production
    ignoreBuildErrors: false,
  },
  // Output configuration for better debugging
  output: "standalone",
};

export default nextConfig;
