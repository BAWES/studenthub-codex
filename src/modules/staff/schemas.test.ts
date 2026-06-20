import { describe, it, expect } from "vitest";
import {
  staffListItemSchema,
  listStaffResultSchema,
  staffListResultSchema,
  staffGetResultSchema,
  getStaffWorkspaceSchema,
  staffMetricSchema,
  staffWorkspaceListItemSchema,
  staffObjectOutputSchema,
  staffWorkspaceOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// staffListItemSchema
// ---------------------------------------------------------------------------
describe("staffListItemSchema", () => {
  const valid = {
    staff_id: 1,
    staff_name: "Alice Smith",
    staff_job_title: "Senior Recruiter",
    staff_email: "alice@studenthub.com",
    staff_role: true,
    staff_status: 1,
    staff_created_at: new Date("2026-01-15"),
  };

  it("accepts valid staff list item", () => {
    expect(staffListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      staffListItemSchema.safeParse({
        ...valid,
        staff_job_title: null,
        staff_role: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing staff_id", () => {
    const { staff_id: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing staff_name", () => {
    const { staff_name: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing staff_email", () => {
    const { staff_email: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing staff_status", () => {
    const { staff_status: _, ...rest } = valid;
    expect(staffListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer staff_id", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, staff_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects negative staff_id", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, staff_id: -1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for staff_role", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, staff_role: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for staff_created_at", () => {
    expect(
      staffListItemSchema.safeParse({ ...valid, staff_created_at: "2026-01-15" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStaffResultSchema
// ---------------------------------------------------------------------------
describe("listStaffResultSchema", () => {
  const valid = {
    staff: [
      {
        staff_id: 1,
        staff_name: "Alice Smith",
        staff_job_title: null,
        staff_email: "alice@studenthub.com",
        staff_role: true,
        staff_status: 1,
        staff_created_at: new Date("2026-01-15"),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listStaffResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty staff array", () => {
    expect(
      listStaffResultSchema.safeParse({ ...valid, staff: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listStaffResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listStaffResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    expect(listStaffResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listStaffResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listStaffResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(
      listStaffResultSchema.safeParse({ ...valid, limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-array staff", () => {
    expect(
      listStaffResultSchema.safeParse({ ...valid, staff: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects invalid staff item in array", () => {
    expect(
      listStaffResultSchema.safeParse({
        ...valid,
        staff: [{ staff_id: "not-a-number" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffListResultSchema (alias)
// ---------------------------------------------------------------------------
describe("staffListResultSchema", () => {
  it("is an alias for listStaffResultSchema", () => {
    expect(staffListResultSchema).toBe(listStaffResultSchema);
  });
});

// ---------------------------------------------------------------------------
// staffGetResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("staffGetResultSchema", () => {
  it("accepts null", () => {
    expect(staffGetResultSchema.safeParse(null).success).toBe(true);
  });

  it("accepts valid staff item", () => {
    expect(
      staffGetResultSchema.safeParse({
        staff_id: 5,
        staff_name: "Bob",
        staff_job_title: null,
        staff_email: "bob@studenthub.com",
        staff_role: null,
        staff_status: 1,
        staff_created_at: new Date("2026-02-01"),
      }).success,
    ).toBe(true);
  });

  it("rejects invalid staff item", () => {
    expect(
      staffGetResultSchema.safeParse({ staff_id: "invalid" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStaffWorkspaceSchema (input)
// ---------------------------------------------------------------------------
describe("getStaffWorkspaceSchema", () => {
  it("accepts valid staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({ staffId: 42 }).success).toBe(true);
  });

  it("rejects missing staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({ staffId: 0 }).success).toBe(false);
  });

  it("rejects negative staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({ staffId: -1 }).success).toBe(false);
  });

  it("rejects float staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({ staffId: 1.5 }).success).toBe(false);
  });

  it("rejects string staffId", () => {
    expect(getStaffWorkspaceSchema.safeParse({ staffId: "42" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffMetricSchema
// ---------------------------------------------------------------------------
describe("staffMetricSchema", () => {
  const valid = { label: "Active Contracts", value: 15, note: "This month" };

  it("accepts valid metric", () => {
    expect(staffMetricSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty label", () => {
    expect(staffMetricSchema.safeParse({ ...valid, label: "" }).success).toBe(false);
  });

  it("rejects negative value", () => {
    expect(staffMetricSchema.safeParse({ ...valid, value: -1 }).success).toBe(false);
  });

  it("rejects non-integer value", () => {
    expect(staffMetricSchema.safeParse({ ...valid, value: 1.5 }).success).toBe(false);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = valid;
    expect(staffMetricSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffWorkspaceListItemSchema
// ---------------------------------------------------------------------------
describe("staffWorkspaceListItemSchema", () => {
  const valid = {
    id: "req-123",
    title: "Contract Renewal",
    subtitle: "Awaiting approval",
  };

  it("accepts valid list item", () => {
    expect(staffWorkspaceListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts numeric id", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({ ...valid, id: 42 }).success,
    ).toBe(true);
  });

  it("accepts optional fields", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({
        ...valid,
        meta: "High priority",
        href: "/contracts/123",
      }).success,
    ).toBe(true);
  });

  it("rejects empty title", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({ ...valid, title: "" }).success,
    ).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = valid;
    expect(staffWorkspaceListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffObjectOutputSchema
// ---------------------------------------------------------------------------
describe("staffObjectOutputSchema", () => {
  const valid = {
    staff_name: "Alice Smith",
    staff_email: "alice@studenthub.com",
    staff_job_title: "Senior Recruiter",
    staff_salary: 2500,
    staff_salary_currency: "KWD",
  };

  it("accepts valid staff object", () => {
    expect(staffObjectOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      staffObjectOutputSchema.safeParse({
        ...valid,
        staff_job_title: null,
        staff_salary: null,
        staff_salary_currency: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing staff_name", () => {
    const { staff_name: _, ...rest } = valid;
    expect(staffObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing staff_email", () => {
    const { staff_email: _, ...rest } = valid;
    expect(staffObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for staff_salary", () => {
    expect(
      staffObjectOutputSchema.safeParse({ ...valid, staff_salary: "high" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffWorkspaceOutputSchema
// ---------------------------------------------------------------------------
describe("staffWorkspaceOutputSchema", () => {
  const valid = {
    staff: {
      staff_name: "Alice Smith",
      staff_email: "alice@studenthub.com",
      staff_job_title: null,
      staff_salary: 2500,
      staff_salary_currency: "KWD",
    },
    metrics: [
      { label: "Active Contracts", value: 15, note: "This month" },
      { label: "Pending Requests", value: 3, note: "" },
      { label: "Open Stories", value: 7, note: "" },
      { label: "Completed", value: 42, note: "Total" },
    ],
    requests: [
      { id: "req-1", title: "Leave Request", subtitle: "Pending" },
    ],
    stories: [
      { id: "story-1", title: "Onboarding", subtitle: "In progress" },
    ],
  };

  it("accepts valid workspace output", () => {
    expect(staffWorkspaceOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable staff", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({ ...valid, staff: null }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...valid,
        requests: [],
        stories: [],
      }).success,
    ).toBe(true);
  });

  it("rejects wrong metrics length", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...valid,
        metrics: [
          { label: "Active", value: 15, note: "" },
          { label: "Pending", value: 3, note: "" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects missing staff", () => {
    const { staff: _, ...rest } = valid;
    expect(staffWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = valid;
    expect(staffWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });
});
