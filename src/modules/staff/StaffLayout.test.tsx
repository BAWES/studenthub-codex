import { describe, it, expect } from "vitest";

describe("StaffLayout", () => {
  it("re-exports StaffLayout from barrel", async () => {
    const mod = await import("./index");
    expect(mod.StaffLayout).toBeDefined();
  });

  it("has dynamic = force-dynamic in layout", async () => {
    const mod = await import("./StaffLayout");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
