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
  // Ignore TypeScript errors during builds (if needed)
  // Uncomment the line below ONLY if TypeScript compilation is causing the hang
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Optimize package imports to reduce bundle size and build time
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
};

export default nextConfig;
