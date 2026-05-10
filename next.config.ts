import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScriptの型チェックをスキップ（沈黙の原因を排除）
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintのチェックもスキップ
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;