import { describe, it, expect } from "vitest";
import {
  applicationRowSchema,
  listApplicationsResultSchema,
} from "./schemas";

const validApplicationRow = () => ({
  id: 101,
  jobListingId: 42,
  candidateId: 7,
  candidateName: "Ahmed Al-Sabah",
  jobTitle: "Software Engineer",
  status: "pending",
  createdAt: new Date("2026-06-10"),
});

const validApplicationRowMinimal = () => ({
  id: 1,
  jobListingId: 1,
  candidateId: 1,
  candidateName: null,
  jobTitle: "Intern",
  status: "new",
  createdAt: new Date(),
});

// ---------------------------------------------------------------------------
// applicationRowSchema
// ---------------------------------------------------------------------------

describe("applicationRowSchema", () => {
  it("accepts a full application row", () => {
    const r = applicationRowSchema.safeParse(validApplicationRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal row (null candidate name)", () => {
    const r = applicationRowSchema.safeParse(validApplicationRowMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = applicationRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = applicationRowSchema.safeParse({
      ...validApplicationRow(),
      id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const r = applicationRowSchema.safeParse({
      ...validApplicationRow(),
      jobTitle: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    const r = applicationRowSchema.safeParse({
      ...validApplicationRow(),
      createdAt: "2026-06-10",
    });
    expect(r.success).toBe(false);
  });

  it("allows status to be any string", () => {
    const r = applicationRowSchema.safeParse({
      ...validApplicationRow(),
      status: "accepted",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listApplicationsResultSchema
// ---------------------------------------------------------------------------

describe("listApplicationsResultSchema", () => {
  it("accepts a full paginated result with metrics", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [validApplicationRow(), validApplicationRowMinimal()],
      total: 42,
      page: 1,
      limit: 50,
      totalPages: 1,
      metrics: { total: 42, pending: 10, accepted: 5, rejected: 3 },
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty items array with zero metrics", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 50,
      totalPages: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing metrics field", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listApplicationsResultSchema.safeParse({ items: [] });
    expect(r.success).toBe(false);
  });
});
