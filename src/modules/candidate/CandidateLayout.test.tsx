import { describe, it, expect } from "vitest";

describe("CandidateLayout", () => {
  it("re-exports CandidateLayout from barrel", async () => {
    const mod = await import("./index");
    expect(mod.CandidateLayout).toBeDefined();
  });

  it("has dynamic = force-dynamic in layout", async () => {
    const mod = await import("./CandidateLayout");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
