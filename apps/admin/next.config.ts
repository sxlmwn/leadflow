import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@leadflow/shared"],
  reactStrictMode: true,
};

export default nextConfig;
