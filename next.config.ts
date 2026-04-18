import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.SKIP_NEXT_TYPESCRIPT === "true",
  },
};

export default nextConfig;
