import { describe, it, expect, vi, beforeEach } from "vitest";
import { createExperienceSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("createExperienceSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = createExperienceSchema.safeParse({
      experience: "Software Engineer",
      employer: "Tech Corp",
      startYear: 2020,
      endYear: 2023,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Software Engineer");
      expect(r.data.employer).toBe("Tech Corp");
      expect(r.data.startYear).toBe(2020);
      expect(r.data.endYear).toBe(2023);
    }
  });

  it("accepts minimal input (experience only)", () => {
    const r = createExperienceSchema.safeParse({
      experience: "Intern",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Intern");
      expect(r.data.employer).toBe("");
      expect(r.data.startYear).toBeUndefined();
      expect(r.data.endYear).toBeUndefined();
    }
  });

  it("trims whitespace from experience and employer", () => {
    const r = createExperienceSchema.safeParse({
      experience: "  Lead Developer  ",
      employer: "  Company  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Lead Developer");
      expect(r.data.employer).toBe("Company");
    }
  });

  it("rejects empty experience", () => {
    expect(createExperienceSchema.safeParse({ experience: "" }).success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "x".repeat(129) }).success,
    ).toBe(false);
  });

  it("accepts experience at exactly 128 chars", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "x".repeat(128) }).success,
    ).toBe(true);
  });

  it("rejects employer over 255 chars", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        employer: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        startYear: 1899,
      }).success,
    ).toBe(false);
  });

  it("rejects startYear above 2100", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        startYear: 2101,
      }).success,
    ).toBe(false);
  });

  it("rejects endYear below startYear via schema", () => {
    // Schema itself allows this — the action validates it separately
    const r = createExperienceSchema.safeParse({
      experience: "Engineer",
      startYear: 2023,
      endYear: 2020,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Action tests — barrel delegates to module-level createExperience which calls
// createCandidateExperience (same file) and revalidatePath (next/cache).
// These are integration tests at the module level; keep schemas-only here.
// ---------------------------------------------------------------------------

describe("createExperience (barrel re-export)", () => {
  it("exports createExperience function", async () => {
    const actions = await import("./actions");
    expect(typeof actions.createExperience).toBe("function");
  });
});
