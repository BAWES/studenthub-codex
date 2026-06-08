import { describe, it, expect } from "vitest";

describe("CompanyLayout", () => {
  it("re-exports CompanyLayout from barrel", async () => {
    const mod = await import("./index");
    expect(mod.CompanyLayout).toBeDefined();
  });

  it("has dynamic = force-dynamic in layout", async () => {
    const mod = await import("./CompanyLayout");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
