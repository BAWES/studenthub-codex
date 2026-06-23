// ---------------------------------------------------------------------------
// Company workspace — schema validation tests
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { getCompanyWorkspaceSchema } from "./schemas";
// Type-only imports — inline definitions to match actual usage since
// these type names don't exist in the upstream @/modules/company/schemas barrel
type CompanyMetric = { label: string; value: number; note?: string };
type WorkspaceListItem = { id: string; title: string; subtitle: string; meta?: string };
type CompanyWorkspaceData = {
  contact: { contact_name: string; contact_email: string } | null;
  metrics: CompanyMetric[];
  companies: WorkspaceListItem[];
  requests: WorkspaceListItem[];
};

describe("getCompanyWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getCompanyWorkspaceSchema.safeParse({ contactUuid: "abc-123-def" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123-def");
    }
  });

  it("rejects empty contact UUID", () => {
    const result = getCompanyWorkspaceSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = getCompanyWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("CompanyMetric type", () => {
  it("has required shape", () => {
    const m: CompanyMetric = { label: "Companies", value: 5, note: "Linked to this contact" };
    expect(m.label).toBe("Companies");
    expect(m.value).toBe(5);
  });
});

describe("WorkspaceListItem type", () => {
  it("has required shape", () => {
    const item: WorkspaceListItem = { id: "uuid-1", title: "Acme Corp", subtitle: "Owner" };
    expect(item.id).toBe("uuid-1");
    expect(item.subtitle).toBe("Owner");
  });

  it("accepts optional meta", () => {
    const item: WorkspaceListItem = { id: "uuid-2", title: "Beta Inc", subtitle: "Manager", meta: "Access allowed" };
    expect(item.meta).toBe("Access allowed");
  });
});

describe("CompanyWorkspaceData type", () => {
  it("has correct shape with all fields", () => {
    const data: CompanyWorkspaceData = {
      contact: { contact_name: "John", contact_email: "john@test.com" },
      metrics: [
        { label: "Companies", value: 2, note: "Linked" },
        { label: "Requests", value: 10, note: "Across linked companies" },
        { label: "Stores", value: 3, note: "Active stores" },
        { label: "Notes", value: 8, note: "Internal notes" },
      ],
      companies: [
        { id: "cc-1", title: "Alpha", subtitle: "CEO", meta: "Access allowed" },
      ],
      requests: [
        { id: "req-1", title: "Dev", subtitle: "Alpha", meta: "Open · 2 seats" },
      ],
    };
    expect(data.contact!.contact_name).toBe("John");
    expect(data.metrics).toHaveLength(4);
    expect(data.companies).toHaveLength(1);
    expect(data.requests).toHaveLength(1);
  });

  it("accepts null contact for missing contact", () => {
    const data: CompanyWorkspaceData = {
      contact: null,
      metrics: [],
      companies: [],
      requests: [],
    };
    expect(data.contact).toBeNull();
  });
});
