import { describe, it, expect } from "vitest";

describe("AdminLayout", () => {
  it("re-exports AdminLayout from barrel", async () => {
    const mod = await import("./index");
    expect(mod.AdminLayout).toBeDefined();
  });

  it("has dynamic = force-dynamic in layout", async () => {
    // Force-dynamic is required for server components with auth — verify export
    const mod = await import("./AdminLayout");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
