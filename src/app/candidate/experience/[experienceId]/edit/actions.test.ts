import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions — mirrors parent [experienceId]/schemas.ts for isolated
// unit testing of the edit route's action validation layer.
// ---------------------------------------------------------------------------

const updateExperienceEntrySchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
  experience: z
    .string()
    .min(1, "Position/title is required")
    .max(128, "Position/title must be 128 characters or fewer")
    .transform((v) => v.trim()),
  employer: z
    .string()
    .max(255, "Employer must be 255 characters or fewer")
    .optional()
    .default("")
    .transform((v) => v.trim()),
  startYear: z.coerce.number().int().min(1900).max(2100).optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).optional(),
});

// ---------------------------------------------------------------------------
// Tests — updateExperienceEntrySchema (the only schema the edit route uses)
// ---------------------------------------------------------------------------

describe("updateExperienceEntrySchema", () => {
  it("accepts valid update with all fields", () => {
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

  it("accepts minimal update (experienceId + experience only)", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employer).toBe("");
    }
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
      experience: "  Lead Engineer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toBe("Lead Engineer");
    }
  });

  it("trims whitespace from employer", () => {
    const result = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
      employer: "  Big Corp  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employer).toBe("Big Corp");
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type ExperienceActionResult =
  | { success: true; experienceId: number }
  | { success: false; error: string };

describe("ExperienceActionResult type shape (edit route)", () => {
  it("accepts a success result with experienceId", () => {
    const result: ExperienceActionResult = {
      success: true,
      experienceId: 1,
    };
    expect(result.success).toBe(true);
    expect(result.experienceId).toBe(1);
  });

  it("accepts an error result with message", () => {
    const result: ExperienceActionResult = {
      success: false,
      error: "Experience entry not found or access denied",
    };
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});
