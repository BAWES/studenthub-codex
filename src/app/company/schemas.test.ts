import { describe, it, expect } from "vitest";
import {
  getCompanyWorkspaceSchema,
  workspaceMetricSchema,
  workspaceListItemSchema,
  workspaceContactSchema,
  workspaceOverviewOutputSchema,
  updateWorkspaceResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("getCompanyWorkspaceSchema", () => {
  it("accepts valid contact UUID", () => {
    const r = getCompanyWorkspaceSchema.safeParse({
      contactUuid: "contact_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contactUuid).toBe("contact_abc-123");
    }
  });

  it("rejects empty contact UUID", () => {
    expect(
      getCompanyWorkspaceSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    expect(getCompanyWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string contactUuid", () => {
    expect(
      getCompanyWorkspaceSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("workspaceMetricSchema", () => {
  const validMetric = {
    label: "Active Requests",
    value: 10,
    note: "Total active requests",
  };

  it("accepts valid metric", () => {
    expect(workspaceMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts zero value", () => {
    expect(
      workspaceMetricSchema.safeParse({
        ...validMetric,
        value: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note", () => {
    const { note: _, ...rest } = validMetric;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative value", () => {
    expect(
      workspaceMetricSchema.safeParse({
        ...validMetric,
        value: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects float value", () => {
    expect(
      workspaceMetricSchema.safeParse({
        ...validMetric,
        value: 10.5,
      }).success,
    ).toBe(false);
  });

  it("rejects string value", () => {
    expect(
      workspaceMetricSchema.safeParse({
        ...validMetric,
        value: "10",
      }).success,
    ).toBe(false);
  });
});

describe("workspaceListItemSchema", () => {
  const validItem = {
    id: "uuid-123",
    title: "Company A",
    subtitle: "Active",
    meta: "Details",
  };

  it("accepts valid item with all fields", () => {
    expect(workspaceListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts item without optional meta", () => {
    const { meta: _, ...minimal } = validItem;
    expect(workspaceListItemSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = validItem;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts number for id", () => {
    expect(
      workspaceListItemSchema.safeParse({
        ...validItem,
        id: 123,
      }).success,
    ).toBe(true);
  });
});

describe("workspaceContactSchema", () => {
  it("accepts valid contact object", () => {
    const r = workspaceContactSchema.safeParse({
      contact_name: "John Doe",
      contact_email: "john@acme.com",
    });
    expect(r.success).toBe(true);
    if (r.success && r.data) {
      expect(r.data.contact_name).toBe("John Doe");
      expect(r.data.contact_email).toBe("john@acme.com");
    }
  });

  it("accepts null (nullable wrapper)", () => {
    expect(workspaceContactSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing contact_name", () => {
    expect(
      workspaceContactSchema.safeParse({ contact_email: "john@acme.com" })
        .success,
    ).toBe(false);
  });

  it("rejects missing contact_email", () => {
    expect(
      workspaceContactSchema.safeParse({ contact_name: "John" }).success,
    ).toBe(false);
  });
});

describe("workspaceOverviewOutputSchema", () => {
  const validOverview = {
    contact: {
      contact_name: "John Doe",
      contact_email: "john@acme.com",
    },
    metrics: [
      { label: "Active Requests", value: 5, note: "Total" },
    ],
    companies: [
      { id: "comp-1", title: "Acme Corp", subtitle: "Active" },
    ],
    requests: [
      { id: "req-1", title: "Dev Request", subtitle: "Open" },
    ],
  };

  it("accepts valid overview with all fields", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({
        ...validOverview,
        metrics: [
          ...validOverview.metrics,
          { label: "Requests", value: 3, note: "Active" },
          { label: "Stores", value: 7, note: "Open" },
          { label: "Notes", value: 2, note: "Total" },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts null contact", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({
        ...validOverview,
        contact: null,
        metrics: [
          ...validOverview.metrics,
          { label: "Requests", value: 3, note: "Active" },
          { label: "Stores", value: 7, note: "Open" },
          { label: "Notes", value: 2, note: "Total" },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({
        ...validOverview,
        metrics: [
          { label: "A", value: 0, note: "" },
          { label: "B", value: 0, note: "" },
          { label: "C", value: 0, note: "" },
          { label: "D", value: 0, note: "" },
        ],
        companies: [],
        requests: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing contact", () => {
    const { contact: _, ...rest } = validOverview;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validOverview;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing companies", () => {
    const { companies: _, ...rest } = validOverview;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = validOverview;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid item in metrics array", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({
        ...validOverview,
        metrics: [{ label: "Incomplete" }],
      }).success,
    ).toBe(false);
  });
});

describe("updateWorkspaceResultSchema", () => {
  it("accepts valid result with contactUuid", () => {
    const r = updateWorkspaceResultSchema.safeParse({
      contactUuid: "contact_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contactUuid).toBe("contact_abc-123");
    }
  });

  it("rejects missing contactUuid", () => {
    expect(updateWorkspaceResultSchema.safeParse({}).success).toBe(false);
  });

  it("accepts empty contactUuid (z.string() without .min() accepts empty)", () => {
    expect(
      updateWorkspaceResultSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(true);
  });

  it("rejects non-string contactUuid", () => {
    expect(
      updateWorkspaceResultSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});
