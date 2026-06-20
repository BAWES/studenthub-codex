"use client";

import { FeatureGrid } from "./FeatureGrid";
import { navForRole } from "./navigation";

/**
 * Client wrapper around FeatureGrid for the admin dashboard.
 *
 * navForRole() returns items with LucideIcon (function) values that cannot
 * be serialised across the server–client boundary. By keeping this file
 * marked "use client", the icons stay on the client where they belong.
 */
export function AdminFeatureGrid() {
  const items = navForRole("admin").filter((item) => item.href !== "/admin");
  return <FeatureGrid items={items} />;
}
