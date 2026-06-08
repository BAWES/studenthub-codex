import { describe, it, expect } from "vitest";

describe("InspectorLayout", () => {
  it("re-exports InspectorLayout from barrel", async () => {
    const mod = await import("./index");
    expect(mod.InspectorLayout).toBeDefined();
  });

  it("has dynamic = force-dynamic in layout", async () => {
    const mod = await import("./InspectorLayout");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
