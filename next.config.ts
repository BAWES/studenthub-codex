import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes: true — temporarily disabled (Next.js 15.5.x bug: ENOENT on pages-manifest.json)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;
