import { describe, it, expect } from "vitest";
import {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for admin/reports actions (pure unit — no DB)
// ---------------------------------------------------------------------------

describe("listReportsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listReportsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listReportsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit", () => {
    const r = listReportsSchema.safeParse({ page: "3", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listReportsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listReportsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listReportsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts type filter string", () => {
    const r = listReportsSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("recruiter-daily");
    }
  });
});

describe("getReportSchema", () => {
  it("accepts valid report lookup", () => {
    const r = getReportSchema.safeParse({
      id: "2026-06-10-recruiter-daily",
      type: "recruiter-daily",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("2026-06-10-recruiter-daily");
      expect(r.data.type).toBe("recruiter-daily");
    }
  });

  it("rejects empty id", () => {
    expect(
      getReportSchema.safeParse({ id: "", type: "recruiter-daily" }).success,
    ).toBe(false);
  });

  it("rejects empty type", () => {
    expect(
      getReportSchema.safeParse({ id: "report-1", type: "" }).success,
    ).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getReportSchema.safeParse({ type: "recruiter-daily" }).success).toBe(
      false,
    );
  });

  it("rejects missing type", () => {
    expect(getReportSchema.safeParse({ id: "report-1" }).success).toBe(false);
  });

  it("rejects empty input", () => {
    expect(getReportSchema.safeParse({}).success).toBe(false);
  });
});

describe("generateReportSchema", () => {
  it("accepts minimal valid input (type only)", () => {
    const r = generateReportSchema.safeParse({ type: "recruiter-daily" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("recruiter-daily");
    }
  });

  it("accepts full input with all fields", () => {
    const r = generateReportSchema.safeParse({
      type: "invitation-summary",
      date: "2026-06-10",
      staffEmail: "recruiter@studenthub.com",
      params: { region: "kuwait" },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("invitation-summary");
      expect(r.data.date).toBe("2026-06-10");
      expect(r.data.staffEmail).toBe("recruiter@studenthub.com");
    }
  });

  it("rejects empty type", () => {
    expect(generateReportSchema.safeParse({ type: "" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(generateReportSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      generateReportSchema.safeParse({
        type: "recruiter-daily",
        staffEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("accepts optional params as record", () => {
    const r = generateReportSchema.safeParse({
      type: "recruiter-daily",
      params: { foo: "bar", count: 42 },
    });
    expect(r.success).toBe(true);
  });
});
