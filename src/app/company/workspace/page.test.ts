import { describe, it, expect } from "vitest";
import {
  workspaceMetricSchema,
  workspaceContactSchema,
  getWorkspaceDataSchema,
  workspaceCompanyItemSchema,
  workspaceRequestItemSchema,
  workspaceOverviewDataSchema,
} from "./schemas";

/**
 * Page migration test for company/workspace.
 *
 * Verifies the data contract between page and action.
 * The workspace page shows the company dashboard with metrics,
 * linked companies, and recent requests.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company workspace page — data contract", () => {
  // ---------------------------------------------------------------------------
  // workspaceMetricSchema (output)
  // ---------------------------------------------------------------------------
  it("workspaceMetricSchema accepts valid metric", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Active Requests",
      value: 10,
      note: "This month",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.label).toBe("Active Requests");
      expect(r.data.value).toBe(10);
    }
  });

  it("workspaceMetricSchema rejects missing label", () => {
    const r = workspaceMetricSchema.safeParse({
      value: 10,
      note: "This month",
    });
    expect(r.success).toBe(false);
  });

  it("workspaceMetricSchema rejects negative value", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Active Requests",
      value: -1,
      note: "",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // workspaceContactSchema (output, nullable)
  // ---------------------------------------------------------------------------
  it("workspaceContactSchema accepts valid contact", () => {
    const r = workspaceContactSchema.safeParse({
      contact_name: "John Doe",
      contact_email: "john@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceContactSchema accepts null", () => {
    const r = workspaceContactSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("workspaceContactSchema rejects missing contact_name", () => {
    const r = workspaceContactSchema.safeParse({
      contact_email: "john@example.com",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // getWorkspaceDataSchema (input)
  // ---------------------------------------------------------------------------
  it("getWorkspaceDataSchema accepts valid contactUuid", () => {
    const r = getWorkspaceDataSchema.safeParse({
      contactUuid: "contact-123",
    });
    expect(r.success).toBe(true);
  });

  it("getWorkspaceDataSchema rejects missing contactUuid", () => {
    const r = getWorkspaceDataSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getWorkspaceDataSchema rejects empty contactUuid", () => {
    const r = getWorkspaceDataSchema.safeParse({ contactUuid: "" });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // workspaceCompanyItemSchema (output)
  // ---------------------------------------------------------------------------
  it("workspaceCompanyItemSchema accepts valid item", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 1,
      title: "Test Corp",
      subtitle: "Active",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceCompanyItemSchema accepts string id", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: "uuid-123",
      title: "Test Corp",
      subtitle: "Active",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceCompanyItemSchema accepts optional meta", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 1,
      title: "Test Corp",
      subtitle: "Active",
      meta: "5 candidates",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceCompanyItemSchema rejects missing title", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 1,
      subtitle: "Active",
    });
    expect(r.success).toBe(false);
  });

  it("workspaceCompanyItemSchema rejects empty title", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 1,
      title: "",
      subtitle: "Active",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // workspaceRequestItemSchema (output)
  // ---------------------------------------------------------------------------
  it("workspaceRequestItemSchema accepts valid item", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-1",
      title: "Software Engineer",
      subtitle: "Pending",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceRequestItemSchema accepts with meta", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-1",
      title: "Software Engineer",
      subtitle: "Pending",
      meta: "3 candidates",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceRequestItemSchema rejects missing title", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-1",
      subtitle: "Pending",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // workspaceOverviewDataSchema (output)
  // ---------------------------------------------------------------------------
  const validOverview = {
    contact: { contact_name: "John Doe", contact_email: "john@example.com" },
    metrics: [
      { label: "Active Requests", value: 10, note: "This month" },
      { label: "Pending", value: 5, note: "Awaiting" },
      { label: "Interviews", value: 8, note: "Scheduled" },
      { label: "Placements", value: 3, note: "This month" },
    ],
    companies: [{ id: 1, title: "Test Corp", subtitle: "Active" }],
    requests: [{ id: "req-1", title: "Engineer", subtitle: "Pending" }],
  };

  it("workspaceOverviewDataSchema accepts valid overview", () => {
    const r = workspaceOverviewDataSchema.safeParse(validOverview);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.metrics).toHaveLength(4);
      expect(r.data.companies).toHaveLength(1);
    }
  });

  it("workspaceOverviewDataSchema accepts null contact", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      ...validOverview,
      contact: null,
    });
    expect(r.success).toBe(true);
  });

  it("workspaceOverviewDataSchema accepts empty companies and requests", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      ...validOverview,
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(true);
  });

  it("workspaceOverviewDataSchema rejects missing metrics", () => {
    const { metrics: _, ...rest } = validOverview;
    const r = workspaceOverviewDataSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("workspaceOverviewDataSchema rejects wrong number of metrics", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      ...validOverview,
      metrics: [validOverview.metrics[0]],
    });
    expect(r.success).toBe(false);
  });
});
