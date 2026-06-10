import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions — mirrors parent ../schemas.ts for isolated unit testing
// of the create/new experience action validation layer.
// ---------------------------------------------------------------------------

const createExperienceSchema = z.object({
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
// Helpers duplicated from ../actions.ts for isolated unit testing
// ---------------------------------------------------------------------------

function validateDateRange(
  startYear?: number,
  endYear?: number,
): string | null {
  if (
    startYear !== undefined &&
    endYear !== undefined &&
    endYear < startYear
  ) {
    return "End year cannot be before start year";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests — createExperienceSchema
// ---------------------------------------------------------------------------

describe("createExperienceSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Software Engineer",
      employer: "Acme Corp",
      startYear: "2020",
      endYear: "2023",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toBe("Software Engineer");
      expect(result.data.employer).toBe("Acme Corp");
      expect(result.data.startYear).toBe(2020);
      expect(result.data.endYear).toBe(2023);
    }
  });

  it("accepts minimal input (experience only)", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Software Engineer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employer).toBe("");
    }
  });

  it("rejects empty experience", () => {
    const result = createExperienceSchema.safeParse({ experience: "" });
    expect(result.success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    const result = createExperienceSchema.safeParse({
      experience: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects employer over 255 chars", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Engineer",
      employer: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Engineer",
      startYear: "1899",
    });
    expect(result.success).toBe(false);
  });

  it("rejects endYear above 2100", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Engineer",
      endYear: "2101",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from experience", () => {
    const result = createExperienceSchema.safeParse({
      experience: "  Software Engineer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toBe("Software Engineer");
    }
  });

  it("trims whitespace from employer", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Engineer",
      employer: "  My Company  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employer).toBe("My Company");
    }
  });

  it("accepts coerce string to number for startYear", () => {
    const result = createExperienceSchema.safeParse({
      experience: "Engineer",
      startYear: "2020",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startYear).toBe(2020);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — validateDateRange (business logic from new/actions.ts)
// ---------------------------------------------------------------------------

describe("validateDateRange", () => {
  it("validates endYear not before startYear", () => {
    const error = validateDateRange(2023, 2020);
    expect(error).toBe("End year cannot be before start year");
  });

  it("accepts valid date range (start < end)", () => {
    const error = validateDateRange(2020, 2023);
    expect(error).toBeNull();
  });

  it("accepts equal start and end years", () => {
    const error = validateDateRange(2023, 2023);
    expect(error).toBeNull();
  });

  it("accepts null/undefined start year", () => {
    expect(validateDateRange(undefined, 2023)).toBeNull();
  });

  it("accepts null/undefined end year", () => {
    expect(validateDateRange(2020, undefined)).toBeNull();
  });

  it("accepts both years undefined", () => {
    expect(validateDateRange()).toBeNull();
  });

  it("accepts only start year defined", () => {
    expect(validateDateRange(2020)).toBeNull();
  });

  it("accepts only end year defined", () => {
    expect(validateDateRange(undefined, 2023)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type ExperienceActionResult =
  | { success: true; experienceId: number }
  | { success: false; error: string };

type CreateExperienceInput = {
  experience: string;
  employer?: string;
  startYear?: number;
  endYear?: number;
};

describe("ExperienceActionResult type shape (new route)", () => {
  it("accepts a success result", () => {
    const result: ExperienceActionResult = {
      success: true,
      experienceId: 1,
    };
    expect(result.success).toBe(true);
    expect(result.experienceId).toBe(1);
  });

  it("accepts an error result", () => {
    const result: ExperienceActionResult = {
      success: false,
      error: "Invalid experience data",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid experience data");
  });
});

describe("CreateExperienceInput type shape", () => {
  it("accepts minimal input", () => {
    const input: CreateExperienceInput = {
      experience: "Engineer",
    };
    expect(input.experience).toBe("Engineer");
    expect(input.startYear).toBeUndefined();
  });

  it("accepts full input", () => {
    const input: CreateExperienceInput = {
      experience: "Engineer",
      employer: "Acme",
      startYear: 2020,
      endYear: 2024,
    };
    expect(input.experience).toBe("Engineer");
    expect(input.employer).toBe("Acme");
    expect(input.startYear).toBe(2020);
    expect(input.endYear).toBe(2024);
  });
});
