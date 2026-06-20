import { describe, it, expect } from "vitest";
import {
  getEducationEntrySchema,
  updateEducationEntrySchema,
  deleteEducationEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/education/[id]
// ---------------------------------------------------------------------------

describe("getEducationEntrySchema", () => {
  it("accepts valid education UUID", () => {
    const r = getEducationEntrySchema.safeParse({
      educationUuid: "abc-123-def",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.educationUuid).toBe("abc-123-def");
    }
  });

  it("rejects missing educationUuid", () => {
    expect(getEducationEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      getEducationEntrySchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });
});

describe("updateEducationEntrySchema", () => {
  const validInput = {
    educationUuid: "abc-123",
    universityId: 1,
  };

  it("accepts valid update input", () => {
    const r = updateEducationEntrySchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("accepts optional degree and major", () => {
    const r = updateEducationEntrySchema.safeParse({
      ...validInput,
      degreeUuid: "degree-1",
      majorUuid: "major-1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing educationUuid", () => {
    expect(
      updateEducationEntrySchema.safeParse({ universityId: 1 }).success,
    ).toBe(false);
  });

  it("rejects missing universityId", () => {
    expect(
      updateEducationEntrySchema.safeParse({ educationUuid: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-positive universityId", () => {
    expect(
      updateEducationEntrySchema.safeParse({
        educationUuid: "abc",
        universityId: 0,
      }).success,
    ).toBe(false);
  });
});

describe("deleteEducationEntrySchema", () => {
  it("accepts valid education UUID", () => {
    expect(
      deleteEducationEntrySchema.safeParse({
        educationUuid: "abc-123",
      }).success,
    ).toBe(true);
  });

  it("rejects missing educationUuid", () => {
    expect(deleteEducationEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      deleteEducationEntrySchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });
});
