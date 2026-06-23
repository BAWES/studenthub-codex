import { describe, it, expect } from "vitest";
import {
  listEducationSchema,
  getEducationSchema,
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/education
// ---------------------------------------------------------------------------

describe("listEducationSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listEducationSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listEducationSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listEducationSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit", () => {
    const r = listEducationSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getEducationSchema", () => {
  it("accepts valid education UUID", () => {
    const r = getEducationSchema.safeParse({ educationUuid: "abc-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.educationUuid).toBe("abc-123");
    }
  });

  it("rejects missing educationUuid", () => {
    expect(getEducationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      getEducationSchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });
});

describe("createEducationSchema", () => {
  const validInput = {
    universityId: 1,
  };

  it("accepts valid input with required fields only", () => {
    const r = createEducationSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.universityId).toBe(1);
    }
  });

  it("accepts optional degree and major", () => {
    const r = createEducationSchema.safeParse({
      ...validInput,
      degreeUuid: "degree-1",
      majorUuid: "major-1",
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid graduation year", () => {
    const r = createEducationSchema.safeParse({
      ...validInput,
      graduationYear: 2020,
    });
    expect(r.success).toBe(true);
  });

  it("rejects graduation year below 1950", () => {
    expect(
      createEducationSchema.safeParse({
        ...validInput,
        graduationYear: 1900,
      }).success,
    ).toBe(false);
  });

  it("rejects graduation year above 2035", () => {
    expect(
      createEducationSchema.safeParse({
        ...validInput,
        graduationYear: 2040,
      }).success,
    ).toBe(false);
  });

  it("rejects missing universityId", () => {
    expect(createEducationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive universityId", () => {
    expect(
      createEducationSchema.safeParse({ universityId: 0 }).success,
    ).toBe(false);
  });

  it("accepts isCurrentlyStudying boolean true", () => {
    const r = createEducationSchema.safeParse({
      ...validInput,
      isCurrentlyStudying: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isCurrentlyStudying).toBe(true);
    }
  });

  it("accepts isCurrentlyStudying '1' string", () => {
    const r = createEducationSchema.safeParse({
      ...validInput,
      isCurrentlyStudying: "1",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isCurrentlyStudying).toBe(true);
    }
  });

  it("accepts isCurrentlyStudying '0' string", () => {
    const r = createEducationSchema.safeParse({
      ...validInput,
      isCurrentlyStudying: "0",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("coerces string universityId to number", () => {
    const r = createEducationSchema.safeParse({ universityId: "1" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.universityId).toBe(1);
    }
  });
});

describe("updateEducationSchema", () => {
  const validInput = {
    educationUuid: "abc-123",
    universityId: 1,
  };

  it("accepts valid update input", () => {
    const r = updateEducationSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("rejects missing educationUuid", () => {
    expect(
      updateEducationSchema.safeParse({ universityId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      updateEducationSchema.safeParse({
        educationUuid: "",
        universityId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing universityId", () => {
    expect(
      updateEducationSchema.safeParse({ educationUuid: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-positive universityId", () => {
    expect(
      updateEducationSchema.safeParse({
        educationUuid: "abc",
        universityId: 0,
      }).success,
    ).toBe(false);
  });
});

describe("deleteEducationSchema", () => {
  it("accepts valid education UUID", () => {
    expect(
      deleteEducationSchema.safeParse({ educationUuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing educationUuid", () => {
    expect(deleteEducationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      deleteEducationSchema.safeParse({ educationUuid: "" }).success,
    ).toBe(false);
  });
});
