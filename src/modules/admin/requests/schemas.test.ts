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
// listRequestsOutputSchema
// ---------------------------------------------------------------------------
describe("listRequestsOutputSchema", () => {
  const validRow = {
    request_uuid: "req-001",
    title: "Need a Senior Developer",
    company_name: "Acme Corp",
    staff_name: "John Doe",
    position_type: "fulltime",
    no_of_employees: 3,
    status: "pending",
    priority: 1,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
  };

  const validOutput = {
    items: [validRow],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list output", () => {
    expect(listRequestsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts nullable fields on items", () => {
    expect(
      listRequestsOutputSchema.safeParse({
        ...validOutput,
        items: [
          {
            request_uuid: "req-002",
            title: "Junior Designer",
            company_name: null,
            staff_name: null,
            position_type: "hourly",
            no_of_employees: null,
            status: "started",
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
      listRequestsOutputSchema.safeParse({ ...validOutput, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validOutput;
    expect(listRequestsOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title in item", () => {
    const { title: _, ...badRow } = validRow;
    expect(
      listRequestsOutputSchema.safeParse({ ...validOutput, items: [badRow] }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listRequestsOutputSchema.safeParse({ ...validOutput, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listRequestsOutputSchema.safeParse({ ...validOutput, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for no_of_employees", () => {
    expect(
      listRequestsOutputSchema.safeParse({
        ...validOutput,
        items: [{ ...validRow, no_of_employees: "three" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRequestOutputSchema
// ---------------------------------------------------------------------------
describe("getRequestOutputSchema", () => {
  const validOutput = {
    request: {
      request_uuid: "req-001",
      request_position_title: "Senior Developer",
      request_job_description: "Looking for an experienced developer",
      request_compensation: "$120k-$150k",
      request_status: "pending",
      request_feedback: null,
      request_priority: 1,
      request_started_at: null,
      request_finished_at: null,
      request_created_datetime: "2025-01-15T10:00:00Z",
      request_updated_datetime: "2025-01-15T10:00:00Z",
      company: {
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
      },
      staff: {
        staff_name: "John Doe",
        staff_email: "john@acme.com",
      },
    },
    applications: [
      {
        application_uuid: "app-001",
        candidate_name: "Jane Smith",
        status: 1,
        created_at: "2025-01-16T10:00:00Z",
      },
    ],
    invitations: [
      {
        invitation_uuid: "inv-001",
        candidate_name: "Bob Johnson",
        status: 1,
        created_at: "2025-01-17T10:00:00Z",
      },
    ],
    interviews: [
      {
        request_interview_uuid: "int-001",
        candidate_name: "Alice Brown",
        interview_at: "2025-01-20T14:00:00Z",
        status: 1,
      },
    ],
    metrics: [
      { label: "Applications", value: 5, note: "Total received" },
    ],
  };

  it("accepts a valid get request output", () => {
    expect(getRequestOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts null request", () => {
    expect(
      getRequestOutputSchema.safeParse({ ...validOutput, request: null }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      getRequestOutputSchema.safeParse({
        ...validOutput,
        applications: [],
        invitations: [],
        interviews: [],
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("accepts null nested objects on request", () => {
    expect(
      getRequestOutputSchema.safeParse({
        ...validOutput,
        request: { ...validOutput.request, company: null, staff: null },
      }).success,
    ).toBe(true);
  });

  it("rejects missing request_uuid in request", () => {
    const { request_uuid: _, ...badRequest } = validOutput.request;
    expect(
      getRequestOutputSchema.safeParse({ ...validOutput, request: badRequest }).success,
    ).toBe(false);
  });

  it("rejects missing applications", () => {
    const { applications: _, ...rest } = validOutput;
    expect(getRequestOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid metric value type", () => {
    expect(
      getRequestOutputSchema.safeParse({
        ...validOutput,
        metrics: [{ label: "Bad", value: true, note: "wrong" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestActionResponseSchema (shared by update/approve/reject/close)
// ---------------------------------------------------------------------------
describe("updateRequestStatusOutputSchema", () => {
  it("accepts a success response", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ operation: "success", message: "Request updated" }).success).toBe(true);
  });

  it("accepts an error response", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ operation: "error", message: "Something went wrong" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ message: "No operation" }).success).toBe(false);
  });

  it("rejects invalid operation value", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "Bad" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});

describe("approveRequestOutputSchema", () => {
  it("accepts a valid response", () => {
    expect(approveRequestOutputSchema.safeParse({ operation: "success", message: "Approved" }).success).toBe(true);
    expect(approveRequestOutputSchema.safeParse({ operation: "error", message: "Cannot approve" }).success).toBe(true);
  });
});

describe("rejectRequestOutputSchema", () => {
  it("accepts a valid response", () => {
    expect(rejectRequestOutputSchema.safeParse({ operation: "success", message: "Rejected" }).success).toBe(true);
  });
});

describe("closeRequestOutputSchema", () => {
  it("accepts a valid response", () => {
    expect(closeRequestOutputSchema.safeParse({ operation: "success", message: "Closed" }).success).toBe(true);
  });
});
