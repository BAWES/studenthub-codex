import { describe, it, expect } from "vitest";
import {
  getEducationEntrySchema,
  updateEducationEntrySchema,
  deleteEducationEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/education/[id] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getEducationEntrySchema", () => {
  it("accepts a valid education UUID", () => {
    expect(
      getEducationEntrySchema.safeParse({
        educationUuid: "edu_abc123-def456",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getEducationEntrySchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getEducationEntrySchema.safeParse({}).success).toBe(false);
  });
});

describe("updateEducationEntrySchema", () => {
  it("accepts valid update params", () => {
    const r = updateEducationEntrySchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 10,
      degreeUuid: "deg_002",
      majorUuid: "maj_002",
      graduationYear: 2025,
      isCurrentlyStudying: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.educationUuid).toBe("edu_abc");
      expect(r.data.universityId).toBe(10);
    }
  });

  it("rejects missing educationUuid", () => {
    expect(
      updateEducationEntrySchema.safeParse({ universityId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      updateEducationEntrySchema.safeParse({
        educationUuid: "",
        universityId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing universityId", () => {
    expect(
      updateEducationEntrySchema.safeParse({
        educationUuid: "edu_abc",
      }).success,
    ).toBe(false);
  });

  it("accepts optional fields omitted", () => {
    const r = updateEducationEntrySchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 1,
    });
    expect(r.success).toBe(true);
  });

  it("coerces graduationYear from string", () => {
    const r = updateEducationEntrySchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 1,
      graduationYear: "2023",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.graduationYear).toBe(2023);
    }
  });
});

describe("deleteEducationEntrySchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteEducationEntrySchema.safeParse({
        educationUuid: "edu_xyz",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      deleteEducationEntrySchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteEducationEntrySchema.safeParse({}).success).toBe(false);
  });
});
