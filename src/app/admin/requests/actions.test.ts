import { describe, it, expect } from "vitest";
import {
  listRequestsSchema,
  getRequestSchema,
  updateRequestStatusSchema,
  approveRequestSchema,
  rejectRequestSchema,
  closeRequestSchema,
  listRequestsOutputSchema,
  getRequestOutputSchema,
  updateRequestStatusOutputSchema,
  approveRequestOutputSchema,
  rejectRequestOutputSchema,
  closeRequestOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listRequestsSchema.safeParse({
      page: 2,
      limit: 10,
      companyId: 5,
      status: "started",
      q: "developer",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe("started");
      expect(r.data.q).toBe("developer");
    }
  });

  it("rejects limit over 100", () => {
    expect(listRequestsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects invalid status enum value", () => {
    const r = listRequestsSchema.safeParse({ status: "invalid_status" });
    expect(r.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    const valid = ["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"];
    for (const s of valid) {
      expect(listRequestsSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("coerces string page/limit to numbers", () => {
    const r = listRequestsSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });
});

describe("getRequestSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getRequestSchema.safeParse({
      requestUuid: "req_12345678-90ab-cdef-1234-567890abcdef",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getRequestSchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateRequestStatusSchema", () => {
  it("accepts valid UUID and status", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req_uuid_12345",
      status: "delivered",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("delivered");
    }
  });

  it("accepts optional feedback with delivered", () => {
    const r = updateRequestStatusSchema.safeParse({
      requestUuid: "req_uuid_12345",
      status: "delivered",
      feedback: "Candidate accepted terms",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.feedback).toBe("Candidate accepted terms");
    }
  });

  it("rejects missing UUID", () => {
    expect(updateRequestStatusSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateRequestStatusSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects invalid status value", () => {
    expect(
      updateRequestStatusSchema.safeParse({
        requestUuid: "abc",
        status: "completed",
      }).success,
    ).toBe(false);
  });

  it("rejects feedback over 255 chars", () => {
    const longFeedback = "x".repeat(256);
    expect(
      updateRequestStatusSchema.safeParse({
        requestUuid: "abc",
        status: "delivered",
        feedback: longFeedback,
      }).success,
    ).toBe(false);
  });

  it("accepts all valid status values", () => {
    const valid = ["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"];
    for (const s of valid) {
      expect(
        updateRequestStatusSchema.safeParse({ requestUuid: "abc", status: s })
          .success,
      ).toBe(true);
    }
  });
});

describe("approveRequestSchema", () => {
  it("accepts valid UUID and reason", () => {
    const r = approveRequestSchema.safeParse({
      requestUuid: "req_uuid_12345",
      reason: "Request approved by management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Request approved by management");
    }
  });

  it("rejects missing UUID", () => {
    expect(approveRequestSchema.safeParse({ reason: "Approved" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(approveRequestSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc", reason: "" }).success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(
      approveRequestSchema.safeParse({ requestUuid: "abc", reason: longReason }).success,
    ).toBe(false);
  });
});

describe("rejectRequestSchema", () => {
  it("accepts valid UUID and reason", () => {
    const r = rejectRequestSchema.safeParse({
      requestUuid: "req_uuid_12345",
      reason: "Request rejected due to budget constraints",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Request rejected due to budget constraints");
    }
  });

  it("rejects missing UUID", () => {
    expect(rejectRequestSchema.safeParse({ reason: "Rejected" }).success).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(rejectRequestSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc", reason: "" }).success,
    ).toBe(false);
  });

  it("rejects reason over 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(
      rejectRequestSchema.safeParse({ requestUuid: "abc", reason: longReason }).success,
    ).toBe(false);
  });
});

describe("closeRequestSchema", () => {
  it("accepts valid UUID and resolution", () => {
    const r = closeRequestSchema.safeParse({
      requestUuid: "req_uuid_12345",
      resolution: "Position filled successfully",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.resolution).toBe("Position filled successfully");
    }
  });

  it("rejects missing UUID", () => {
    expect(closeRequestSchema.safeParse({ resolution: "Filled" }).success).toBe(false);
  });

  it("rejects missing resolution", () => {
    expect(closeRequestSchema.safeParse({ requestUuid: "abc" }).success).toBe(false);
  });

  it("rejects empty resolution", () => {
    expect(
      closeRequestSchema.safeParse({ requestUuid: "abc", resolution: "" }).success,
    ).toBe(false);
  });

  it("rejects resolution over 500 chars", () => {
    const longResolution = "x".repeat(501);
    expect(
      closeRequestSchema.safeParse({ requestUuid: "abc", resolution: longResolution }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("listRequestsOutputSchema", () => {
  it("validates a valid paginated response", () => {
    const r = listRequestsOutputSchema.safeParse({
      items: [
        {
          request_uuid: "req_uuid_1",
          title: "Developer needed",
          company_name: "ACME Corp",
          staff_name: null,
          position_type: "full_time",
          no_of_employees: 2,
          status: "pending",
          priority: 1,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listRequestsOutputSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing items field", () => {
    const r = listRequestsOutputSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates empty items array", () => {
    const r = listRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

describe("getRequestOutputSchema", () => {
  it("validates a full request detail", () => {
    const r = getRequestOutputSchema.safeParse({
      request: {
        request_uuid: "req_uuid_1",
        request_position_title: "Developer",
        request_job_description: "Full stack dev",
        request_compensation: "1500 KWD",
        request_status: "pending",
        request_feedback: null,
        request_priority: 1,
        request_started_at: null,
        request_finished_at: null,
        request_created_datetime: "2024-01-01T00:00:00.000Z",
        request_updated_datetime: null,
        company: { company_name: "ACME", company_email: "acme@test.com" },
        staff: null,
      },
      applications: [
        {
          application_uuid: "app_uuid_1",
          candidate_name: "John Doe",
          status: 1,
          created_at: "2024-01-02T00:00:00.000Z",
        },
      ],
      invitations: [],
      interviews: [],
      metrics: [
        { label: "Applications", value: 1, note: "Candidates applied" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("validates null request for not-found", () => {
    const r = getRequestOutputSchema.safeParse({
      request: null,
      applications: [],
      invitations: [],
      interviews: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing request field", () => {
    const r = getRequestOutputSchema.safeParse({
      applications: [],
      invitations: [],
      interviews: [],
      metrics: [],
    });
    expect(r.success).toBe(false);
  });
});

describe("updateRequestStatusOutputSchema", () => {
  it("validates a success response", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Request updated",
    });
    expect(r.success).toBe(true);
  });

  it("validates an error response", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation value", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "success",
    });
    expect(r.success).toBe(false);
  });
});

describe("approveRequestOutputSchema", () => {
  it("validates a success response", () => {
    const r = approveRequestOutputSchema.safeParse({
      operation: "success",
      message: "Request approved",
    });
    expect(r.success).toBe(true);
  });

  it("validates an error response", () => {
    const r = approveRequestOutputSchema.safeParse({
      operation: "error",
      message: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    const r = approveRequestOutputSchema.safeParse({
      operation: "unknown",
      message: "test",
    });
    expect(r.success).toBe(false);
  });
});

describe("rejectRequestOutputSchema", () => {
  it("validates a success response", () => {
    const r = rejectRequestOutputSchema.safeParse({
      operation: "success",
      message: "Request rejected",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const r = rejectRequestOutputSchema.safeParse({ message: "test" });
    expect(r.success).toBe(false);
  });
});

describe("closeRequestOutputSchema", () => {
  it("validates a success response", () => {
    const r = closeRequestOutputSchema.safeParse({
      operation: "success",
      message: "Request closed",
    });
    expect(r.success).toBe(true);
  });

  it("validates an error response", () => {
    const r = closeRequestOutputSchema.safeParse({
      operation: "error",
      message: "Already closed",
    });
    expect(r.success).toBe(true);
  });
});
