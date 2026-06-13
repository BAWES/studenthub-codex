import { describe, it, expect, vi, beforeEach } from "vitest";
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
      prMergeMetrics: [
        { label: "Avg time-to-merge", value: "0.2h", note: "Across 50 PRs" },
        { label: "Median time-to-merge", value: "0.1h", note: "Midpoint of last 50 merged PRs" },
        { label: "Merged (7d)", value: "50", note: "PRs in last batch" },
      ],
      recentPrMergeTimes: [
        { number: 728, title: "Migrate staff data.ts to colocated server actions", hours: 0.02 },
        { number: 726, title: "Fix TS errors on develop", hours: 0.15 },
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
      prMergeMetrics: [],
      recentPrMergeTimes: [],
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
      prMergeMetrics: [],
      recentPrMergeTimes: [],
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
      prMergeMetrics: [],
      recentPrMergeTimes: [],
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
      prMergeMetrics: [],
      recentPrMergeTimes: [],
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
      prMergeMetrics: [],
      recentPrMergeTimes: [],
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

// ── Runtime tests for dashboard actions ────────────────────
// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityDash,
  mockTransact,
  mockFindManyCandidates,
  mockFindManyCompanies,
  mockFindManyRequests,
  mockFindManyTransfers,
  mockCountCandidates,
  mockCountCompanies,
  mockCountRequests,
  mockCountTransfers,
  mockGroupByRequestStatus,
  mockFetch,
} = vi.hoisted(() => ({
  mockRequireCapabilityDash: vi.fn(),
  mockTransact: vi.fn(),
  mockFindManyCandidates: vi.fn(),
  mockFindManyCompanies: vi.fn(),
  mockFindManyRequests: vi.fn(),
  mockFindManyTransfers: vi.fn(),
  mockCountCandidates: vi.fn(),
  mockCountCompanies: vi.fn(),
  mockCountRequests: vi.fn(),
  mockCountTransfers: vi.fn(),
  mockGroupByRequestStatus: vi.fn(),
  mockFetch: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityDash,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransact,
    candidate: {
      count: mockCountCandidates,
      findMany: mockFindManyCandidates,
    },
    company: {
      count: mockCountCompanies,
      findMany: mockFindManyCompanies,
    },
    request: {
      count: mockCountRequests,
      findMany: mockFindManyRequests,
      groupBy: mockGroupByRequestStatus,
    },
    transfer: {
      count: mockCountTransfers,
      findMany: mockFindManyTransfers,
    },
  },
}));

// ── Mock global fetch ───────────────────────────────────────
vi.stubGlobal("fetch", mockFetch);

import { getDashboardData, getPrMergeMetrics } from "./actions";

// ---------------------------------------------------------------------------
// getPrMergeMetrics — runtime
// ---------------------------------------------------------------------------

describe("getPrMergeMetrics — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns N/A when no GITHUB_TOKEN is set", async () => {
    const orig = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const result = await getPrMergeMetrics();
    expect(result.metrics[0].value).toBe("N/A");
    expect(result.metrics[0].note).toContain("No GitHub token");
    expect(result.recent).toEqual([]);
    process.env.GITHUB_TOKEN = orig;
  });

  it("returns N/A for empty token", async () => {
    const orig = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "";
    const result = await getPrMergeMetrics();
    expect(result.metrics[0].value).toBe("N/A");
    process.env.GITHUB_TOKEN = orig;
  });

  it("returns error on non-ok HTTP response", async () => {
    const orig = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "fake-token";
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: vi.fn(),
    });
    const result = await getPrMergeMetrics();
    expect(result.metrics[0].value).toBe("Error");
    expect(result.metrics[0].note).toContain("403");
    process.env.GITHUB_TOKEN = orig;
  });

  it("returns N/A when no merged PRs found", async () => {
    const orig = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "fake-token";
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ total_count: 0, items: [] }),
    });
    const result = await getPrMergeMetrics();
    expect(result.metrics[0].value).toBe("N/A");
    expect(result.metrics[0].note).toContain("No merged PRs");
    process.env.GITHUB_TOKEN = orig;
  });

  it("computes metrics from merged PRs", async () => {
    const orig = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "fake-token";

    const now = Date.now();
    const oneHourAgo = new Date(now - 3_600_000).toISOString(); // ~1h ago
    const twoHoursAgo = new Date(now - 7_200_000).toISOString(); // ~2h ago
    const mergedAgo = (ms: number) => new Date(now - ms).toISOString();

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        total_count: 2,
        items: [
          {
            number: 100,
            title: "Fix bug",
            created_at: mergedAgo(7_200_000),
            pull_request: { merged_at: mergedAgo(3_600_000) },
          },
          {
            number: 101,
            title: "Add feature",
            created_at: mergedAgo(14_400_000),
            pull_request: { merged_at: mergedAgo(3_600_000) },
          },
        ],
      }),
    });

    const result = await getPrMergeMetrics();
    expect(result.metrics.length).toBeGreaterThanOrEqual(3);
    expect(result.recent).toHaveLength(2);
    expect(result.recent[0].number).toBe(100);
    expect(result.recent[0].title).toBe("Fix bug");
    expect(result.metrics.some((m) => m.label === "Merged (7d)")).toBe(true);
    process.env.GITHUB_TOKEN = orig;
  });

  it("handles fetch exception gracefully", async () => {
    const orig = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "fake-token";
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await getPrMergeMetrics();
    expect(result.metrics[0].value).toBe("Error");
    expect(result.metrics[0].note).toContain("GitHub API request failed");
    process.env.GITHUB_TOKEN = orig;
  });
});

// ---------------------------------------------------------------------------
// getDashboardData — runtime
// ---------------------------------------------------------------------------

describe("getDashboardData — runtime", () => {
  const MOCK_DATE = new Date("2026-06-13T12:00:00Z");

  const mockTransactionResult = () => [
    53000, // candidateCount
    524, // companyCount
    1200, // requestCount
    4200, // transferCount
    5000, // openCandidateCount
    162, // activeCompanyCount
    // recentCandidates
    [
      {
        candidate_id: 1,
        candidate_name: "Ahmed Al-Sabah",
        candidate_email: "ahmed@example.com",
        candidate_status: 10,
        approved: 1,
        deleted: 0,
        candidate_created_at: MOCK_DATE,
        currency_code: "KWD",
        candidate_hourly_rate: 12_500,
      },
    ],
    // recentCompanies
    [
      {
        company_id: 100,
        company_name: "KIPCO",
        company_email: "info@kipco.com",
        no_of_active_requests: 3,
        company_approved_to_hire: true,
        company_created_at: MOCK_DATE,
        currency_code: "KWD",
        company_hourly_rate: 15_000,
      },
    ],
    // recentRequests
    [
      {
        request_uuid: "req-1",
        request_position_title: "Software Engineer",
        request_status: "started",
        request_number_of_employees: 2,
        request_created_datetime: MOCK_DATE,
        company: { company_name: "KIPCO" },
      },
    ],
    // recentTransfers
    [
      {
        transfer_id: 500,
        total: 45000,
        company_total: 40000,
        transfer_status: 5,
        start_date: MOCK_DATE,
        end_date: MOCK_DATE,
        currency_code: "KWD",
        company: { company_name: "KIPCO" },
      },
    ],
    // requestStatusGroups
    [
      { request_status: "started", _count: { _all: 300 } },
      { request_status: "pending", _count: { _all: 400 } },
      { request_status: "delivered", _count: { _all: 500 } },
    ],
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityDash.mockResolvedValue(undefined);

    // Mock $transaction to return the full result array
    mockTransact.mockImplementation(
      async (queries: any[]) => mockTransactionResult(),
    );

    // Mock fetch (for getPrMergeMetrics called internally)
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ total_count: 0, items: [] }),
    });
  });

  it("calls requireCapability with admin.system", async () => {
    await getDashboardData();
    expect(mockRequireCapabilityDash).toHaveBeenCalledWith("admin.system");
  });

  it("returns four top-level metric cards", async () => {
    const result = await getDashboardData();
    expect(result.metrics).toHaveLength(4);
    const labels = result.metrics.map((m) => m.label);
    expect(labels).toContain("Candidates");
    expect(labels).toContain("Companies");
    expect(labels).toContain("Requests");
    expect(labels).toContain("Transfers");
  });

  it("returns correct metric values from prisma counts", async () => {
    const result = await getDashboardData();
    const candidates = result.metrics.find((m) => m.label === "Candidates");
    expect(candidates!.value).toBe(53000);
    const companies = result.metrics.find((m) => m.label === "Companies");
    expect(companies!.value).toBe(524);
  });

  it("includes statusMix breakdown sorted by count descending", async () => {
    const result = await getDashboardData();
    expect(result.statusMix.length).toBeGreaterThanOrEqual(1);
    // Should be sorted descending
    for (let i = 1; i < result.statusMix.length; i++) {
      expect(result.statusMix[i - 1].value).toBeGreaterThanOrEqual(
        result.statusMix[i].value,
      );
    }
  });

  it("maps recentCandidates to DashboardDataListItem format", async () => {
    const result = await getDashboardData();
    expect(result.recentCandidates).toHaveLength(1);
    expect(result.recentCandidates[0].title).toBe("Ahmed Al-Sabah");
    expect(result.recentCandidates[0].subtitle).toBe("ahmed@example.com");
    expect(result.recentCandidates[0].meta).toBe("Active");
    expect(result.recentCandidates[0].amount).toContain("KWD");
  });

  it("maps recentCompanies with count and approval status", async () => {
    const result = await getDashboardData();
    expect(result.recentCompanies).toHaveLength(1);
    expect(result.recentCompanies[0].title).toBe("KIPCO");
    expect(result.recentCompanies[0].meta).toBe("Approved");
    expect(result.recentCompanies[0].count).toBe(3);
  });

  it("maps recentRequests with company name and status", async () => {
    const result = await getDashboardData();
    expect(result.recentRequests).toHaveLength(1);
    expect(result.recentRequests[0].title).toBe("Software Engineer");
    expect(result.recentRequests[0].subtitle).toBe("KIPCO");
    expect(result.recentRequests[0].meta).toBe("Started");
  });

  it("maps recentTransfers with amount and period", async () => {
    const result = await getDashboardData();
    expect(result.recentTransfers).toHaveLength(1);
    expect(result.recentTransfers[0].id).toBe(500);
    expect(result.recentTransfers[0].amount).toContain("KWD");
  });

  it("includes prMergeMetrics in the response", async () => {
    const result = await getDashboardData();
    expect(result.prMergeMetrics).toBeDefined();
    expect(Array.isArray(result.prMergeMetrics)).toBe(true);
  });

  it("validates output schema (dashboardDataSchema)", async () => {
    const result = await getDashboardData();
    const parsed = dashboardDataSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
