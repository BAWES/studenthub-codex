import { describe, it, expect } from "vitest";
import {
  profileMetricsSchema,
  getCandidateProfileDetailResultSchema,
} from "./schemas";

describe("candidate profile page — data contract", () => {
  it("profileMetricsSchema validates valid metrics", () => {
    const r = profileMetricsSchema.safeParse({
      experienceCount: 3, educationCount: 2, skillCount: 8,
      certificationCount: 1, languageCount: 2, applicationCount: 5,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.experienceCount).toBe(3);
  });

  it("profileMetricsSchema rejects negative counts", () => {
    const r = profileMetricsSchema.safeParse({
      experienceCount: -1, educationCount: 0, skillCount: 0,
      certificationCount: 0, languageCount: 0, applicationCount: 0,
    });
    expect(r.success).toBe(false);
  });

  it("profileMetricsSchema rejects missing required fields", () => {
    const r = profileMetricsSchema.safeParse({ experienceCount: 1 });
    expect(r.success).toBe(false);
  });

  it("getCandidateProfileDetailResultSchema validates combined result", () => {
    const r = getCandidateProfileDetailResultSchema.safeParse({
      detail: { name: "Ahmed" },
      metrics: { experienceCount: 3, educationCount: 2, skillCount: 5,
                 certificationCount: 1, languageCount: 2, applicationCount: 10 },
    });
    expect(r.success).toBe(true);
  });

  it("getCandidateProfileDetailResultSchema rejects missing metrics", () => {
    const r = getCandidateProfileDetailResultSchema.safeParse({ detail: {} });
    expect(r.success).toBe(false);
  });
});
