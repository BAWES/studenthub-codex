import { describe, it, expect } from "vitest";
import {
  dashboardDataSchema,
  type DashboardData,
  type DashboardMetric,
  type DashboardStatusItem,
  type DashboardDataListItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Type-level tests — verify schema matches expected shape
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
});

// ---------------------------------------------------------------------------
// Type existence tests — ensures types are exported correctly
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
    const minimal: DashboardDataListItem = { id: 1, title: "Test", subtitle: "Sub", meta: "Info" };
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
