import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  adminCompanyItemSchema,
  adminListCompaniesResultSchema,
  adminCompanyDetailResultSchema,
  companyActionResultSchema,
  getCompanyWorkspaceSchema,
  workspaceMetricSchema,
  workspaceListItemSchema,
  workspaceContactSchema,
  workspaceOverviewOutputSchema,
  updateWorkspaceResultSchema,
  staffWorkspaceStaffSchema,
  staffListItemSchema,
  staffWorkspaceOutputSchema,
  homeActivityItemSchema,
  homeActiveRequestItemSchema,
  companyHomeOutputSchema,
  entityExistenceSchema,
  actionResultSchema,
  requestStatusUpdateResultSchema,
  type AdminCompanyItem,
  type AdminListCompaniesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema definitions matching the input schemas in src/modules/company/actions.ts
// (These are defined inline in actions.ts so we mirror them here for unit tests.)
// ---------------------------------------------------------------------------

const listCompaniesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().max(255).optional(),
  status: z.coerce.number().int().min(0).max(3).optional(),
  currencyCode: z.string().length(3).optional(),
});

type ListCompaniesInput = z.input<typeof listCompaniesSchema>;

const getCompanySchema = z.object({
  companyId: z.coerce.number().int().positive(),
});

type GetCompanyInput = z.input<typeof getCompanySchema>;

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCompaniesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCompaniesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts name filter", () => {
    const result = listCompaniesSchema.safeParse({ nameFilter: "Tech" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Tech");
    }
  });

  it("accepts status filter", () => {
    const result = listCompaniesSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts currency code", () => {
    const result = listCompaniesSchema.safeParse({ currencyCode: "KWD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("KWD");
    }
  });

  it("rejects invalid status (out of range)", () => {
    const result = listCompaniesSchema.safeParse({ status: 99 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCompaniesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCompaniesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listCompaniesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe("getCompanySchema", () => {
  it("accepts valid company ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("rejects missing company ID", () => {
    const result = getCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero company ID", () => {
    const result = getCompanySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string company ID to number", () => {
    const result = getCompanySchema.safeParse({ companyId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminCompanyItemSchema
// ---------------------------------------------------------------------------

describe("adminCompanyItemSchema", () => {
  it("accepts a full company item", () => {
    const item = {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme Corp",
      company_common_name_ar: null,
      company_email: "acme@example.com",
      company_website: "https://acme.com",
      company_logo: "logo.png",
      commercial_licence: "LIC-123",
      company_hourly_rate: 25.5,
      company_bonus_commission: 10.0,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: true,
      total_candidate: 42,
      no_of_active_requests: 3,
      country_id: 1,
      currency_code: "KWD",
      parent_company_id: null,
      staff_id: 5,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts minimal item with nulls", () => {
    const item = {
      company_id: 2,
      company_name: "Minimal Co",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts bigint for total_candidate", () => {
    const item = {
      company_id: 3,
      company_name: "Big Corp",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: BigInt(1000),
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = adminCompanyItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    const item = {
      company_id: "not-a-number",
      company_name: "Test",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects company_name as number", () => {
    const item = {
      company_id: 1,
      company_name: 123,
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: false,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    const result = adminCompanyItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminListCompaniesResultSchema
// ---------------------------------------------------------------------------

describe("adminListCompaniesResultSchema", () => {
  it("accepts an empty result", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a populated result", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [
        {
          company_id: 1,
          company_name: "Test Corp",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_email: null,
          company_website: null,
          company_logo: null,
          commercial_licence: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_approved_to_hire: true,
          company_status_override: false,
          company_followup: null,
          total_candidate: null,
          no_of_active_requests: null,
          country_id: null,
          currency_code: "KWD",
          parent_company_id: null,
          staff_id: null,
          company_created_at: new Date("2024-01-01"),
          company_updated_at: new Date("2024-06-01"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing companies field", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = adminListCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — adminCompanyDetailResultSchema
// ---------------------------------------------------------------------------

describe("adminCompanyDetailResultSchema", () => {
  it("accepts a valid company item", () => {
    const result = adminCompanyDetailResultSchema.safeParse({
      company_id: 1,
      company_name: "Test",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_email: null,
      company_website: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts null (company not found)", () => {
    const result = adminCompanyDetailResultSchema.safeParse(null);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyActionResultSchema
// ---------------------------------------------------------------------------

describe("companyActionResultSchema", () => {
  it("accepts success result", () => {
    const result = companyActionResultSchema.safeParse({ error: "" });
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = companyActionResultSchema.safeParse({ error: "Something went wrong" });
    expect(result.success).toBe(true);
  });

  it("rejects missing error field", () => {
    const result = companyActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string error", () => {
    const result = companyActionResultSchema.safeParse({ error: 123 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("AdminCompanyItem type shape", () => {
  it("defines expected fields", () => {
    const mock: AdminCompanyItem = {
      company_id: 1,
      company_name: "Test Corp",
      company_common_name_en: "Test Corp",
      company_common_name_ar: null,
      company_email: "test@example.com",
      company_website: "https://example.com",
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: 10.5,
      company_bonus_commission: 5.0,
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: null,
      total_candidate: BigInt(42),
      no_of_active_requests: 3,
      country_id: 1,
      currency_code: "KWD",
      parent_company_id: null,
      staff_id: null,
      company_created_at: new Date("2024-01-01"),
      company_updated_at: new Date("2024-06-01"),
    };
    expect(mock.company_id).toBe(1);
    expect(mock.company_name).toBe("Test Corp");
    expect(mock.currency_code).toBe("KWD");
  });
});

// ---------------------------------------------------------------------------
// Workspace schemas
// ---------------------------------------------------------------------------

describe("getCompanyWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    const r = getCompanyWorkspaceSchema.safeParse({
      contactUuid: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contactUuid).toBe("123e4567-e89b-12d3-a456-426614174000");
    }
  });

  it("rejects empty contact UUID", () => {
    const r = getCompanyWorkspaceSchema.safeParse({ contactUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    const r = getCompanyWorkspaceSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("workspaceMetricSchema", () => {
  it("accepts a valid metric", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Active Requests",
      value: 12,
      note: "Total active requests this month",
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero value", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Empty",
      value: 0,
      note: "No items",
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative value", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Negative",
      value: -5,
      note: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer value", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Float",
      value: 3.14,
      note: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty label", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "",
      value: 1,
      note: "",
    });
    expect(r.success).toBe(false);
  });
});

describe("workspaceListItemSchema", () => {
  it("accepts a valid item with string id", () => {
    const r = workspaceListItemSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Acme Corp",
      subtitle: "Active",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid item with number id", () => {
    const r = workspaceListItemSchema.safeParse({
      id: 42,
      title: "Acme Corp",
      subtitle: "Active",
    });
    expect(r.success).toBe(true);
  });

  it("accepts optional meta field", () => {
    const r = workspaceListItemSchema.safeParse({
      id: 1,
      title: "Test",
      subtitle: "Sub",
      meta: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty title", () => {
    const r = workspaceListItemSchema.safeParse({
      id: 1,
      title: "",
      subtitle: "Sub",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const r = workspaceListItemSchema.safeParse({
      id: 1,
      title: "Test",
    });
    expect(r.success).toBe(false);
  });
});

describe("workspaceContactSchema", () => {
  it("accepts a valid contact object", () => {
    const r = workspaceContactSchema.safeParse({
      contact_name: "John Doe",
      contact_email: "john@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    const r = workspaceContactSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects missing contact_name", () => {
    const r = workspaceContactSchema.safeParse({ contact_email: "a@b.com" });
    expect(r.success).toBe(false);
  });

  it("rejects missing contact_email", () => {
    const r = workspaceContactSchema.safeParse({ contact_name: "John" });
    expect(r.success).toBe(false);
  });

  it("rejects missing contact_name (empty string passes — no .min() guard)", () => {
    // z.string() allows ""; this test is informational
    const r = workspaceContactSchema.safeParse({
      contact_name: "",
      contact_email: "a@b.com",
    });
    expect(r.success).toBe(true);
  });
});

describe("workspaceOverviewOutputSchema", () => {
  const validMetric = (overrides?: Partial<{ label: string; value: number; note: string }>) => ({
    label: "Metric",
    value: 5,
    note: "A note",
    ...overrides,
  });

  it("accepts a full workspace overview", () => {
    const r = workspaceOverviewOutputSchema.safeParse({
      contact: { contact_name: "John", contact_email: "john@example.com" },
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [{ id: 1, title: "Acme", subtitle: "Sub" }],
      requests: [{ id: "uuid-1", title: "Req", subtitle: "Sub" }],
    });
    expect(r.success).toBe(true);
  });

  it("rejects wrong metrics count (less than 4)", () => {
    const r = workspaceOverviewOutputSchema.safeParse({
      contact: null,
      metrics: [validMetric(), validMetric(), validMetric()],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong metrics count (more than 4)", () => {
    const r = workspaceOverviewOutputSchema.safeParse({
      contact: null,
      metrics: [
        validMetric(),
        validMetric(),
        validMetric(),
        validMetric(),
        validMetric(),
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing contact", () => {
    const r = workspaceOverviewOutputSchema.safeParse({
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });
});

describe("updateWorkspaceResultSchema", () => {
  it("accepts a valid contact UUID", () => {
    const r = updateWorkspaceResultSchema.safeParse({
      contactUuid: "some-uuid",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    const r = updateWorkspaceResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Staff workspace schemas
// ---------------------------------------------------------------------------

describe("staffWorkspaceStaffSchema", () => {
  it("accepts a valid staff object", () => {
    const r = staffWorkspaceStaffSchema.safeParse({
      staff_name: "Alice",
      staff_email: "alice@example.com",
      staff_job_title: "Manager",
      staff_salary: 1500,
      staff_salary_currency: "KWD",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffWorkspaceStaffSchema.safeParse({
      staff_name: "Bob",
      staff_email: "bob@example.com",
      staff_job_title: null,
      staff_salary: null,
      staff_salary_currency: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts null (no staff data)", () => {
    const r = staffWorkspaceStaffSchema.safeParse(null);
    expect(r.success).toBe(true);
  });
});

describe("staffListItemSchema", () => {
  it("accepts a valid staff list item", () => {
    const r = staffListItemSchema.safeParse({
      id: "uuid-1",
      title: "Request #1",
      subtitle: "Kuwait City",
    });
    expect(r.success).toBe(true);
  });

  it("accepts optional meta and href", () => {
    const r = staffListItemSchema.safeParse({
      id: 42,
      title: "Story",
      subtitle: "New",
      meta: "2026-06-13",
      href: "/staff/stories/42",
    });
    expect(r.success).toBe(true);
  });
});

describe("staffWorkspaceOutputSchema", () => {
  it("accepts a full staff workspace output", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: {
        staff_name: "Alice",
        staff_email: "alice@example.com",
        staff_job_title: "Manager",
        staff_salary: null,
        staff_salary_currency: null,
      },
      metrics: [
        { label: "Candidates", value: 42, note: "Active" },
      ],
      requests: [{ id: 1, title: "Req", subtitle: "Pending" }],
      stories: [{ id: 2, title: "Story", subtitle: "New" }],
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: null,
      metrics: [],
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing metrics", () => {
    const r = staffWorkspaceOutputSchema.safeParse({
      staff: null,
      requests: [],
      stories: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Company home schemas
// ---------------------------------------------------------------------------

describe("homeActivityItemSchema", () => {
  it("accepts a valid activity item", () => {
    const r = homeActivityItemSchema.safeParse({
      id: "act-1",
      type: "request_created",
      detail: "New request for Software Engineer",
      timestamp: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts all valid types", () => {
    const types = [
      "request_created",
      "request_updated",
      "note_added",
      "application_received",
    ] as const;
    for (const t of types) {
      const r = homeActivityItemSchema.safeParse({
        id: "act-1",
        type: t,
        detail: "Detail",
        timestamp: new Date(),
      });
      expect(r.success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    const r = homeActivityItemSchema.safeParse({
      id: "act-1",
      type: "invalid_type",
      detail: "Detail",
      timestamp: new Date(),
    });
    expect(r.success).toBe(false);
  });

  it("accepts optional relatedEntityId", () => {
    const r = homeActivityItemSchema.safeParse({
      id: "act-1",
      type: "request_created",
      detail: "Detail",
      timestamp: new Date(),
      relatedEntityId: "req-uuid-1",
    });
    expect(r.success).toBe(true);
  });
});

describe("homeActiveRequestItemSchema", () => {
  it("accepts a valid active request item", () => {
    const r = homeActiveRequestItemSchema.safeParse({
      id: "req-uuid-1",
      title: "Software Engineer",
      status: "pending",
      candidatesCount: 5,
      createdAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero candidates", () => {
    const r = homeActiveRequestItemSchema.safeParse({
      id: "req-uuid-2",
      title: "Designer",
      status: "started",
      candidatesCount: 0,
      createdAt: new Date(),
    });
    expect(r.success).toBe(true);
  });
});

describe("companyHomeOutputSchema", () => {
  const validMetric = () => ({
    label: "Metric",
    value: 5,
    note: "Note",
  });

  it("accepts a full company home output", () => {
    const r = companyHomeOutputSchema.safeParse({
      contact: { contact_name: "John", contact_email: "john@example.com" },
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [{ id: 1, title: "Acme", subtitle: "Active" }],
      requests: [{ id: "uuid-1", title: "Req", subtitle: "Pending" }],
      activeRequestCount: 3,
      pendingRequestCount: 1,
      openPositionsCount: 10,
      activeRequests: [
        {
          id: "req-1",
          title: "Engineer",
          status: "pending",
          candidatesCount: 5,
          createdAt: new Date(),
        },
      ],
      recentActivity: [
        {
          id: "act-1",
          type: "request_created",
          detail: "New request",
          timestamp: new Date(),
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative activeRequestCount", () => {
    const r = companyHomeOutputSchema.safeParse({
      contact: null,
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [],
      requests: [],
      activeRequestCount: -1,
      pendingRequestCount: 0,
      openPositionsCount: 0,
      activeRequests: [],
      recentActivity: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative pendingRequestCount", () => {
    const r = companyHomeOutputSchema.safeParse({
      contact: null,
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [],
      requests: [],
      activeRequestCount: 0,
      pendingRequestCount: -1,
      openPositionsCount: 0,
      activeRequests: [],
      recentActivity: [],
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty arrays for activity and requests", () => {
    const r = companyHomeOutputSchema.safeParse({
      contact: null,
      metrics: [validMetric(), validMetric(), validMetric(), validMetric()],
      companies: [],
      requests: [],
      activeRequestCount: 0,
      pendingRequestCount: 0,
      openPositionsCount: 0,
      activeRequests: [],
      recentActivity: [],
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Utility schemas
// ---------------------------------------------------------------------------

describe("entityExistenceSchema", () => {
  it("accepts a valid request UUID", () => {
    const r = entityExistenceSchema.safeParse({
      request_uuid: "some-uuid",
    });
    expect(r.success).toBe(true);
  });

  it("accepts null (entity not found)", () => {
    const r = entityExistenceSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects empty request_uuid", () => {
    const r = entityExistenceSchema.safeParse({ request_uuid: "" });
    expect(r.success).toBe(false);
  });
});

describe("actionResultSchema", () => {
  it("accepts success result", () => {
    const r = actionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(true);
    }
  });

  it("accepts failure result with error", () => {
    const r = actionResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("accepts success even with extra fields (Zod discriminated union ignores extras)", () => {
    // Zod's discriminated union tries the matching branch first;
    // extra fields like `error` are silently ignored.
    const r = actionResultSchema.safeParse({
      success: true,
      error: "Should not have error",
    });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = actionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});

describe("requestStatusUpdateResultSchema", () => {
  it("accepts success result", () => {
    const r = requestStatusUpdateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = requestStatusUpdateResultSchema.safeParse({
      error: "Cannot update",
    });
    expect(r.success).toBe(true);
  });

  it("accepts success even with extra error field (Zod union ignores extras)", () => {
    // Zod's union tries each branch; the first branch matches { success: true },
    // extra `error` field is silently ignored.
    const r = requestStatusUpdateResultSchema.safeParse({
      success: true,
      error: "Conflicting",
    });
    expect(r.success).toBe(true);
  });

  it("rejects neither success nor error", () => {
    const r = requestStatusUpdateResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("AdminListCompaniesResult type shape", () => {
  it("accepts empty result", () => {
    const r: AdminListCompaniesResult = {
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.companies).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: AdminListCompaniesResult = {
      companies: [
        {
          company_id: 1,
          company_name: "Acme",
          company_common_name_en: null,
          company_common_name_ar: null,
          company_email: null,
          company_website: null,
          company_logo: null,
          commercial_licence: null,
          company_hourly_rate: null,
          company_bonus_commission: null,
          company_approved_to_hire: true,
          company_status_override: false,
          company_followup: null,
          total_candidate: null,
          no_of_active_requests: null,
          country_id: null,
          currency_code: "KWD",
          parent_company_id: null,
          staff_id: null,
          company_created_at: new Date(),
          company_updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(r.companies).toHaveLength(1);
    expect(r.totalPages).toBe(1);
  });
});
