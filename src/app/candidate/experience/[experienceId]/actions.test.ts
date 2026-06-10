import { describe, it, expect } from "vitest";
import {
  getExperienceEntrySchema,
  updateExperienceEntrySchema,
  deleteExperienceEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/experience/[id] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getExperienceEntrySchema", () => {
  it("accepts a valid experience ID", () => {
    expect(
      getExperienceEntrySchema.safeParse({ experienceId: "42" }).success,
    ).toBe(true);
  });

  it("coerces string to number", () => {
    const r = getExperienceEntrySchema.safeParse({ experienceId: "7" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experienceId).toBe(7);
    }
  });

  it("rejects empty string", () => {
    expect(
      getExperienceEntrySchema.safeParse({ experienceId: "" }).success,
    ).toBe(false);
  });

  it("rejects missing experienceId", () => {
    expect(getExperienceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      getExperienceEntrySchema.safeParse({ experienceId: "0" }).success,
    ).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(
      getExperienceEntrySchema.safeParse({ experienceId: "-1" }).success,
    ).toBe(false);
  });
});

describe("updateExperienceEntrySchema", () => {
  it("accepts valid update params", () => {
    const r = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Senior Engineer",
      employer: "New Corp",
      startYear: "2021",
      endYear: "2024",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experienceId).toBe(1);
      expect(r.data.experience).toBe("Senior Engineer");
      expect(r.data.employer).toBe("New Corp");
      expect(r.data.startYear).toBe(2021);
      expect(r.data.endYear).toBe(2024);
    }
  });

  it("accepts minimal update (experienceId + experience only)", () => {
    const r = updateExperienceEntrySchema.safeParse({
      experienceId: "5",
      experience: "Software Dev",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employer).toBe("");
    }
  });

  it("rejects missing experienceId", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experience: "Engineer",
      }).success,
    ).toBe(false);
  });

  it("rejects empty experienceId", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "",
        experience: "Engineer",
      }).success,
    ).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "1",
        experience: "",
      }).success,
    ).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "1",
        experience: "a".repeat(129),
      }).success,
    ).toBe(false);
  });

  it("rejects employer over 255 chars", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "1",
        experience: "Engineer",
        employer: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "1",
        experience: "Engineer",
        startYear: "1899",
      }).success,
    ).toBe(false);
  });

  it("rejects endYear above 2100", () => {
    expect(
      updateExperienceEntrySchema.safeParse({
        experienceId: "1",
        experience: "Engineer",
        endYear: "2101",
      }).success,
    ).toBe(false);
  });

  it("trims whitespace from experience", () => {
    const r = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "  Engineer  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Engineer");
    }
  });

  it("accepts optional startYear and endYear", () => {
    const r = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
    });
    expect(r.success).toBe(true);
  });

  it("coerces startYear from string", () => {
    const r = updateExperienceEntrySchema.safeParse({
      experienceId: "1",
      experience: "Engineer",
      startYear: "2020",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.startYear).toBe(2020);
    }
  });
});

describe("deleteExperienceEntrySchema", () => {
  it("accepts a valid experience ID", () => {
    expect(
      deleteExperienceEntrySchema.safeParse({ experienceId: "1" }).success,
    ).toBe(true);
  });

  it("coerces string to number", () => {
    const r = deleteExperienceEntrySchema.safeParse({ experienceId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experienceId).toBe(99);
    }
  });

  it("rejects empty string", () => {
    expect(
      deleteExperienceEntrySchema.safeParse({ experienceId: "" }).success,
    ).toBe(false);
  });

  it("rejects missing experienceId", () => {
    expect(deleteExperienceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      deleteExperienceEntrySchema.safeParse({ experienceId: "0" }).success,
    ).toBe(false);
  });
});
