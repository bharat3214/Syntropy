import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg'],
  experimental: {
    turbopack: {
      // Explicitly locks the root to the working directory where your .env lives
      root: __dirname, 
    },
  },
};

export default nextConfig;