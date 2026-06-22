import { describe, it, expect } from "vitest";
import {
  experienceItemOutputSchema,
  experienceActionResultOutputSchema,
} from "./schemas";

describe("candidate experience page — data contract", () => {
  it("experienceItemOutputSchema validates a valid experience item", () => {
    const r = experienceItemOutputSchema.safeParse({
      candidate_experience_id: 1,
      candidate_id: 42,
      experience: "Software Engineer",
      employer: "Tech Corp",
      start_year: 2020,
      end_year: 2023,
      created_at: new Date("2024-01-01"),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Software Engineer");
    }
  });

  it("experienceItemOutputSchema rejects missing candidate_experience_id", () => {
    const r = experienceItemOutputSchema.safeParse({ experience: "Engineer" });
    expect(r.success).toBe(false);
  });

  it("experienceItemOutputSchema allows nullable fields", () => {
    const r = experienceItemOutputSchema.safeParse({
      candidate_experience_id: 1, candidate_id: null, experience: "Engineer",
      employer: null, start_year: null, end_year: null, created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("experienceActionResultOutputSchema validates success", () => {
    const r = experienceActionResultOutputSchema.safeParse({ success: true, experienceId: 5 });
    expect(r.success).toBe(true);
  });

  it("experienceActionResultOutputSchema validates failure", () => {
    const r = experienceActionResultOutputSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("experienceActionResultOutputSchema rejects mixed success/failure", () => {
    const r = experienceActionResultOutputSchema.safeParse({ success: true, error: "extra" });
    expect(r.success).toBe(false);
  });
});
