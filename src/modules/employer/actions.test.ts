import { describe, it, expect } from "vitest";

// The employer actions barrel re-exports from sub-modules.
// This test verifies the barrel resolves correctly and the exported
// values are the expected function types.
describe("employer actions barrel", () => {
  it("re-exports listJobs as a function", async () => {
    const { listJobs } = await import("./actions");
    expect(typeof listJobs).toBe("function");
  });

  it("re-exports getJob as a function", async () => {
    const { getJob } = await import("./actions");
    expect(typeof getJob).toBe("function");
  });

  it("re-exports createJob as a function", async () => {
    const { createJob } = await import("./actions");
    expect(typeof createJob).toBe("function");
  });

  it("re-exports updateJob as a function", async () => {
    const { updateJob } = await import("./actions");
    expect(typeof updateJob).toBe("function");
  });

  it("re-exports closeJob as a function", async () => {
    const { closeJob } = await import("./actions");
    expect(typeof closeJob).toBe("function");
  });

  it("re-exports deleteJob as a function", async () => {
    const { deleteJob } = await import("./actions");
    expect(typeof deleteJob).toBe("function");
  });

  it("re-exports getMyEmployerId as a function", async () => {
    const { getMyEmployerId } = await import("./actions");
    expect(typeof getMyEmployerId).toBe("function");
  });
});
