import { describe, it, expect } from "vitest";
import {
  workspaceMetricSchema,
  workspaceContactSchema,
  getWorkspaceDataSchema,
  workspaceCompanyItemSchema,
  workspaceRequestItemSchema,
  workspaceOverviewDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// workspaceMetricSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceMetricSchema", () => {
  const validMetric = {
    label: "Active Requests",
    value: 10,
    note: "This month",
  };

  it("accepts valid metric", () => {
    expect(workspaceMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(workspaceMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects negative value", () => {
    expect(workspaceMetricSchema.safeParse({ ...validMetric, value: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceContactSchema (output — nullable)
// ---------------------------------------------------------------------------
describe("workspaceContactSchema", () => {
  it("accepts valid contact", () => {
    expect(
      workspaceContactSchema.safeParse({ contact_name: "John Doe", contact_email: "john@example.com" }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(workspaceContactSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing contact_name", () => {
    expect(workspaceContactSchema.safeParse({ contact_email: "john@example.com" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkspaceDataSchema (input)
// ---------------------------------------------------------------------------
describe("getWorkspaceDataSchema", () => {
  it("accepts valid input", () => {
    expect(getWorkspaceDataSchema.safeParse({ contactUuid: "contact-123" }).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(getWorkspaceDataSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(getWorkspaceDataSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceCompanyItemSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceCompanyItemSchema", () => {
  const validItem = {
    id: 1,
    title: "Test Corp",
    subtitle: "Active",
  };

  it("accepts valid item", () => {
    expect(workspaceCompanyItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts with optional meta", () => {
    expect(
      workspaceCompanyItemSchema.safeParse({ ...validItem, meta: "5 candidates" }).success,
    ).toBe(true);
  });

  it("accepts string id", () => {
    expect(
      workspaceCompanyItemSchema.safeParse({ ...validItem, id: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(workspaceCompanyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(workspaceCompanyItemSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceRequestItemSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceRequestItemSchema", () => {
  const validItem = {
    id: "req-1",
    title: "Software Engineer",
    subtitle: "Pending",
  };

  it("accepts valid item", () => {
    expect(workspaceRequestItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts with meta", () => {
    expect(
      workspaceRequestItemSchema.safeParse({ ...validItem, meta: "3 candidates" }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// workspaceOverviewDataSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceOverviewDataSchema", () => {
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

  it("accepts valid overview", () => {
    expect(workspaceOverviewDataSchema.safeParse(validOverview).success).toBe(true);
  });

  it("accepts null contact", () => {
    expect(
      workspaceOverviewDataSchema.safeParse({ ...validOverview, contact: null }).success,
    ).toBe(true);
  });

  it("accepts empty companies and requests arrays", () => {
    expect(
      workspaceOverviewDataSchema.safeParse({ ...validOverview, companies: [], requests: [] }).success,
    ).toBe(true);
  });

  it("rejects missing contact", () => {
    const { contact: _, ...rest } = validOverview;
    expect(workspaceOverviewDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong number of metrics (not 4)", () => {
    expect(
      workspaceOverviewDataSchema.safeParse({ ...validOverview, metrics: [validOverview.metrics[0]] }).success,
    ).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validOverview;
    expect(workspaceOverviewDataSchema.safeParse(rest).success).toBe(false);
  });
});
