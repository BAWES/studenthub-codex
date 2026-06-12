import { describe, it, expect } from "vitest";
import { dashboardMetricSchema, dashboardDataListItemSchema, dashboardDataSchema } from "./schemas";

describe("admin dashboard — data contracts", () => {
  it("dashboardMetricSchema validates a metric", () => {
    const r = dashboardMetricSchema.safeParse({
      label: "Total Candidates",
      value: 53000,
      note: "All registered students",
    });
    expect(r.success).toBe(true);
  });

  it("dashboardDataListItemSchema validates a list item", () => {
    const r = dashboardDataListItemSchema.safeParse({
      id: 1,
      title: "Ahmed Al-Sabah",
      subtitle: "ahmed@email.com",
      meta: "Pending",
      date: "12 Jun 2026",
    });
    expect(r.success).toBe(true);
  });

  it("dashboardDataSchema validates the full dashboard payload", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [
        { label: "Total Candidates", value: 53000, note: "All registered students" },
        { label: "Active Requests", value: 128, note: "Open requests" },
      ],
      statusMix: [
        { label: "Approved", value: 350 },
        { label: "Pending", value: 120 },
      ],
      recentCandidates: [
        { id: 1, title: "Ahmed Al-Sabah", subtitle: "ahmed@email.com", meta: "Pending" },
      ],
      recentCompanies: [
        { id: 1, title: "Al-Saleh Trading", subtitle: "5 requests", meta: "Approved" },
      ],
      recentRequests: [
        { id: 1, title: "IT Support", subtitle: "Al-Saleh Trading", meta: "Open" },
      ],
      recentTransfers: [
        { id: "txn-1", title: "KWD 5,000", subtitle: "NBK → Gulf Bank", meta: "Completed" },
      ],
      prMergeMetrics: [
        { label: "Avg Time", value: "4.5h", note: "Last 10 PRs" },
      ],
      recentPrMergeTimes: [
        { number: 1109, title: "feat: admin tickets CRUD", hours: 3.5 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("dashboardDataSchema rejects missing required fields", () => {
    const r = dashboardDataSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
