import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes: true — temporarily disabled (Next.js 15.5.x bug: ENOENT on pages-manifest.json)
  output: process.env.NODE_ENV === "production" && !process.env.CI ? "standalone" : undefined,
  // Externalize Playwright so webpack doesn't try to resolve chromium-bidi
  // (a transitive dep only available in pnpm's strict node_modules layout)
  serverExternalPackages: ["playwright", "playwright-core"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from even tracing playwright's dependencies.
      // serverExternalPackages externalizes the FINAL bundle but webpack still
      // resolves transitive deps during compilation, causing chromium-bidi errors.
      config.externals = [
        ...(Array.isArray(config.externals)
          ? config.externals
          : config.externals
            ? [config.externals]
            : []),
        "playwright",
        "playwright-core",
      ];
    }
    return config;
  },
};

export default nextConfig;
