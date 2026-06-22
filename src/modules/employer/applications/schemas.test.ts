import { describe, it, expect } from "vitest";
import {
  listEmployerApplicationsSchema,
  employerApplicationRowOutputSchema,
  employerApplicationListOutputSchema,
} from "./schemas";

const validRow = () => ({
  id: 42,
  jobTitle: "Software Engineer Intern",
  candidateName: "Ahmed Al-Ali",
  status: "applied",
  createdAt: new Date("2026-06-15"),
});

const validRowNullName = () => ({
  id: 99,
  jobTitle: "Marketing Intern",
  candidateName: null,
  status: "pending_review",
  createdAt: new Date(),
});

// ---------------------------------------------------------------------------
// listEmployerApplicationsSchema
// ---------------------------------------------------------------------------

describe("listEmployerApplicationsSchema", () => {
  it("accepts default values when empty", () => {
    const r = listEmployerApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.status).toBeUndefined();
    }
  });

  it("accepts explicit pagination", () => {
    const r = listEmployerApplicationsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts status filter", () => {
    const r = listEmployerApplicationsSchema.safeParse({ status: "accepted" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("accepted");
    }
  });

  it("rejects negative page", () => {
    const r = listEmployerApplicationsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listEmployerApplicationsSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listEmployerApplicationsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// employerApplicationRowOutputSchema
// ---------------------------------------------------------------------------

describe("employerApplicationRowOutputSchema", () => {
  it("accepts a valid row", () => {
    const r = employerApplicationRowOutputSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts null candidateName", () => {
    const r = employerApplicationRowOutputSchema.safeParse(validRowNullName());
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = employerApplicationRowOutputSchema.safeParse({ ...validRow(), id: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric id", () => {
    const r = employerApplicationRowOutputSchema.safeParse({ ...validRow(), id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const r = employerApplicationRowOutputSchema.safeParse({ ...validRow(), jobTitle: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    const r = employerApplicationRowOutputSchema.safeParse({ ...validRow(), createdAt: "2026-06-15" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// employerApplicationListOutputSchema
// ---------------------------------------------------------------------------

describe("employerApplicationListOutputSchema", () => {
  it("accepts a valid list result", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: true,
      applications: [validRow(), validRowNullName()],
      total: 2,
      metrics: { total: 2, pending: 1, accepted: 1, rejected: 0 },
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty list", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects success: false", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: false,
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: -1,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative metric count", () => {
    const r = employerApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
      metrics: { total: 0, pending: -1, accepted: 0, rejected: 0 },
    });
    expect(r.success).toBe(false);
  });
});
