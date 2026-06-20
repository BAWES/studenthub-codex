import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Barrel re-export verification — the app-level actions.ts is now a barrel
// re-export of @/modules/candidates/agencies/actions. These tests verify
// that the barrel resolves the correct exports.
// Real logic behavior is tested in src/modules/candidates/agencies/actions.test.ts.
// ---------------------------------------------------------------------------

describe("[id] actions barrel", () => {
  it("exports getAgency as a function", async () => {
    const { getAgency } = await import("./actions");
    expect(typeof getAgency).toBe("function");
  });

  it("exports updateAgency as a function", async () => {
    const { updateAgency } = await import("./actions");
    expect(typeof updateAgency).toBe("function");
  });

  it("exports deleteAgency as a function", async () => {
    const { deleteAgency } = await import("./actions");
    expect(typeof deleteAgency).toBe("function");
  });
});
