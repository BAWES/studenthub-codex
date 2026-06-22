import { describe, it, expect } from "vitest";
import {
  // Workspace/dashboard
  getCompanyWorkspaceSchema,
  workspaceMetricSchema,
  workspaceListItemSchema,
  workspaceContactSchema,
  workspaceOverviewOutputSchema,
  updateWorkspaceResultSchema,
  // Staff workspace
  staffWorkspaceStaffSchema,
  staffListItemSchema,
  staffWorkspaceOutputSchema,
  // Company home
  homeActivityItemSchema,
  homeActiveRequestItemSchema,
  companyHomeOutputSchema,
  // Existence & action results
  entityExistenceSchema,
  actionResultSchema,
  requestStatusUpdateResultSchema,
  // Input validation
  listCompaniesSchema,
  getCompanySchema,
  // Output validation — actions-list
  listCompaniesResultSchema,
  // Output validation — admin
  adminCompanyItemSchema,
  adminListCompaniesResultSchema,
  adminCompanyDetailResultSchema,
  companyActionResultSchema,
  // Company Contacts — input
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  listCompanyContactsRowsSchema,
  // Company Contacts — output
  companyContactListItemSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
  // Company Notes — input
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
  // Company Notes — output
  companyNoteListItemSchema,
  listCompanyNotesResultSchema,
  companyNoteDetailSchema,
  companyNoteActionResultSchema,
  // Company Notes — [id] sub-page
  getNoteEntrySchema,
  deleteNoteEntrySchema,
  updateNoteEntrySchema,
  // Company Stores — input
  listStoresSchema,
  getStoreSchema,
  listStoresRowsSchema,
  listMallsAndBrandsSchema,
  listCompanySelectOptionsSchema,
  // Company Requests — input
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  updateRequestStatusSchema,
  deleteRequestSchema,
  createCompanyRequestSchema,
  getCompanyListSchema,
  // Company Requests — output
  companyRequestActionResultSchema,
  companyRequestListItemSchema,
  listCompanyRequestsResultSchema,
  companyRequestDetailSchema,
  companyRequestCreateResultSchema,
} from "./schemas";

// ===========================================================================
// Workspace/dashboard schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// getCompanyWorkspaceSchema (input)
// ---------------------------------------------------------------------------
describe("getCompanyWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      getCompanyWorkspaceSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(getCompanyWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(getCompanyWorkspaceSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for contactUuid", () => {
    expect(
      getCompanyWorkspaceSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceMetricSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceMetricSchema", () => {
  const valid = { label: "Total Employees", value: 42, note: "Active staff" };

  it("accepts a valid metric", () => {
    expect(workspaceMetricSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero value", () => {
    expect(
      workspaceMetricSchema.safeParse({ ...valid, value: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = valid;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = valid;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note", () => {
    const { note: _, ...rest } = valid;
    expect(workspaceMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer value", () => {
    expect(
      workspaceMetricSchema.safeParse({ ...valid, value: 42.5 }).success,
    ).toBe(false);
  });

  it("rejects negative value", () => {
    expect(
      workspaceMetricSchema.safeParse({ ...valid, value: -1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for label", () => {
    expect(
      workspaceMetricSchema.safeParse({ ...valid, label: 123 }).success,
    ).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      workspaceMetricSchema.safeParse({ ...valid, label: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceListItemSchema (output)
// ---------------------------------------------------------------------------
describe("workspaceListItemSchema", () => {
  const valid = {
    id: 1,
    title: "Acme Corp",
    subtitle: "Active",
    meta: "extra-data",
  };

  it("accepts a valid list item", () => {
    expect(workspaceListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts string id", () => {
    expect(
      workspaceListItemSchema.safeParse({ ...valid, id: "uuid-abc" }).success,
    ).toBe(true);
  });

  it("accepts optional meta", () => {
    expect(
      workspaceListItemSchema.safeParse({ ...valid, meta: "extra" }).success,
    ).toBe(true);
  });

  it("accepts missing meta", () => {
    const { meta: _, ...rest } = valid;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = valid;
    expect(workspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      workspaceListItemSchema.safeParse({ ...valid, title: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id (boolean)", () => {
    expect(
      workspaceListItemSchema.safeParse({ ...valid, id: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceContactSchema (nullable)
// ---------------------------------------------------------------------------
describe("workspaceContactSchema", () => {
  const valid = { contact_name: "John", contact_email: "john@test.com" };

  it("accepts a valid contact", () => {
    expect(workspaceContactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null", () => {
    expect(workspaceContactSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing contact_name", () => {
    const { contact_name: _, ...rest } = valid;
    expect(workspaceContactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing contact_email", () => {
    const { contact_email: _, ...rest } = valid;
    expect(workspaceContactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type (string instead of object)", () => {
    expect(workspaceContactSchema.safeParse("not-null-or-object").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workspaceOverviewOutputSchema (composed)
// ---------------------------------------------------------------------------
describe("workspaceOverviewOutputSchema", () => {
  const valid = {
    contact: { contact_name: "John", contact_email: "john@test.com" },
    metrics: [
      { label: "A", value: 1, note: "Note A" },
      { label: "B", value: 2, note: "Note B" },
      { label: "C", value: 3, note: "Note C" },
      { label: "D", value: 4, note: "Note D" },
    ],
    companies: [{ id: 1, title: "Co", subtitle: "Active" }],
    requests: [{ id: 2, title: "Req", subtitle: "Pending" }],
  };

  it("accepts a valid overview", () => {
    expect(workspaceOverviewOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null contact", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({ ...valid, contact: null }).success,
    ).toBe(true);
  });

  it("rejects metrics with wrong length (3 instead of 4)", () => {
    expect(
      workspaceOverviewOutputSchema.safeParse({
        ...valid,
        metrics: [
          { label: "A", value: 1, note: "N" },
          { label: "B", value: 2, note: "N" },
          { label: "C", value: 3, note: "N" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects missing contact", () => {
    const { contact: _, ...rest } = valid;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = valid;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing companies", () => {
    const { companies: _, ...rest } = valid;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = valid;
    expect(workspaceOverviewOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkspaceResultSchema (output)
// ---------------------------------------------------------------------------
describe("updateWorkspaceResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      updateWorkspaceResultSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(updateWorkspaceResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for contactUuid", () => {
    expect(
      updateWorkspaceResultSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Staff workspace schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// staffWorkspaceStaffSchema (nullable)
// ---------------------------------------------------------------------------
describe("staffWorkspaceStaffSchema", () => {
  const valid = {
    staff_name: "Jane",
    staff_email: "jane@test.com",
    staff_job_title: null,
    staff_salary: null,
    staff_salary_currency: null,
  };

  it("accepts a valid staff object", () => {
    expect(staffWorkspaceStaffSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts non-null job_title", () => {
    expect(
      staffWorkspaceStaffSchema.safeParse({
        ...valid,
        staff_job_title: "Manager",
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(staffWorkspaceStaffSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing staff_name", () => {
    const { staff_name: _, ...rest } = valid;
    expect(staffWorkspaceStaffSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing staff_email", () => {
    const { staff_email: _, ...rest } = valid;
    expect(staffWorkspaceStaffSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for staff_salary (string)", () => {
    expect(
      staffWorkspaceStaffSchema.safeParse({ ...valid, staff_salary: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffListItemSchema (output)
// ---------------------------------------------------------------------------
describe("staffListItemSchema", () => {
  const valid = {
    id: 1,
    title: "Title",
    subtitle: "Subtitle",
  };

  it("accepts a valid list item", () => {
    expect(staffListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts string id", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, id: "uuid-xyz" }).success,
    ).toBe(true);
  });

  it("accepts optional meta and href", () => {
    expect(
      staffListItemSchema.safeParse({
        ...valid,
        meta: "meta",
        href: "/path",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id (boolean)", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, id: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffWorkspaceOutputSchema (composed)
// ---------------------------------------------------------------------------
describe("staffWorkspaceOutputSchema", () => {
  const valid = {
    staff: {
      staff_name: "Jane",
      staff_email: "jane@test.com",
      staff_job_title: null,
      staff_salary: null,
      staff_salary_currency: null,
    },
    metrics: [{ label: "M1", value: 10, note: "Note" }],
    requests: [{ id: 1, title: "Req", subtitle: "Pending" }],
    stories: [{ id: 2, title: "Story", subtitle: "Draft" }],
  };

  it("accepts a valid staff workspace output", () => {
    expect(staffWorkspaceOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null staff", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({ ...valid, staff: null }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...valid,
        metrics: [],
        requests: [],
        stories: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = valid;
    expect(staffWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = valid;
    expect(staffWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing stories", () => {
    const { stories: _, ...rest } = valid;
    expect(staffWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ===========================================================================
// Company home schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// homeActivityItemSchema
// ---------------------------------------------------------------------------
describe("homeActivityItemSchema", () => {
  const valid = {
    id: "act-1",
    type: "request_created",
    detail: "Request #123 was created",
    timestamp: new Date("2026-01-01"),
  };

  it("accepts a valid activity item", () => {
    expect(homeActivityItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all activity types", () => {
    for (const type of [
      "request_created",
      "request_updated",
      "note_added",
      "application_received",
    ]) {
      expect(
        homeActivityItemSchema.safeParse({ ...valid, type }).success,
      ).toBe(true);
    }
  });

  it("accepts optional relatedEntityId", () => {
    expect(
      homeActivityItemSchema.safeParse({
        ...valid,
        relatedEntityId: "entity-1",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(homeActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(homeActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing detail", () => {
    const { detail: _, ...rest } = valid;
    expect(homeActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing timestamp", () => {
    const { timestamp: _, ...rest } = valid;
    expect(homeActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid type value", () => {
    expect(
      homeActivityItemSchema.safeParse({ ...valid, type: "invalid_type" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for timestamp (string instead of Date)", () => {
    expect(
      homeActivityItemSchema.safeParse({ ...valid, timestamp: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id (number)", () => {
    expect(
      homeActivityItemSchema.safeParse({ ...valid, id: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// homeActiveRequestItemSchema
// ---------------------------------------------------------------------------
describe("homeActiveRequestItemSchema", () => {
  const valid = {
    id: "req-1",
    title: "Software Engineer",
    status: "active",
    candidatesCount: 5,
    createdAt: new Date("2026-01-01"),
  };

  it("accepts a valid active request item", () => {
    expect(homeActiveRequestItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero candidatesCount", () => {
    expect(
      homeActiveRequestItemSchema.safeParse({ ...valid, candidatesCount: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(homeActiveRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(homeActiveRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid;
    expect(homeActiveRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidatesCount", () => {
    const { candidatesCount: _, ...rest } = valid;
    expect(homeActiveRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = valid;
    expect(homeActiveRequestItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidatesCount (string)", () => {
    expect(
      homeActiveRequestItemSchema.safeParse({ ...valid, candidatesCount: "abc" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for createdAt (string)", () => {
    expect(
      homeActiveRequestItemSchema.safeParse({ ...valid, createdAt: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyHomeOutputSchema (extends workspaceOverviewOutputSchema)
// ---------------------------------------------------------------------------
describe("companyHomeOutputSchema", () => {
  const valid = {
    contact: { contact_name: "John", contact_email: "john@test.com" },
    metrics: [
      { label: "A", value: 1, note: "N" },
      { label: "B", value: 2, note: "N" },
      { label: "C", value: 3, note: "N" },
      { label: "D", value: 4, note: "N" },
    ],
    companies: [],
    requests: [],
    activeRequestCount: 10,
    pendingRequestCount: 3,
    openPositionsCount: 15,
    activeRequests: [
      {
        id: "req-1",
        title: "Engineer",
        status: "active",
        candidatesCount: 5,
        createdAt: new Date("2026-01-01"),
      },
    ],
    recentActivity: [
      {
        id: "act-1",
        type: "request_created",
        detail: "Created",
        timestamp: new Date("2026-01-01"),
      },
    ],
  };

  it("accepts a valid company home output", () => {
    expect(companyHomeOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty activeRequests and recentActivity", () => {
    expect(
      companyHomeOutputSchema.safeParse({
        ...valid,
        activeRequests: [],
        recentActivity: [],
      }).success,
    ).toBe(true);
  });

  it("rejects negative activeRequestCount", () => {
    expect(
      companyHomeOutputSchema.safeParse({ ...valid, activeRequestCount: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing activeRequestCount", () => {
    const { activeRequestCount: _, ...rest } = valid;
    expect(companyHomeOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing pendingRequestCount", () => {
    const { pendingRequestCount: _, ...rest } = valid;
    expect(companyHomeOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing openPositionsCount", () => {
    const { openPositionsCount: _, ...rest } = valid;
    expect(companyHomeOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing activeRequests", () => {
    const { activeRequests: _, ...rest } = valid;
    expect(companyHomeOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentActivity", () => {
    const { recentActivity: _, ...rest } = valid;
    expect(companyHomeOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array activeRequests", () => {
    expect(
      companyHomeOutputSchema.safeParse({ ...valid, activeRequests: "not-array" })
        .success,
    ).toBe(false);
  });
});

// ===========================================================================
// Existence & action result schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// entityExistenceSchema (nullable)
// ---------------------------------------------------------------------------
describe("entityExistenceSchema", () => {
  it("accepts a valid entity with request_uuid", () => {
    expect(
      entityExistenceSchema.safeParse({ request_uuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(entityExistenceSchema.safeParse(null).success).toBe(true);
  });

  it("rejects empty request_uuid", () => {
    expect(
      entityExistenceSchema.safeParse({ request_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    expect(entityExistenceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for request_uuid", () => {
    expect(
      entityExistenceSchema.safeParse({ request_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResultSchema (discriminatedUnion)
// ---------------------------------------------------------------------------
describe("actionResultSchema", () => {
  it("accepts success: true without error", () => {
    expect(
      actionResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts success: false with error string", () => {
    expect(
      actionResultSchema.safeParse({ success: false, error: "Failed" }).success,
    ).toBe(true);
  });

  it("accepts success: true with extra error (discriminatedUnion strips extras)", () => {
    const result = actionResultSchema.safeParse({ success: true, error: "Should not be here" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.success).toBe(true);
      // Extra error field is stripped by discriminatedUnion branching
    }
  });

  it("rejects success: false without error", () => {
    expect(
      actionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects missing success", () => {
    expect(actionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success (string)", () => {
    expect(
      actionResultSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestStatusUpdateResultSchema (union)
// ---------------------------------------------------------------------------
describe("requestStatusUpdateResultSchema", () => {
  it("accepts success: true", () => {
    expect(
      requestStatusUpdateResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error string", () => {
    expect(
      requestStatusUpdateResultSchema.safeParse({ error: "Something failed" }).success,
    ).toBe(true);
  });

  it("accepts success: true with extra error (union tolerates extra fields)", () => {
    expect(
      requestStatusUpdateResultSchema.safeParse({
        success: true,
        error: "unexpected",
      }).success,
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(requestStatusUpdateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success (string)", () => {
    expect(
      requestStatusUpdateResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error (number)", () => {
    expect(
      requestStatusUpdateResultSchema.safeParse({ error: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Input validation schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// listCompaniesSchema (input with defaults)
// ---------------------------------------------------------------------------
describe("listCompaniesSchema", () => {
  it("accepts valid params with all fields", () => {
    expect(
      listCompaniesSchema.safeParse({
        nameFilter: "Acme",
        status: "active",
        page: 2,
        pageSize: 50,
      }).success,
    ).toBe(true);
  });

  it("accepts empty object and applies defaults", () => {
    const result = listCompaniesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("accepts status as empty string", () => {
    expect(
      listCompaniesSchema.safeParse({ status: "" }).success,
    ).toBe(true);
  });

  it("accepts status as inactive", () => {
    expect(
      listCompaniesSchema.safeParse({ status: "inactive" }).success,
    ).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      listCompaniesSchema.safeParse({ status: "unknown" }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCompaniesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCompaniesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero pageSize", () => {
    expect(listCompaniesSchema.safeParse({ pageSize: 0 }).success).toBe(false);
  });

  it("rejects pageSize above 100", () => {
    expect(listCompaniesSchema.safeParse({ pageSize: 200 }).success).toBe(false);
  });

  it("rejects wrong type for nameFilter", () => {
    expect(
      listCompaniesSchema.safeParse({ nameFilter: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanySchema (input)
// ---------------------------------------------------------------------------
describe("getCompanySchema", () => {
  it("accepts a valid company ID", () => {
    expect(getCompanySchema.safeParse({ companyId: 1 }).success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(getCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(getCompanySchema.safeParse({ companyId: -5 }).success).toBe(false);
  });

  it("rejects wrong type for companyId (string)", () => {
    expect(getCompanySchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });
});

// ===========================================================================
// Output validation — actions-list
// ===========================================================================

// ---------------------------------------------------------------------------
// companyNoteListItemSchema
// ---------------------------------------------------------------------------
describe("companyNoteListItemSchema", () => {
  const valid = {
    company_id: 1,
    company_name: "Acme Corp",
    company_common_name_en: null,
    company_common_name_ar: null,
    company_email: null,
    company_website: null,
    company_logo: null,
    commission: null,
    total_candidate: null,
    no_of_active_requests: null,
    followup: null,
    currency_code: null,
  };

  it("accepts a valid company list item", () => {
    expect(companyNoteListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts non-null common names", () => {
    expect(
      companyNoteListItemSchema.safeParse({
        ...valid,
        company_common_name_en: "Acme",
        company_common_name_ar: "أكمي",
      }).success,
    ).toBe(true);
  });

  it("accepts non-null commission and totals", () => {
    expect(
      companyNoteListItemSchema.safeParse({
        ...valid,
        commission: 15,
        total_candidate: 42,
        no_of_active_requests: 5,
      }).success,
    ).toBe(true);
  });

  it("accepts non-null followup boolean", () => {
    expect(
      companyNoteListItemSchema.safeParse({ ...valid, followup: true }).success,
    ).toBe(true);
  });

  it("accepts optional detail fields", () => {
    expect(
      companyNoteListItemSchema.safeParse({
        ...valid,
        company_description_en: "Desc EN",
        company_description_ar: "Desc AR",
        commercial_licence: "LIC-123",
        company_hourly_rate: 50,
        company_bonus_commission: 10,
        parent_company_id: 2,
        staff_id: 3,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(companyNoteListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = valid;
    expect(companyNoteListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id (string)", () => {
    expect(
      companyNoteListItemSchema.safeParse({ ...valid, company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for followup (number)", () => {
    expect(
      companyNoteListItemSchema.safeParse({ ...valid, followup: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompaniesResultSchema
// ---------------------------------------------------------------------------
describe("listCompaniesResultSchema", () => {
  const valid = {
    items: [
      {
        company_id: 1,
        company_name: "Acme Corp",
        company_common_name_en: null,
        company_common_name_ar: null,
        company_email: null,
        company_website: null,
        company_logo: null,
        commission: null,
        total_candidate: null,
        no_of_active_requests: null,
        followup: null,
        currency_code: null,
      },
    ],
    total: 10,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid result", () => {
    expect(listCompaniesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCompaniesResultSchema.safeParse({
        ...valid,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = valid;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing pageSize", () => {
    const { pageSize: _, ...rest } = valid;
    expect(listCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCompaniesResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero pageSize", () => {
    expect(
      listCompaniesResultSchema.safeParse({ ...valid, pageSize: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-array items", () => {
    expect(
      listCompaniesResultSchema.safeParse({ ...valid, items: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyDetailResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("adminCompanyDetailResultSchema", () => {
  it("accepts a valid company detail", () => {
    expect(
      adminCompanyDetailResultSchema.safeParse({
        company_id: 1,
        company_name: "Acme",
        company_common_name_en: null,
        company_common_name_ar: null,
        company_email: null,
        company_website: null,
        company_logo: null,
        commission: null,
        total_candidate: null,
        no_of_active_requests: null,
        followup: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(adminCompanyDetailResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid data", () => {
    expect(
      adminCompanyDetailResultSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Admin output schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// adminCompanyItemSchema
// ---------------------------------------------------------------------------
describe("adminCompanyItemSchema", () => {
  const valid = {
    company_id: 1,
    company_name: "Acme Corp",
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
    company_created_at: "2026-01-01T00:00:00Z",
    company_updated_at: "2026-06-01T00:00:00Z",
  };

  it("accepts a valid admin company item", () => {
    expect(adminCompanyItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts coerce date strings", () => {
    const result = adminCompanyItemSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_created_at).toBeInstanceOf(Date);
    }
  });

  it("accepts total_candidate as bigint", () => {
    expect(
      adminCompanyItemSchema.safeParse({ ...valid, total_candidate: BigInt(42) }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(adminCompanyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = valid;
    expect(adminCompanyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_approved_to_hire", () => {
    const { company_approved_to_hire: _, ...rest } = valid;
    expect(adminCompanyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_created_at", () => {
    const { company_created_at: _, ...rest } = valid;
    expect(adminCompanyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id (string)", () => {
    expect(
      adminCompanyItemSchema.safeParse({ ...valid, company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_approved_to_hire (number)", () => {
    expect(
      adminCompanyItemSchema.safeParse({ ...valid, company_approved_to_hire: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminListCompaniesResultSchema
// ---------------------------------------------------------------------------
describe("adminListCompaniesResultSchema", () => {
  const valid = {
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
        currency_code: null,
        parent_company_id: null,
        staff_id: null,
        company_created_at: "2026-01-01T00:00:00Z",
        company_updated_at: "2026-06-01T00:00:00Z",
      },
    ],
    total: 10,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(adminListCompaniesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty companies array", () => {
    expect(
      adminListCompaniesResultSchema.safeParse({
        ...valid,
        companies: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing companies", () => {
    const { companies: _, ...rest } = valid;
    expect(adminListCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(adminListCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(adminListCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    expect(adminListCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = valid;
    expect(adminListCompaniesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      adminListCompaniesResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(
      adminListCompaniesResultSchema.safeParse({ ...valid, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-array companies", () => {
    expect(
      adminListCompaniesResultSchema.safeParse({ ...valid, companies: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyDetailResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("adminCompanyDetailResultSchema", () => {
  it("accepts a valid admin company detail", () => {
    expect(
      adminCompanyDetailResultSchema.safeParse({
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
        currency_code: null,
        parent_company_id: null,
        staff_id: null,
        company_created_at: "2026-01-01T00:00:00Z",
        company_updated_at: "2026-06-01T00:00:00Z",
      }).success,
    ).toBe(true);
  });

  it("accepts null", () => {
    expect(adminCompanyDetailResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid data", () => {
    expect(
      adminCompanyDetailResultSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyActionResultSchema (output)
// ---------------------------------------------------------------------------
describe("companyActionResultSchema", () => {
  it("accepts a valid error result", () => {
    expect(
      companyActionResultSchema.safeParse({ error: "Something went wrong" }).success,
    ).toBe(true);
  });

  it("rejects missing error", () => {
    expect(companyActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("accepts empty error string", () => {
    expect(
      companyActionResultSchema.safeParse({ error: "" }).success,
    ).toBe(true);
  });

  it("rejects wrong type for error", () => {
    expect(
      companyActionResultSchema.safeParse({ error: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Contacts — input schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// listCompanyContactsSchema (input, all optional)
// ---------------------------------------------------------------------------
describe("listCompanyContactsSchema", () => {
  it("accepts valid params", () => {
    expect(
      listCompanyContactsSchema.safeParse({ company_id: 1, page: 2, limit: 50 }).success,
    ).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    expect(listCompanyContactsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-positive company_id", () => {
    expect(
      listCompanyContactsSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyContactsSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCompanyContactsSchema.safeParse({ limit: 200 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_id (string)", () => {
    expect(
      listCompanyContactsSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyContactSchema (input)
// ---------------------------------------------------------------------------
describe("getCompanyContactSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getCompanyContactSchema.safeParse({ uuid: "contact-uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getCompanyContactSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCompanyContactSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(getCompanyContactSchema.safeParse({ uuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanyContactSchema (input)
// ---------------------------------------------------------------------------
describe("createCompanyContactSchema", () => {
  const valid = {
    company_id: 1,
    contact_name: "John Doe",
  };

  it("accepts valid input with only required fields", () => {
    expect(createCompanyContactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts input with all optional fields", () => {
    expect(
      createCompanyContactSchema.safeParse({
        ...valid,
        contact_email: "john@test.com",
        contact_position: "Manager",
        allow_access: true,
      }).success,
    ).toBe(true);
  });

  it("accepts allow_access default (false)", () => {
    const result = createCompanyContactSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allow_access).toBe(false);
    }
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(createCompanyContactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing contact_name", () => {
    const { contact_name: _, ...rest } = valid;
    expect(createCompanyContactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty contact_name", () => {
    expect(
      createCompanyContactSchema.safeParse({ ...valid, contact_name: "" }).success,
    ).toBe(false);
  });

  it("rejects contact_name exceeding 255 chars", () => {
    expect(
      createCompanyContactSchema.safeParse({
        ...valid,
        contact_name: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      createCompanyContactSchema.safeParse({
        ...valid,
        contact_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects contact_position exceeding 100 chars", () => {
    expect(
      createCompanyContactSchema.safeParse({
        ...valid,
        contact_position: "x".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      createCompanyContactSchema.safeParse({ ...valid, company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_id (string)", () => {
    expect(
      createCompanyContactSchema.safeParse({ ...valid, company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for allow_access (string)", () => {
    expect(
      createCompanyContactSchema.safeParse({ ...valid, allow_access: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyContactSchema (input)
// ---------------------------------------------------------------------------
describe("updateCompanyContactSchema", () => {
  const valid = { uuid: "contact-uuid-123" };

  it("accepts valid update with only uuid", () => {
    expect(updateCompanyContactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts update with all optional fields", () => {
    expect(
      updateCompanyContactSchema.safeParse({
        ...valid,
        contact_position: "Manager",
        allow_access: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(updateCompanyContactSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      updateCompanyContactSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects contact_position exceeding 100 chars", () => {
    expect(
      updateCompanyContactSchema.safeParse({
        ...valid,
        contact_position: "x".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for allow_access (string)", () => {
    expect(
      updateCompanyContactSchema.safeParse({ ...valid, allow_access: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyContactsRowsSchema (input)
// ---------------------------------------------------------------------------
describe("listCompanyContactsRowsSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      listCompanyContactsRowsSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listCompanyContactsRowsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(
      listCompanyContactsRowsSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for contactUuid", () => {
    expect(
      listCompanyContactsRowsSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Contacts — output schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// companyContactListItemSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactListItemSchema", () => {
  const valid = {
    company_contact_uuid: "uuid-1",
    company_id: null,
    contact_position: null,
    allow_access: null,
    contact_name: null,
    contact_email: null,
    company_name: null,
  };

  it("accepts a valid contact list item", () => {
    expect(companyContactListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      companyContactListItemSchema.safeParse({
        company_contact_uuid: "uuid-1",
        company_id: 1,
        contact_position: "Manager",
        allow_access: true,
        contact_name: "John",
        contact_email: "john@test.com",
        company_name: "Acme",
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_contact_uuid", () => {
    const { company_contact_uuid: _, ...rest } = valid;
    expect(companyContactListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_contact_uuid (number)", () => {
    expect(
      companyContactListItemSchema.safeParse({ ...valid, company_contact_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyContactsResultSchema (output)
// ---------------------------------------------------------------------------
describe("listCompanyContactsResultSchema", () => {
  const valid = {
    contacts: [
      {
        company_contact_uuid: "uuid-1",
        company_id: null,
        contact_position: null,
        allow_access: null,
        contact_name: null,
        contact_email: null,
        company_name: null,
      },
    ],
    total: 5,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCompanyContactsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty contacts array", () => {
    expect(
      listCompanyContactsResultSchema.safeParse({
        ...valid,
        contacts: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing contacts", () => {
    const { contacts: _, ...rest } = valid;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = valid;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array contacts", () => {
    expect(
      listCompanyContactsResultSchema.safeParse({ ...valid, contacts: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyContactDetailSchema (nullable)
// ---------------------------------------------------------------------------
describe("companyContactDetailSchema", () => {
  const valid = {
    company_contact_uuid: "uuid-1",
    contact_uuid: null,
    company_id: null,
    contact_position: null,
    allow_access: null,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
    contact_name: null,
    contact_email: null,
    company_name: null,
  };

  it("accepts a valid contact detail", () => {
    expect(companyContactDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null", () => {
    expect(companyContactDetailSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing created_at", () => {
    const { created_at: _, ...rest } = valid;
    expect(companyContactDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updated_at", () => {
    const { updated_at: _, ...rest } = valid;
    expect(companyContactDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for created_at (string)", () => {
    expect(
      companyContactDetailSchema.safeParse({ ...valid, created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyContactUuidResultSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactUuidResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      companyContactUuidResultSchema.safeParse({ company_contact_uuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing company_contact_uuid", () => {
    expect(companyContactUuidResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for company_contact_uuid", () => {
    expect(
      companyContactUuidResultSchema.safeParse({ company_contact_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyContactRowSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactRowSchema", () => {
  const valid = {
    id: "row-uuid",
    name: "John Doe",
    email: "john@test.com",
    position: "Manager",
    companyName: "Acme Corp",
    allowAccess: true,
  };

  it("accepts a valid contact row", () => {
    expect(companyContactRowSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing position", () => {
    const { position: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing companyName", () => {
    const { companyName: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing allowAccess", () => {
    const { allowAccess: _, ...rest } = valid;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for allowAccess (number)", () => {
    expect(
      companyContactRowSchema.safeParse({ ...valid, allowAccess: 1 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Notes — input schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// listCompanyNotesSchema (input, all optional)
// ---------------------------------------------------------------------------
describe("listCompanyNotesSchema", () => {
  it("accepts valid params", () => {
    expect(
      listCompanyNotesSchema.safeParse({ company_id: 1, page: 2, limit: 50 }).success,
    ).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    expect(listCompanyNotesSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-positive company_id", () => {
    expect(
      listCompanyNotesSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyNotesSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCompanyNotesSchema.safeParse({ limit: 200 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyNoteSchema (input)
// ---------------------------------------------------------------------------
describe("getCompanyNoteSchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      getCompanyNoteSchema.safeParse({ noteUuid: "note-uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(getCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      getCompanyNoteSchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for noteUuid", () => {
    expect(
      getCompanyNoteSchema.safeParse({ noteUuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanyNoteSchema (input)
// ---------------------------------------------------------------------------
describe("createCompanyNoteSchema", () => {
  const valid = { company_id: 1, note_text: "This is a note about the company." };

  it("accepts valid input with only required fields", () => {
    expect(createCompanyNoteSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts input with all optional fields", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...valid,
        note_type: "general",
        created_by: 42,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(createCompanyNoteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note_text", () => {
    const { note_text: _, ...rest } = valid;
    expect(createCompanyNoteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty note_text", () => {
    expect(
      createCompanyNoteSchema.safeParse({ ...valid, note_text: "" }).success,
    ).toBe(false);
  });

  it("rejects note_text exceeding 10000 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...valid,
        note_text: "x".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("rejects note_type exceeding 100 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...valid,
        note_type: "x".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({ ...valid, company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_by (string)", () => {
    expect(
      createCompanyNoteSchema.safeParse({ ...valid, created_by: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyNoteSchema (input)
// ---------------------------------------------------------------------------
describe("updateCompanyNoteSchema", () => {
  const valid = { noteUuid: "note-uuid-123" };

  it("accepts valid update with only noteUuid", () => {
    expect(updateCompanyNoteSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts update with all optional fields", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note-uuid-123",
        note_text: "Updated text",
        note_type: "urgent",
        updated_by: 42,
      }).success,
    ).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(updateCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      updateCompanyNoteSchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects note_text exceeding 10000 chars", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        ...valid,
        note_text: "x".repeat(10001),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCompanyNoteSchema (input)
// ---------------------------------------------------------------------------
describe("deleteCompanyNoteSchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      deleteCompanyNoteSchema.safeParse({ noteUuid: "note-uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(deleteCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      deleteCompanyNoteSchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for noteUuid", () => {
    expect(
      deleteCompanyNoteSchema.safeParse({ noteUuid: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Notes — [id] sub-page input schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// getNoteEntrySchema (input)
// ---------------------------------------------------------------------------
describe("getNoteEntrySchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      getNoteEntrySchema.safeParse({ noteUuid: "entry-uuid" }).success,
    ).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(getNoteEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(getNoteEntrySchema.safeParse({ noteUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteNoteEntrySchema (input)
// ---------------------------------------------------------------------------
describe("deleteNoteEntrySchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      deleteNoteEntrySchema.safeParse({ noteUuid: "entry-uuid" }).success,
    ).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(deleteNoteEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      deleteNoteEntrySchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateNoteEntrySchema (input)
// ---------------------------------------------------------------------------
describe("updateNoteEntrySchema", () => {
  const valid = {
    noteUuid: "entry-uuid",
    noteText: "Updated note text",
    companyId: 1,
  };

  it("accepts valid input", () => {
    expect(updateNoteEntrySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    const { noteUuid: _, ...rest } = valid;
    expect(updateNoteEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing noteText", () => {
    const { noteText: _, ...rest } = valid;
    expect(updateNoteEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const { companyId: _, ...rest } = valid;
    expect(updateNoteEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty noteText", () => {
    expect(
      updateNoteEntrySchema.safeParse({ ...valid, noteText: "" }).success,
    ).toBe(false);
  });

  it("rejects non-positive companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({ ...valid, companyId: 0 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Stores — input schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// listStoresSchema (input, all optional)
// ---------------------------------------------------------------------------
describe("listStoresSchema", () => {
  it("accepts valid params", () => {
    expect(
      listStoresSchema.safeParse({
        page: 2,
        limit: 50,
        company_id: 1,
        store_status: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    expect(listStoresSchema.safeParse({}).success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listStoresSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listStoresSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      listStoresSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for store_status (string)", () => {
    expect(
      listStoresSchema.safeParse({ store_status: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStoreSchema (input)
// ---------------------------------------------------------------------------
describe("getStoreSchema", () => {
  it("accepts a valid store ID", () => {
    expect(getStoreSchema.safeParse({ store_id: 1 }).success).toBe(true);
  });

  it("rejects missing store_id", () => {
    expect(getStoreSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive store_id", () => {
    expect(getStoreSchema.safeParse({ store_id: 0 }).success).toBe(false);
  });

  it("rejects wrong type for store_id (string)", () => {
    expect(
      getStoreSchema.safeParse({ store_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoresRowsSchema (input)
// ---------------------------------------------------------------------------
describe("listStoresRowsSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      listStoresRowsSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listStoresRowsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(
      listStoresRowsSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMallsAndBrandsSchema (input)
// ---------------------------------------------------------------------------
describe("listMallsAndBrandsSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      listMallsAndBrandsSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listMallsAndBrandsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(
      listMallsAndBrandsSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanySelectOptionsSchema (input)
// ---------------------------------------------------------------------------
describe("listCompanySelectOptionsSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      listCompanySelectOptionsSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(listCompanySelectOptionsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(
      listCompanySelectOptionsSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Requests — input schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// listCompanyRequestsSchema (input, all optional)
// ---------------------------------------------------------------------------
describe("listCompanyRequestsSchema", () => {
  it("accepts valid params", () => {
    expect(
      listCompanyRequestsSchema.safeParse({
        company_id: 1,
        page: 2,
        limit: 50,
      }).success,
    ).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    expect(listCompanyRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ limit: 200 }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ company_id: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyRequestDetailSchema (input)
// ---------------------------------------------------------------------------
describe("getCompanyRequestDetailSchema", () => {
  it("accepts a valid request UUID", () => {
    expect(
      getCompanyRequestDetailSchema.safeParse({ uuid: "req-uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getCompanyRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      getCompanyRequestDetailSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(
      getCompanyRequestDetailSchema.safeParse({ uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusSchema (input with enum)
// ---------------------------------------------------------------------------
describe("updateRequestStatusSchema", () => {
  const valid = { uuid: "req-uuid-123", status: "pending" };

  it("accepts all valid status values", () => {
    for (const status of [
      "pending",
      "started",
      "delivered",
      "cancelled",
      "finished_by_recruitment",
      "re_work",
    ]) {
      expect(
        updateRequestStatusSchema.safeParse({ ...valid, status }).success,
      ).toBe(true);
    }
  });

  it("accepts optional feedback", () => {
    expect(
      updateRequestStatusSchema.safeParse({
        ...valid,
        feedback: "Some feedback",
      }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = valid;
    expect(updateRequestStatusSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid;
    expect(updateRequestStatusSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(
      updateRequestStatusSchema.safeParse({ ...valid, status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects feedback exceeding 255 chars", () => {
    expect(
      updateRequestStatusSchema.safeParse({
        ...valid,
        feedback: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      updateRequestStatusSchema.safeParse({ ...valid, uuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteRequestSchema (input)
// ---------------------------------------------------------------------------
describe("deleteRequestSchema", () => {
  it("accepts a valid request UUID", () => {
    expect(
      deleteRequestSchema.safeParse({ uuid: "req-uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(deleteRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(deleteRequestSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(deleteRequestSchema.safeParse({ uuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanyRequestSchema (input)
// ---------------------------------------------------------------------------
describe("createCompanyRequestSchema", () => {
  const valid = {
    company_id: 1,
    position_title: "Software Engineer",
  };

  it("accepts valid input with only required fields", () => {
    expect(createCompanyRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts input with all optional fields", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        ...valid,
        compensation: "3000 KWD",
        number_of_employees: 5,
        location: "Kuwait City",
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(createCompanyRequestSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing position_title", () => {
    const { position_title: _, ...rest } = valid;
    expect(createCompanyRequestSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty position_title", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, position_title: "" }).success,
    ).toBe(false);
  });

  it("rejects position_title exceeding 255 chars", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        ...valid,
        position_title: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, company_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects number_of_employees less than 1", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, number_of_employees: 0 }).success,
    ).toBe(false);
  });

  it("rejects number_of_employees more than 1000", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, number_of_employees: 1001 }).success,
    ).toBe(false);
  });

  it("rejects compensation exceeding 255 chars", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        ...valid,
        compensation: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects location exceeding 255 chars", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        ...valid,
        location: "x".repeat(256),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyListSchema (input)
// ---------------------------------------------------------------------------
describe("getCompanyListSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      getCompanyListSchema.safeParse({ contactUuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(getCompanyListSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(
      getCompanyListSchema.safeParse({ contactUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for contactUuid", () => {
    expect(
      getCompanyListSchema.safeParse({ contactUuid: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Notes — output schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// companyNoteListItemSchema
// ---------------------------------------------------------------------------
describe("companyNoteListItemSchema", () => {
  const valid = {
    note_uuid: "uuid-123",
    note_text: "Some note text",
    note_type: "Internal Note",
    company_id: 42,
    created_by: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    company_name: "Acme Corp",
  };

  it("accepts a valid note list item", () => {
    expect(companyNoteListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      companyNoteListItemSchema.safeParse({
        ...valid,
        note_text: null,
        note_type: null,
        company_id: null,
        created_by: null,
        created_at: null,
        updated_at: null,
        company_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing note_uuid", () => {
    const { note_uuid: _, ...rest } = valid;
    expect(companyNoteListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for note_uuid (number)", () => {
    expect(
      companyNoteListItemSchema.safeParse({ ...valid, note_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyNotesResultSchema
// ---------------------------------------------------------------------------
describe("listCompanyNotesResultSchema", () => {
  const valid = {
    notes: [
      {
        note_uuid: "uuid-1",
        note_text: "Note 1",
        note_type: "Internal",
        company_id: 42,
        created_by: 1,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
        company_name: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCompanyNotesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty notes array", () => {
    expect(
      listCompanyNotesResultSchema.safeParse({ ...valid, notes: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listCompanyNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = valid;
    expect(listCompanyNotesResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyNoteDetailSchema (nullable)
// ---------------------------------------------------------------------------
describe("companyNoteDetailSchema", () => {
  const valid = {
    note_uuid: "uuid-123",
    company_id: 42,
    note_text: "Some note text",
    note_type: "Internal Note",
    created_by: 1,
    updated_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    company_name: "Acme Corp",
  };

  it("accepts a valid note detail", () => {
    expect(companyNoteDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null", () => {
    expect(companyNoteDetailSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing note_uuid", () => {
    const { note_uuid: _, ...rest } = valid;
    expect(companyNoteDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for note_uuid (number)", () => {
    expect(
      companyNoteDetailSchema.safeParse({ ...valid, note_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyNoteActionResultSchema (union)
// ---------------------------------------------------------------------------
describe("companyNoteActionResultSchema", () => {
  it("accepts { note_uuid: string }", () => {
    expect(
      companyNoteActionResultSchema.safeParse({ note_uuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("accepts { success: true }", () => {
    expect(
      companyNoteActionResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts { success: false }", () => {
    expect(
      companyNoteActionResultSchema.safeParse({ success: false }).success,
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(companyNoteActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for note_uuid (number)", () => {
    expect(
      companyNoteActionResultSchema.safeParse({ note_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ===========================================================================
// Company Requests — output schemas
// ===========================================================================

// ---------------------------------------------------------------------------
// companyRequestActionResultSchema (union)
// ---------------------------------------------------------------------------
describe("companyRequestActionResultSchema", () => {
  it("accepts success: true", () => {
    expect(
      companyRequestActionResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error string", () => {
    expect(
      companyRequestActionResultSchema.safeParse({ error: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(companyRequestActionResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success (string)", () => {
    expect(
      companyRequestActionResultSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error (number)", () => {
    expect(
      companyRequestActionResultSchema.safeParse({ error: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyRequestListItemSchema
// ---------------------------------------------------------------------------
describe("companyRequestListItemSchema", () => {
  const valid = {
    request_uuid: "uuid-123",
    company_id: 42,
    request_position_title: "Software Engineer",
    request_compensation: "500 KWD",
    request_number_of_employees: 3,
    request_location: "Kuwait City",
    request_status: "pending",
    request_created_datetime: new Date("2026-01-01"),
    request_updated_datetime: new Date("2026-01-02"),
    company_name: "Acme Corp",
  };

  it("accepts a valid request list item", () => {
    expect(companyRequestListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      companyRequestListItemSchema.safeParse({
        ...valid,
        company_id: null,
        request_position_title: null,
        request_compensation: null,
        request_number_of_employees: null,
        request_location: null,
        request_status: null,
        company_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(companyRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for request_created_datetime (string)", () => {
    expect(
      companyRequestListItemSchema.safeParse({
        ...valid,
        request_created_datetime: "not-a-date",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyRequestsResultSchema
// ---------------------------------------------------------------------------
describe("listCompanyRequestsResultSchema", () => {
  const valid = {
    requests: [
      {
        request_uuid: "uuid-1",
        company_id: 42,
        request_position_title: "Engineer",
        request_compensation: "500 KWD",
        request_number_of_employees: 3,
        request_location: "Kuwait City",
        request_status: "pending",
        request_created_datetime: new Date("2026-01-01"),
        request_updated_datetime: new Date("2026-01-02"),
        company_name: "Acme Corp",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCompanyRequestsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      listCompanyRequestsResultSchema.safeParse({
        ...valid,
        requests: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = valid;
    expect(listCompanyRequestsResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyRequestDetailSchema (nullable)
// ---------------------------------------------------------------------------
describe("companyRequestDetailSchema", () => {
  const valid = {
    request_uuid: "uuid-123",
    company_id: 42,
    contact_uuid: "contact-uuid",
    staff_id: 1,
    request_position_title: "Engineer",
    request_job_description: "Full stack developer",
    request_compensation: "500 KWD",
    request_number_of_employees: 3,
    request_location: "Kuwait City",
    request_additional_info: null,
    request_status: "pending",
    request_feedback: null,
    request_created_datetime: new Date("2026-01-01"),
    request_updated_datetime: new Date("2026-01-02"),
    company_name: "Acme Corp",
  };

  it("accepts a valid request detail", () => {
    expect(companyRequestDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts null", () => {
    expect(companyRequestDetailSchema.safeParse(null).success).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(companyRequestDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for request_job_description (number)", () => {
    expect(
      companyRequestDetailSchema.safeParse({
        ...valid,
        request_job_description: 123,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyRequestCreateResultSchema
// ---------------------------------------------------------------------------
describe("companyRequestCreateResultSchema", () => {
  it("accepts a valid create result", () => {
    expect(
      companyRequestCreateResultSchema.safeParse({ request_uuid: "uuid-123" }).success,
    ).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    expect(companyRequestCreateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for request_uuid (number)", () => {
    expect(
      companyRequestCreateResultSchema.safeParse({ request_uuid: 123 }).success,
    ).toBe(false);
  });
});
