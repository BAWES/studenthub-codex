import { describe, it, expect } from "vitest";
import {
  dashboardDataSchema,
  type DashboardData,
  type DashboardMetric,
  type DashboardStatusItem,
  type DashboardDataListItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure helper logic — duplicated from actions.ts for isolated unit testing
// (Matches the codebase convention: test actions files re-define helpers
//  inline instead of importing from production modules that require Prisma.)
// ---------------------------------------------------------------------------

/** @see {formatMoney} in actions.ts */
function formatMoney(value: unknown, currency = "KWD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  if (value === null || value === undefined) return "0";
  const normalized =
    typeof value === "object" && "toString" in value
      ? value.toString()
      : String(value);
  return `${formatter.format(Number(normalized))} ${currency}`;
}

/** @see {formatDate} in actions.ts */
function formatDate(value: Date | null | undefined): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

/** @see {candidateStatus} in actions.ts */
function candidateStatus(
  status: number,
  approved: number,
  deleted: number,
): string {
  if (deleted) return "Archived";
  if (approved === 0) return "Needs review";
  if (status === 10) return "Active";
  return `Status ${status}`;
}

/** @see {requestStatus} in actions.ts */
function requestStatus(status: string | null | undefined): string {
  if (!status) return "Unspecified";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// formatMoney
// ---------------------------------------------------------------------------

describe("formatMoney", () => {
  it("formats a whole number", () => {
    expect(formatMoney(142)).toBe("142 KWD");
  });

  it("formats a decimal to 3 fraction digits max", () => {
    expect(formatMoney(45_000.0)).toBe("45,000 KWD");
  });

  it("formats small decimals without trailing zeros", () => {
    expect(formatMoney(12.5)).toBe("12.5 KWD");
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("0 KWD");
  });

  it("returns '0' for null", () => {
    expect(formatMoney(null)).toBe("0");
  });

  it("returns '0' for undefined", () => {
    expect(formatMoney(undefined)).toBe("0");
  });

  it("accepts string values", () => {
    expect(formatMoney("1000")).toBe("1,000 KWD");
  });

  it("accepts a custom currency code", () => {
    expect(formatMoney(500, "USD")).toBe("500 USD");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe("formatDate", () => {
  it("formats a valid date", () => {
    const d = new Date("2026-06-10T12:00:00Z");
    expect(formatDate(d)).toBe("Jun 10, 2026");
  });

  it("returns 'Not set' for null", () => {
    expect(formatDate(null)).toBe("Not set");
  });

  it("returns 'Not set' for undefined", () => {
    expect(formatDate(undefined)).toBe("Not set");
  });

  it("handles dates at month boundaries", () => {
    const d = new Date("2025-01-31T00:00:00Z");
    expect(formatDate(d)).toBe("Jan 31, 2025");
  });

  it("handles dates at year boundaries", () => {
    // Use noon to avoid timezone boundary shifts (KWT=UTC+3)
    const d = new Date("2024-12-31T12:00:00Z");
    expect(formatDate(d)).toBe("Dec 31, 2024");
  });
});

// ---------------------------------------------------------------------------
// candidateStatus
// ---------------------------------------------------------------------------

describe("candidateStatus", () => {
  it("returns 'Archived' for deleted candidates", () => {
    expect(candidateStatus(10, 1, 1)).toBe("Archived");
    expect(candidateStatus(0, 0, 1)).toBe("Archived");
  });

  it("returns 'Needs review' when approved is 0 (and not deleted)", () => {
    expect(candidateStatus(0, 0, 0)).toBe("Needs review");
    expect(candidateStatus(10, 0, 0)).toBe("Needs review");
  });

  it("returns 'Active' for status=10, approved != 0, not deleted", () => {
    expect(candidateStatus(10, 1, 0)).toBe("Active");
  });

  it("returns fallback for unknown status codes", () => {
    expect(candidateStatus(5, 1, 0)).toBe("Status 5");
    expect(candidateStatus(20, 1, 0)).toBe("Status 20");
  });

  it("handles zero status value", () => {
    expect(candidateStatus(0, 1, 0)).toBe("Status 0");
  });
});

// ---------------------------------------------------------------------------
// requestStatus
// ---------------------------------------------------------------------------

describe("requestStatus", () => {
  it("title-cases a simple status", () => {
    expect(requestStatus("started")).toBe("Started");
  });

  it("title-cases underscore-delimited status", () => {
    expect(requestStatus("in_review")).toBe("In Review");
  });

  it("handles multiple underscores", () => {
    expect(requestStatus("pending_approval_v2")).toBe("Pending Approval V2");
  });

  it("returns 'Unspecified' for null", () => {
    expect(requestStatus(null)).toBe("Unspecified");
  });

  it("returns 'Unspecified' for undefined", () => {
    expect(requestStatus(undefined)).toBe("Unspecified");
  });

  it("returns 'Unspecified' for empty string", () => {
    expect(requestStatus("")).toBe("Unspecified");
  });

  it("handles already-title-cased input", () => {
    expect(requestStatus("New")).toBe("New");
  });

  it("handles mixed case", () => {
    expect(requestStatus("APPROVED")).toBe("Approved");
    expect(requestStatus("Needs_Review")).toBe("Needs Review");
  });
});

// ---------------------------------------------------------------------------
// Schema validation — dashboardDataSchema
// ---------------------------------------------------------------------------

describe("dashboardDataSchema", () => {
  it("accepts valid full dashboard data", () => {
    const payload: DashboardData = {
      metrics: [
        { label: "Candidates", value: 142, note: "12 need review" },
        { label: "Companies", value: 38, note: "22 approved to hire" },
        { label: "Requests", value: 97, note: "Hiring demand pipeline" },
        { label: "Transfers", value: 15, note: "Payroll and invoice runs" },
      ],
      statusMix: [
        { label: "Pending", value: 45 },
        { label: "Started", value: 30 },
        { label: "Delivered", value: 22 },
      ],
      recentCandidates: [
        {
          id: 1,
          title: "Ahmed Al-Sabah",
          subtitle: "ahmed@example.com",
          meta: "Active",
          amount: "12.500 KWD",
          date: "Jun 10, 2026",
        },
      ],
      recentCompanies: [
        {
          id: 1,
          title: "KIPCO",
          subtitle: "info@kipco.com",
          meta: "Approved",
          amount: "15.000 KWD",
          date: "Jun 9, 2026",
          count: 3,
        },
      ],
      recentRequests: [
        {
          id: "req-uuid-1",
          title: "Software Engineer",
          subtitle: "KIPCO",
          meta: "Started",
          count: 2,
          date: "Jun 8, 2026",
        },
      ],
      recentTransfers: [
        {
          id: 1,
          title: "KIPCO",
          subtitle: "Jun 1 to Jun 30",
          meta: "Pending",
          amount: "45,000.000 KWD",
        },
      ],
    };

    const r = dashboardDataSchema.safeParse(payload);
    expect(r.success).toBe(true);
  });

  it("accepts empty collections", () => {
    const payload: DashboardData = {
      metrics: [],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    };

    const r = dashboardDataSchema.safeParse(payload);
    expect(r.success).toBe(true);
  });

  it("rejects missing metrics field", () => {
    const { metrics, ...rest } = {
      metrics: [] as DashboardMetric[],
      statusMix: [] as DashboardStatusItem[],
      recentCandidates: [] as DashboardDataListItem[],
      recentCompanies: [] as DashboardDataListItem[],
      recentRequests: [] as DashboardDataListItem[],
      recentTransfers: [] as DashboardDataListItem[],
    };
    const r = dashboardDataSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects invalid metric value type", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ label: "Candidates", value: "not-a-number", note: "test" }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative metric value", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ label: "Candidates", value: -5, note: "negative" }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer metric value", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ label: "Candidates", value: 1.5, note: "float" }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });

  it("accepts metric with no note (optional)", () => {
    const payload: DashboardData = {
      metrics: [{ label: "Candidates", value: 142 }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    };
    const r = dashboardDataSchema.safeParse(payload);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.metrics[0].note).toBe("");
    }
  });

  it("rejects empty metric label", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ label: "", value: 5 }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });

  it("accepts data list items with optional fields omitted", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [
        { id: 1, title: "A", subtitle: "B", meta: "C" },
      ],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts string-based ids in data list items", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [
        { id: "uuid-abc", title: "A", subtitle: "B", meta: "C" },
      ],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects data list item missing required title", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [
        { id: 1, subtitle: "B", meta: "C" } as unknown,
      ],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects data list item with empty title", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [
        { id: 1, title: "", subtitle: "B", meta: "C" },
      ],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type existence tests — verify types export correctly
// ---------------------------------------------------------------------------

describe("Dashboard types", () => {
  it("DashboardMetric has required fields", () => {
    const metric: DashboardMetric = { label: "Test", value: 10, note: "Note" };
    expect(metric.label).toBe("Test");
    expect(metric.value).toBe(10);
  });

  it("DashboardStatusItem has required fields", () => {
    const item: DashboardStatusItem = { label: "Pending", value: 5 };
    expect(item.label).toBe("Pending");
    expect(item.value).toBe(5);
  });

  it("DashboardDataListItem has optional fields", () => {
    const minimal: DashboardDataListItem = {
      id: 1,
      title: "Test",
      subtitle: "Sub",
      meta: "Info",
    };
    expect(minimal.id).toBe(1);
    expect(minimal.amount).toBeUndefined();
    expect(minimal.date).toBeUndefined();
    expect(minimal.count).toBeUndefined();

    const full: DashboardDataListItem = {
      id: "uuid",
      title: "Full",
      subtitle: "Sub",
      meta: "Info",
      amount: "100",
      date: "Today",
      count: 5,
    };
    expect(full.count).toBe(5);
  });
});
