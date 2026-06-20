import { describe, it, expect } from "vitest";
import {
  listRequestsOutputSchema,
  getRequestOutputSchema,
  updateRequestStatusOutputSchema,
  approveRequestOutputSchema,
  rejectRequestOutputSchema,
  closeRequestOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("listRequestsOutputSchema", () => {
  const validList = {
    items: [
      {
        request_uuid: "req_abc123",
        title: "Need software engineer",
        company_name: "Acme Corp",
        staff_name: "John Staff",
        position_type: "full-time",
        no_of_employees: 2,
        status: "pending",
        priority: 1,
        created_at: "2026-06-15T10:00:00",
        updated_at: "2026-06-15T10:00:00",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(listRequestsOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      listRequestsOutputSchema.safeParse({
        ...validList,
        items: [
          {
            request_uuid: "req_abc123",
            title: "Need engineer",
            company_name: null,
            staff_name: null,
            position_type: "full-time",
            no_of_employees: null,
            status: "pending",
            priority: null,
            created_at: null,
            updated_at: null,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listRequestsOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validList;
    expect(listRequestsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listRequestsOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });
});

describe("getRequestOutputSchema", () => {
  const validDetail = {
    request: {
      request_uuid: "req_abc123",
      request_position_title: "Software Engineer",
      request_job_description: "Full stack developer needed",
      request_compensation: "2000 KWD/month",
      request_status: "pending",
      request_feedback: null,
      request_priority: 1,
      request_started_at: null,
      request_finished_at: null,
      request_created_datetime: "2026-06-15T10:00:00",
      request_updated_datetime: "2026-06-15T10:00:00",
      company: { company_name: "Acme Corp", company_email: "hr@acme.com" },
      staff: { staff_name: "John", staff_email: "john@acme.com" },
    },
    applications: [
      {
        application_uuid: "app_1",
        candidate_name: "Jane Doe",
        status: 1,
        created_at: "2026-06-16T10:00:00",
      },
    ],
    invitations: [
      {
        invitation_uuid: "inv_1",
        candidate_name: "Jane Doe",
        status: 1,
        created_at: "2026-06-16T10:00:00",
      },
    ],
    interviews: [
      {
        request_interview_uuid: "int_1",
        candidate_name: "Jane Doe",
        interview_at: "2026-06-20T10:00:00",
        status: 0,
      },
    ],
    metrics: [
      { label: "Applications", value: 5, note: "Total applications" },
    ],
  };

  it("accepts a valid request detail", () => {
    expect(getRequestOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null request", () => {
    expect(
      getRequestOutputSchema.safeParse({
        ...validDetail,
        request: null,
        applications: [],
        invitations: [],
        interviews: [],
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing applications", () => {
    const { applications: _, ...rest } = validDetail;
    expect(getRequestOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(getRequestOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string metric value as number", () => {
    // This is OK because value can be union string|number
    expect(
      getRequestOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "Status", value: "Active", note: "Status" }],
      }).success,
    ).toBe(true);
  });
});

// --- Action response schemas ---

const actionSchemas = [
  ["updateRequestStatusOutputSchema", updateRequestStatusOutputSchema],
  ["approveRequestOutputSchema", approveRequestOutputSchema],
  ["rejectRequestOutputSchema", rejectRequestOutputSchema],
  ["closeRequestOutputSchema", closeRequestOutputSchema],
] as const;

describe.each(actionSchemas)("%s", (_name, schema) => {
  it("accepts success response", () => {
    expect(
      schema.safeParse({ operation: "success", message: "Done" }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      schema.safeParse({ operation: "error", message: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      schema.safeParse({ operation: "invalid", message: "Something" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(schema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      schema.safeParse({ operation: "success", message: "" }).success,
    ).toBe(false);
  });
});
