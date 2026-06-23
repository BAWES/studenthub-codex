import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: process.env.NODE_ENV === "production" && !process.env.CI ? "standalone" : undefined,
  // Externalize Playwright so webpack doesn't try to resolve chromium-bidi
  // (a transitive dep only available in pnpm's strict node_modules layout)
  serverExternalPackages: ["playwright", "playwright-core", "chromium-bidi", "pg", "typesense", "mysql2"],
};

export default nextConfig;
