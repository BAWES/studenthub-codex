import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes: true — temporarily disabled (Next.js 15.5.x bug: ENOENT on pages-manifest.json)
  // Standalone for Docker prod builds — skip in CI so `next start` works for E2E tests
  output: !process.env.CI && process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;
