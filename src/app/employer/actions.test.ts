import { describe, it, expect } from "vitest";
import {
  listJobs,
  getJob,
  createJob,
  getMyEmployerId,
} from "./actions";

describe("employer page-level actions barrel", () => {
  it("re-exports listJobs as a function", () => {
    expect(typeof listJobs).toBe("function");
  });

  it("re-exports getJob as a function", () => {
    expect(typeof getJob).toBe("function");
  });

  it("re-exports createJob as a function", () => {
    expect(typeof createJob).toBe("function");
  });

  it("re-exports getMyEmployerId as a function", () => {
    expect(typeof getMyEmployerId).toBe("function");
  });
});
