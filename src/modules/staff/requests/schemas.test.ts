import { describe, it, expect } from "vitest";
import {
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStaffRequestsSchema
// ---------------------------------------------------------------------------
describe("listStaffRequestsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listStaffRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts with filters", () => {
    const r = listStaffRequestsSchema.safeParse({
      page: 2,
      limit: 10,
      status: "pending",
      q: "engineering",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("pending");
      expect(r.data.q).toBe("engineering");
    }
  });

  it("rejects invalid status", () => {
    expect(
      listStaffRequestsSchema.safeParse({ status: "invalid" }).success
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listStaffRequestsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listStaffRequestsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStaffRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getStaffRequestDetailSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: "abc-123" }).success
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getStaffRequestDetailSchema.safeParse({ requestUuid: "" }).success
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getStaffRequestDetailSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusSchema
// ---------------------------------------------------------------------------
describe("updateRequestStatusSchema", () => {
  const valid = {
    requestUuid: "abc-123",
    status: "delivered" as const,
  };

  it("accepts valid update", () => {
    expect(updateRequestStatusSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts with feedback", () => {
    const r = updateRequestStatusSchema.safeParse({
      ...valid,
      feedback: "Great work",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.feedback).toBe("Great work");
    }
  });

  it("accepts all valid statuses", () => {
    for (const s of ["pending", "started", "delivered"]) {
      expect(
        updateRequestStatusSchema.safeParse({
          requestUuid: "abc-123",
          status: s,
        }).success
      ).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(
      updateRequestStatusSchema.safeParse({
        requestUuid: "abc-123",
        status: "invalid",
      }).success
    ).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(
      updateRequestStatusSchema.safeParse({ status: "delivered" }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestRowOutputSchema
// ---------------------------------------------------------------------------
describe("staffRequestRowOutputSchema", () => {
  const valid = {
    id: "req-123",
    title: "Software Engineer",
    company: "Acme Corp",
    seats: 3,
    status: "pending",
    updated: "2026-01-15T00:00:00Z",
  };

  it("accepts valid row", () => {
    expect(staffRequestRowOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestListOutputSchema
// ---------------------------------------------------------------------------
describe("staffRequestListOutputSchema", () => {
  const valid = {
    items: [
      {
        id: "req-123",
        title: "Software Engineer",
        company: "Acme Corp",
        seats: 3,
        status: "pending",
        updated: "2026-01-15T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(staffRequestListOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = staffRequestListOutputSchema.safeParse({
      ...valid,
      items: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// requestCandidateOutputSchema
// ---------------------------------------------------------------------------
describe("requestCandidateOutputSchema", () => {
  const valid = {
    uuid: "cand-123",
    name: "John Doe",
    email: "john@example.com",
    applicationStatus: 1,
    appliedAt: new Date("2026-01-10"),
  };

  it("accepts valid candidate", () => {
    expect(requestCandidateOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = requestCandidateOutputSchema.safeParse({
      ...valid,
      name: null,
      email: null,
      applicationStatus: null,
      appliedAt: null,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// staffRequestDetailOutputSchema
// ---------------------------------------------------------------------------
describe("staffRequestDetailOutputSchema", () => {
  const valid = {
    requestUuid: "req-123",
    positionTitle: "Software Engineer",
    jobDescription: "Full stack developer needed",
    compensation: "2000 KWD/month",
    seats: 2,
    location: "Kuwait City",
    status: "pending",
    priority: 1,
    assignedAt: new Date("2026-01-01"),
    startedAt: null,
    finishedAt: null,
    updatedAt: new Date("2026-01-15"),
    createdAt: new Date("2026-01-01"),
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "acme@example.com",
    },
    contact: {
      contact_name: "Alice",
      contact_email: "alice@example.com",
    },
    staff: {
      staff_name: "Bob",
      staff_email: "bob@example.com",
    },
    candidates: [
      {
        uuid: "cand-123",
        name: "John Doe",
        email: "john@example.com",
        applicationStatus: 1,
        appliedAt: new Date("2026-01-10"),
      },
    ],
  };

  it("accepts valid detail", () => {
    expect(staffRequestDetailOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable nested relations", () => {
    const r = staffRequestDetailOutputSchema.safeParse({
      ...valid,
      company: null,
      contact: null,
      staff: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty candidates", () => {
    const r = staffRequestDetailOutputSchema.safeParse({
      ...valid,
      candidates: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required requestUuid", () => {
    const { requestUuid: _, ...rest } = valid;
    expect(staffRequestDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateRequestStatusOutputSchema", () => {
  it("accepts success", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Status updated",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error", () => {
    const r = updateRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Request not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success
    ).toBe(false);
  });
});