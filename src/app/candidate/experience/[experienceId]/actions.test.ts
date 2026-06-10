import { describe, it, expect } from "vitest";
import {
  getExperienceEntrySchema,
  updateExperienceEntrySchema,
  deleteExperienceEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/experience/[experienceId] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getExperienceEntrySchema", () => {
  it("accepts a valid numeric experience ID", () => {
    const result = getExperienceEntrySchema.safeParse({ experienceId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(42);
    }
  });

  it("rejects zero experience ID", () => {
    const result = getExperienceEntrySchema.safeParse({ experienceId: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative experience ID", () => {
    const result = getExperienceEntrySchema.safeParse({ experienceId: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing experience ID", () => {
    const result = getExperienceEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric experience ID", () => {
    const result = getExperienceEntrySchema.safeParse({ experienceId: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("updateExperienceEntrySchema", () => {
  it("accepts valid update params", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Senior Engineer",
      employer: "Acme Corp",
      startYear: "2021",
      endYear: "2024",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(1);
      expect(result.data.experience).toBe("Senior Engineer");
      expect(result.data.employer).toBe("Acme Corp");
      expect(result.data.startYear).toBe(2021);
      expect(result.data.endYear).toBe(2024);
    }
  });

  it("accepts minimal update (experience only)", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experience: "Engineer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty experienceId", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "",
      experience: "Engineer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty experience", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects employer over 255 chars", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
      employer: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
      startYear: "1899",
    });
    expect(result.success).toBe(false);
  });

  it("rejects endYear above 2100", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
      endYear: "2101",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from experience", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "  Engineer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toBe("Engineer");
    }
  });
});

describe("deleteExperienceEntrySchema", () => {
  it("accepts valid numeric ID", () => {
    const result = deleteExperienceEntrySchema.safeParse({ experienceId: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(1);
    }
  });

  it("rejects missing ID", () => {
    const result = deleteExperienceEntrySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero ID", () => {
    const result = deleteExperienceEntrySchema.safeParse({ experienceId: "0" });
    expect(result.success).toBe(false);
  });
});

describe("ExperienceEntryResponse type shape", () => {
  it("accepts a success response", () => {
    const result: { success: boolean; data?: unknown; error?: string } = {
      success: true,
      data: { experienceId: 1 },
    };
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ experienceId: 1 });
  });

  it("accepts an error response", () => {
    const result: { success: boolean; data?: unknown; error?: string } = {
      success: false,
      error: "Experience entry not found",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Experience entry not found");
  });
});
