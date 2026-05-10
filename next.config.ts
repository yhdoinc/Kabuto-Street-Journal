import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelでのデプロイを最適化し、パスの迷子を防ぎます
  output: 'standalone', 
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;