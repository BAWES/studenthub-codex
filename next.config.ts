import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes: true — temporarily disabled (Next.js 15.5.x bug: ENOENT on pages-manifest.json)
  output: process.env.NODE_ENV === "production" && !process.env.CI ? "standalone" : undefined,
  // Externalize Playwright so webpack doesn't try to resolve chromium-bidi
  // (a transitive dep only available in pnpm's strict node_modules layout)
  serverExternalPackages: ["playwright", "playwright-core", "chromium-bidi", "mysql2"],
};

export default nextConfig;
