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
  // Ignore ESLint during builds to prevent hanging
  // This is the most common cause of Vercel build hangs
  // Fix linting issues locally, but don't block deployments
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during builds (if needed)
  // Uncomment the line below ONLY if TypeScript compilation is causing the hang
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Optimize build performance
  swcMinify: true,
  // Optimize package imports to reduce bundle size and build time
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js"],
  },
};

export default nextConfig;
