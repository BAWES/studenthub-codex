import { describe, it, expect } from "vitest";
import {
  listEducationSchema,
  getEducationSchema,
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
} from "./schemas";

describe("candidate education page — data contract", () => {
  it("listEducationSchema validates valid input", () => {
    const r = listEducationSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
  });

  it("listEducationSchema applies defaults", () => {
    const r = listEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("getEducationSchema validates valid educationUuid", () => {
    const r = getEducationSchema.safeParse({ educationUuid: "uuid-abc" });
    expect(r.success).toBe(true);
  });

  it("getEducationSchema rejects missing educationUuid", () => {
    const r = getEducationSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createEducationSchema validates valid input", () => {
    const r = createEducationSchema.safeParse({
      universityId: 1,
      degreeUuid: "deg-1",
      majorUuid: "maj-1",
      graduationYear: 2024,
      isCurrentlyStudying: false,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.universityId).toBe(1);
  });

  it("createEducationSchema rejects missing universityId", () => {
    const r = createEducationSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateEducationSchema validates valid input", () => {
    const r = updateEducationSchema.safeParse({
      educationUuid: "uuid-1",
      universityId: 1,
      graduationYear: 2024,
    });
    expect(r.success).toBe(true);
  });

  it("updateEducationSchema rejects missing educationUuid", () => {
    const r = updateEducationSchema.safeParse({ universityId: 1 });
    expect(r.success).toBe(false);
  });

  it("deleteEducationSchema validates educationUuid", () => {
    const r = deleteEducationSchema.safeParse({ educationUuid: "uuid-10" });
    expect(r.success).toBe(true);
  });

  it("deleteEducationSchema rejects missing educationUuid", () => {
    const r = deleteEducationSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
