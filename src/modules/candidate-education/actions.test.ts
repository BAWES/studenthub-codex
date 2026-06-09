import { describe, it, expect } from "vitest";
import {
  listCandidateEducationSchema,
  createCandidateEducationSchema,
  updateCandidateEducationSchema,
} from "./actions";
import type {
  CandidateEducationItem,
  ListCandidateEducationInput,
  CreateCandidateEducationInput,
  UpdateCandidateEducationInput,
} from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: candidate education schema validation
//
// The candidate education actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (prisma, session, etc.).
// ---------------------------------------------------------------------------

describe("listCandidateEducationSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination values", () => {
    const result = listCandidateEducationSchema.safeParse({
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects zero page", () => {
    const result = listCandidateEducationSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateEducationSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCandidateEducationSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listCandidateEducationSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("createCandidateEducationSchema", () => {
  it("accepts valid data with all fields", () => {
    const result = createCandidateEducationSchema.safeParse({
      universityId: "1",
      degreeUuid: "degree-uuid-1",
      majorUuid: "major-uuid-1",
      graduationYear: "2020",
      isCurrentlyStudying: "0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(1);
      expect(result.data.degreeUuid).toBe("degree-uuid-1");
      expect(result.data.majorUuid).toBe("major-uuid-1");
      expect(result.data.graduationYear).toBe(2020);
      expect(result.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("accepts valid data with only required fields", () => {
    const result = createCandidateEducationSchema.safeParse({
      universityId: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(5);
    }
  });

  it("rejects missing universityId", () => {
    const result = createCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-positive universityId", () => {
    const result = createCandidateEducationSchema.safeParse({
      universityId: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid universityId", () => {
    const result = createCandidateEducationSchema.safeParse({
      universityId: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("transforms isCurrentlyStudying from 1/0 to boolean", () => {
    const result1 = createCandidateEducationSchema.safeParse({
      universityId: "1",
      isCurrentlyStudying: "1",
    });
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.data.isCurrentlyStudying).toBe(true);
    }

    const result0 = createCandidateEducationSchema.safeParse({
      universityId: "1",
      isCurrentlyStudying: "0",
    });
    expect(result0.success).toBe(true);
    if (result0.success) {
      expect(result0.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("accepts optional graduationYear", () => {
    const result = createCandidateEducationSchema.safeParse({
      universityId: "1",
      graduationYear: "2024",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe(2024);
    }
  });
});

describe("updateCandidateEducationSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateCandidateEducationSchema.safeParse({
      educationUuid: "education_abc-123",
      universityId: "2",
      degreeUuid: "new-degree-uuid",
      majorUuid: "new-major-uuid",
      graduationYear: "2025",
      isCurrentlyStudying: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.educationUuid).toBe("education_abc-123");
      expect(result.data.universityId).toBe(2);
      expect(result.data.isCurrentlyStudying).toBe(true);
    }
  });

  it("accepts partial update with only UUID", () => {
    const result = updateCandidateEducationSchema.safeParse({
      educationUuid: "education_abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty educationUuid", () => {
    const result = updateCandidateEducationSchema.safeParse({
      educationUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing educationUuid", () => {
    const result = updateCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-positive universityId in update", () => {
    const result = updateCandidateEducationSchema.safeParse({
      educationUuid: "education_abc-123",
      universityId: "0",
    });
    expect(result.success).toBe(false);
  });
});
