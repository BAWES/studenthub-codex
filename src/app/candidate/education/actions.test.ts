import { describe, it, expect } from "vitest";
import {
  listEducationSchema,
  getEducationSchema,
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/education actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listEducationSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listEducationSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listEducationSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listEducationSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getEducationSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getEducationSchema.safeParse({ educationUuid: "edu_abc123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getEducationSchema.safeParse({ educationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(getEducationSchema.safeParse({}).success).toBe(false);
  });
});

describe("createEducationSchema", () => {
  it("accepts valid create params", () => {
    const r = createEducationSchema.safeParse({
      universityId: 5,
      degreeUuid: "deg_001",
      majorUuid: "maj_001",
      graduationYear: 2024,
      isCurrentlyStudying: false,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.universityId).toBe(5);
      expect(r.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("rejects missing universityId", () => {
    expect(createEducationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero universityId", () => {
    expect(
      createEducationSchema.safeParse({ universityId: 0 }).success,
    ).toBe(false);
  });

  it("accepts minimal params (universityId only)", () => {
    const r = createEducationSchema.safeParse({ universityId: 1 });
    expect(r.success).toBe(true);
  });

  it("coerces graduationYear from string", () => {
    const r = createEducationSchema.safeParse({
      universityId: 1,
      graduationYear: "2023",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.graduationYear).toBe(2023);
    }
  });
});

describe("updateEducationSchema", () => {
  it("accepts valid update params", () => {
    const r = updateEducationSchema.safeParse({
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
      updateEducationSchema.safeParse({ educationUuid: "edu_abc" }).success,
    ).toBe(false);
  });

  it("accepts optional fields omitted", () => {
    const r = updateEducationSchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 1,
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteEducationSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteEducationSchema.safeParse({ educationUuid: "edu_xyz" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteEducationSchema.safeParse({ educationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(deleteEducationSchema.safeParse({}).success).toBe(false);
  });
});
