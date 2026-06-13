import { describe, it, expect, vi } from "vitest";
import {
  getWorkspaceDataSchema,
  workspaceContactSchema,
  workspaceMetricSchema,
  workspaceCompanyItemSchema,
  workspaceRequestItemSchema,
  workspaceOverviewDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getWorkspaceDataSchema
// ---------------------------------------------------------------------------

describe("getWorkspaceDataSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getWorkspaceDataSchema.safeParse({
      contactUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty string UUID", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: null });
    expect(result.success).toBe(false);
  });

  it("rejects numeric contactUuid", () => {
    const result = getWorkspaceDataSchema.safeParse({ contactUuid: 12345 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("workspaceContactSchema (output validation)", () => {
  it("accepts a valid contact object", () => {
    const r = workspaceContactSchema.safeParse({
      contact_name: "John Doe",
      contact_email: "john@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contact_name", () => {
    const r = workspaceContactSchema.safeParse({ contact_email: "john@example.com" });
    expect(r.success).toBe(false);
  });

  it("rejects missing contact_email", () => {
    const r = workspaceContactSchema.safeParse({ contact_name: "John Doe" });
    expect(r.success).toBe(false);
  });
});

describe("workspaceMetricSchema (output validation)", () => {
  it("accepts a valid metric", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Companies",
      value: 42,
      note: "Linked to this contact",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing label", () => {
    const r = workspaceMetricSchema.safeParse({ value: 42, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects empty label", () => {
    const r = workspaceMetricSchema.safeParse({ label: "", value: 42, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects negative value", () => {
    const r = workspaceMetricSchema.safeParse({ label: "Test", value: -1, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer value", () => {
    const r = workspaceMetricSchema.safeParse({ label: "Test", value: 3.14, note: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing note", () => {
    const r = workspaceMetricSchema.safeParse({ label: "Test", value: 0 });
    expect(r.success).toBe(false);
  });
});

describe("workspaceCompanyItemSchema (output validation)", () => {
  it("accepts a valid company item with minimal fields", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: "link-uuid-1",
      title: "Acme Corp",
      subtitle: "Contact",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a company item with all optional fields", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 42,
      title: "Acme Corp",
      subtitle: "Manager",
      meta: "Access allowed",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = workspaceCompanyItemSchema.safeParse({ title: "Acme", subtitle: "Contact" });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = workspaceCompanyItemSchema.safeParse({ id: "1", title: "", subtitle: "Contact" });
    expect(r.success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const r = workspaceCompanyItemSchema.safeParse({ id: "1", title: "Acme" });
    expect(r.success).toBe(false);
  });
});

describe("workspaceRequestItemSchema (output validation)", () => {
  it("accepts a valid request item with minimal fields", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-uuid-1",
      title: "Software Engineer",
      subtitle: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a request item with meta", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-uuid-1",
      title: "Software Engineer",
      subtitle: "Acme Corp",
      meta: "Active · 5 seats",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = workspaceRequestItemSchema.safeParse({ title: "Engineer", subtitle: "Acme" });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = workspaceRequestItemSchema.safeParse({ id: "req_1", title: "", subtitle: "Acme" });
    expect(r.success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const r = workspaceRequestItemSchema.safeParse({ id: "req_1", title: "Engineer" });
    expect(r.success).toBe(false);
  });
});

describe("workspaceOverviewDataSchema (output validation)", () => {
  it("accepts a valid full workspace with contact data", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: {
        contact_name: "John Doe",
        contact_email: "john@example.com",
      },
      metrics: [
        { label: "Companies", value: 5, note: "Linked" },
        { label: "Requests", value: 12, note: "Across linked" },
        { label: "Stores", value: 3, note: "Active stores" },
        { label: "Notes", value: 8, note: "Internal notes" },
      ],
      companies: [
        { id: "link-1", title: "Acme Corp", subtitle: "Contact", meta: "Access allowed" },
      ],
      requests: [
        { id: "req-1", title: "Engineer", subtitle: "Acme Corp" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid workspace with null contact", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: null,
      metrics: [
        { label: "Companies", value: 0, note: "None" },
        { label: "Requests", value: 0, note: "None" },
        { label: "Stores", value: 0, note: "None" },
        { label: "Notes", value: 0, note: "None" },
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects workspace with wrong number of metrics", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: null,
      metrics: [
        { label: "Companies", value: 0, note: "None" },
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with missing contact", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects workspace with empty metric label", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: null,
      metrics: [
        { label: "", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-object input", () => {
    const r = workspaceOverviewDataSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
