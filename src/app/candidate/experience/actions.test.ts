import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  experienceItemSchema,
  experienceActionResultSchema,
  experienceListOutputSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Schemas (duplicated for isolated unit testing)
// ---------------------------------------------------------------------------

const listExperienceSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

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

const updateExperienceSchema = z.object({
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

const deleteExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive("Experience ID is required"),
});

// ---------------------------------------------------------------------------
// Types (for shape tests)
// ---------------------------------------------------------------------------

type ExperienceItem = {
  candidate_experience_id: number;
  candidate_id: number | null;
  experience: string;
  employer: string | null;
  start_year: number | null;
  end_year: number | null;
  created_at: Date | null;
};

type ExperienceActionResult =
  | { success: true; experienceId: number }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Pure helper logic (for testable validation)
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
// Tests — listExperienceSchema
// ---------------------------------------------------------------------------

describe("listExperienceSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listExperienceSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listExperienceSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listExperienceSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listExperienceSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — getExperienceSchema
// ---------------------------------------------------------------------------

describe("getExperienceSchema", () => {
  it("accepts a valid experience ID", () => {
    const result = getExperienceSchema.safeParse({ experienceId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(42);
    }
  });

  it("rejects zero experience ID", () => {
    const result = getExperienceSchema.safeParse({ experienceId: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects missing experience ID", () => {
    const result = getExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

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
  });

  it("rejects empty experience", () => {
    const result = createExperienceSchema.safeParse({
      experience: "",
    });
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
      experience: "  Engineer  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toBe("Engineer");
    }
  });

  it("validates endYear not before startYear", () => {
    const error = validateDateRange(2023, 2020);
    expect(error).toBe("End year cannot be before start year");
  });

  it("accepts valid date range", () => {
    const error = validateDateRange(2020, 2023);
    expect(error).toBeNull();
  });

  it("accepts null start/end years", () => {
    expect(validateDateRange()).toBeNull();
    expect(validateDateRange(2020)).toBeNull();
    expect(validateDateRange(undefined, 2023)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests — updateExperienceSchema
// ---------------------------------------------------------------------------

describe("updateExperienceSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: "1",
      experience: "Senior Engineer",
      employer: "New Corp",
      startYear: "2021",
      endYear: "2024",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(1);
      expect(result.data.experience).toBe("Senior Engineer");
    }
  });

  it("rejects missing experienceId", () => {
    const result = updateExperienceSchema.safeParse({
      experience: "Engineer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: "-1",
      experience: "Engineer",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — deleteExperienceSchema
// ---------------------------------------------------------------------------

describe("deleteExperienceSchema", () => {
  it("accepts valid id", () => {
    const result = deleteExperienceSchema.safeParse({ experienceId: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(1);
    }
  });

  it("rejects missing id", () => {
    const result = deleteExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("ExperienceItem type shape", () => {
  it("accepts a valid experience object", () => {
    const mock: ExperienceItem = {
      candidate_experience_id: 1,
      candidate_id: 42,
      experience: "Software Engineer",
      employer: "Acme Corp",
      start_year: 2020,
      end_year: 2023,
      created_at: new Date(),
    };
    expect(mock.candidate_experience_id).toBe(1);
    expect(mock.experience).toBe("Software Engineer");
    expect(mock.employer).toBe("Acme Corp");
  });
});

describe("ExperienceActionResult type shape", () => {
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
      error: "Experience not found",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Experience not found");
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("experienceItemSchema (output validation)", () => {
  it("accepts a valid experience item", () => {
    const valid = {
      candidate_experience_id: 1,
      candidate_id: 42,
      experience: "Software Engineer",
      employer: "Acme Corp",
      start_year: 2020,
      end_year: 2024,
      created_at: new Date("2024-01-01"),
    };
    const r = experienceItemSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item = {
      candidate_experience_id: 1,
      candidate_id: null,
      experience: "Intern",
      employer: null,
      start_year: null,
      end_year: null,
      created_at: null,
    };
    const r = experienceItemSchema.safeParse(item);
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = experienceItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-positive id", () => {
    const r = experienceItemSchema.safeParse({
      candidate_experience_id: 0,
      candidate_id: null,
      experience: "Test",
      employer: null,
      start_year: null,
      end_year: null,
      created_at: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty experience string", () => {
    const r = experienceItemSchema.safeParse({
      candidate_experience_id: 1,
      candidate_id: null,
      experience: "",
      employer: null,
      start_year: null,
      end_year: null,
      created_at: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("experienceActionResultSchema (output validation)", () => {
  it("accepts a successful result", () => {
    const r = experienceActionResultSchema.safeParse({
      success: true,
      experienceId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result", () => {
    const r = experienceActionResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
    // Use type assertion because Zod's safeParse discriminated union
    // narrows r.data to the success variant when success=true
    const data = r.data as { success: false; error: string };
    expect(data.error).toBe("Something went wrong");
  });

  it("rejects a result missing error on failure", () => {
    const r = experienceActionResultSchema.safeParse({
      success: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a result with negative experienceId", () => {
    const r = experienceActionResultSchema.safeParse({
      success: true,
      experienceId: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a result with non-integer experienceId", () => {
    const r = experienceActionResultSchema.safeParse({
      success: true,
      experienceId: 42.5,
    });
    expect(r.success).toBe(false);
  });
});

describe("experienceListOutputSchema (output validation)", () => {
  it("accepts an empty list", () => {
    const r = experienceListOutputSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("accepts a list of valid items", () => {
    const items = [
      {
        candidate_experience_id: 1,
        candidate_id: 42,
        experience: "Software Engineer",
        employer: "Acme Corp",
        start_year: 2020,
        end_year: 2024,
        created_at: new Date("2024-01-01"),
      },
      {
        candidate_experience_id: 2,
        candidate_id: 42,
        experience: "Junior Developer",
        employer: "Startup Inc",
        start_year: 2018,
        end_year: 2020,
        created_at: new Date("2023-06-15"),
      },
    ];
    const r = experienceListOutputSchema.safeParse(items);
    expect(r.success).toBe(true);
  });

  it("rejects items with missing fields", () => {
    const r = experienceListOutputSchema.safeParse([
      { candidate_experience_id: 1 },
    ]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array input", () => {
    const r = experienceListOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
