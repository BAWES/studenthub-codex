import { describe, it, expect } from "vitest";
import {
  listExperienceSchema,
  getExperienceSchema,
  createExperienceSchema,
  updateExperienceSchema,
  deleteExperienceSchema,
  experienceItemOutputSchema,
  experienceActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listExperienceSchema
// ---------------------------------------------------------------------------
describe("listExperienceSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listExperienceSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listExperienceSchema.safeParse({ page: 2, limit: 50 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listExperienceSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listExperienceSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listExperienceSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listExperienceSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getExperienceSchema
// ---------------------------------------------------------------------------
describe("getExperienceSchema", () => {
  it("accepts valid input", () => {
    expect(getExperienceSchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(getExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(getExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(getExperienceSchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric experienceId", () => {
    expect(getExperienceSchema.safeParse({ experienceId: "abc" }).success).toBe(false);
  });

  it("accepts coerced numeric string", () => {
    expect(getExperienceSchema.safeParse({ experienceId: "5" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createExperienceSchema
// ---------------------------------------------------------------------------
describe("createExperienceSchema", () => {
  it("accepts valid input with all fields", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Software Engineer",
        employer: "ACME Corp",
        startYear: 2020,
        endYear: 2024,
      }).success,
    ).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "Engineer" }).success,
    ).toBe(true);
  });

  it("rejects missing experience", () => {
    expect(createExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(createExperienceSchema.safeParse({ experience: "" }).success).toBe(false);
  });

  it("rejects experience exceeding 128 characters", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "x".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "Engineer", startYear: 1899 }).success,
    ).toBe(false);
  });

  it("rejects startYear above 2100", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "Engineer", startYear: 2101 }).success,
    ).toBe(false);
  });

  it("rejects employer exceeding 255 characters", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "Engineer", employer: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects non-integer startYear", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "Engineer", startYear: 2020.5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateExperienceSchema
// ---------------------------------------------------------------------------
describe("updateExperienceSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        experience: "Senior Engineer",
        employer: "ACME Corp",
        startYear: 2020,
        endYear: 2024,
      }).success,
    ).toBe(true);
  });

  it("accepts valid input with only required fields", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, experience: "Engineer" }).success,
    ).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(
      updateExperienceSchema.safeParse({ experience: "Engineer" }).success,
    ).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 0, experience: "Engineer" }).success,
    ).toBe(false);
  });

  it("rejects missing experience", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, experience: "" }).success,
    ).toBe(false);
  });

  it("rejects experience exceeding 128 characters", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, experience: "x".repeat(129) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteExperienceSchema
// ---------------------------------------------------------------------------
describe("deleteExperienceSchema", () => {
  it("accepts valid input", () => {
    expect(deleteExperienceSchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(deleteExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(deleteExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(deleteExperienceSchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceItemOutputSchema (output)
// ---------------------------------------------------------------------------
describe("experienceItemOutputSchema", () => {
  const validItem = {
    candidate_experience_id: 1,
    candidate_id: 42,
    experience: "Software Engineer",
    employer: "ACME Corp",
    start_year: 2020,
    end_year: 2024,
    created_at: new Date("2024-01-01"),
  };

  it("accepts a valid item", () => {
    expect(experienceItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      experienceItemOutputSchema.safeParse({
        ...validItem,
        candidate_id: null,
        employer: null,
        start_year: null,
        end_year: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_experience_id", () => {
    const { candidate_experience_id: _, ...rest } = validItem;
    expect(experienceItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing experience", () => {
    const { experience: _, ...rest } = validItem;
    expect(experienceItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    expect(
      experienceItemOutputSchema.safeParse({ ...validItem, created_at: "2024-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceActionResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("experienceActionResultOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: true, experienceId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects success without experienceId", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error string", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      experienceActionResultOutputSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});
