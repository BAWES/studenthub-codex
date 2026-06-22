import { describe, it, expect } from "vitest";
import {
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// staffRequestRowOutputSchema
// ---------------------------------------------------------------------------
const validRequestRow = {
  id: "req-001",
  title: "Senior Developer",
  company: "Acme Corp",
  seats: 2,
  status: "pending",
  updated: "2025-06-01T10:00:00Z",
};

describe("staffRequestRowOutputSchema", () => {
  it("accepts a fully populated request row", () => {
    expect(staffRequestRowOutputSchema.safeParse(validRequestRow).success).toBe(true);
  });

  it("rejects when id is missing", () => {
    const { id, ...rest } = validRequestRow;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when title is missing", () => {
    const { title, ...rest } = validRequestRow;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when company is missing", () => {
    const { company, ...rest } = validRequestRow;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when seats is not an integer", () => {
    const data = { ...validRequestRow, seats: 2.5 };
    expect(staffRequestRowOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when seats is a string", () => {
    const data = { ...validRequestRow, seats: "2" };
    expect(staffRequestRowOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when status is missing", () => {
    const { status, ...rest } = validRequestRow;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when updated is missing", () => {
    const { updated, ...rest } = validRequestRow;
    expect(staffRequestRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestListOutputSchema
// ---------------------------------------------------------------------------
describe("staffRequestListOutputSchema", () => {
  it("accepts a valid request list response", () => {
    const data = {
      items: [validRequestRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(staffRequestListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts an empty items array", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(staffRequestListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when items is missing", () => {
    const { items, ...rest } = {
      items: [validRequestRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(staffRequestListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when total is negative", () => {
    const data = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(staffRequestListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when page is zero (must be positive)", () => {
    const data = {
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    expect(staffRequestListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when limit is zero (must be positive)", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    };
    expect(staffRequestListOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestCandidateOutputSchema
// ---------------------------------------------------------------------------
const validCandidate = {
  uuid: "cand-001",
  name: "Alice Smith",
  email: "alice@example.com",
  applicationStatus: 1,
  appliedAt: new Date("2025-05-20T08:00:00Z"),
};

describe("requestCandidateOutputSchema", () => {
  it("accepts a fully populated candidate", () => {
    expect(requestCandidateOutputSchema.safeParse(validCandidate).success).toBe(true);
  });

  it("accepts with all nullable fields set to null", () => {
    const data = {
      ...validCandidate,
      name: null,
      email: null,
      applicationStatus: null,
      appliedAt: null,
    };
    expect(requestCandidateOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when uuid is missing", () => {
    const { uuid, ...rest } = validCandidate;
    expect(requestCandidateOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when applicationStatus is not an integer", () => {
    const data = { ...validCandidate, applicationStatus: 1.5 };
    expect(requestCandidateOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when appliedAt is not a Date", () => {
    const data = { ...validCandidate, appliedAt: "2025-05-20T08:00:00Z" };
    expect(requestCandidateOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffRequestDetailOutputSchema
// ---------------------------------------------------------------------------
const validRequestDetail = {
  requestUuid: "req-001",
  positionTitle: "Senior Developer",
  jobDescription: "We need a senior developer...",
  compensation: "$120k-$150k",
  seats: 2,
  location: "Remote / New York",
  status: "pending",
  priority: 1,
  assignedAt: new Date("2025-05-21T08:00:00Z"),
  startedAt: null,
  finishedAt: null,
  updatedAt: new Date("2025-06-01T10:00:00Z"),
  createdAt: new Date("2025-05-20T08:00:00Z"),
  company: {
    company_id: 1,
    company_name: "Acme Corp",
    company_email: "hr@acme.com",
  },
  contact: {
    contact_name: "Jane Doe",
    contact_email: "jane@acme.com",
  },
  staff: {
    staff_name: "Bob Reviewer",
    staff_email: "bob@example.com",
  },
  candidates: [validCandidate],
};

describe("staffRequestDetailOutputSchema", () => {
  it("accepts a fully populated request detail", () => {
    expect(staffRequestDetailOutputSchema.safeParse(validRequestDetail).success).toBe(true);
  });

  it("accepts with all nullable fields and nested objects set to null", () => {
    const data = {
      ...validRequestDetail,
      positionTitle: null,
      location: null,
      status: null,
      priority: null,
      assignedAt: null,
      startedAt: null,
      finishedAt: null,
      company: null,
      contact: null,
      staff: null,
      candidates: [],
    };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts with nested objects having nullable fields", () => {
    const data = {
      ...validRequestDetail,
      company: { company_id: 1, company_name: null, company_email: null },
      contact: { contact_name: null, contact_email: null },
      staff: { staff_name: null, staff_email: null },
      candidates: [
        { uuid: "cand-001", name: null, email: null, applicationStatus: null, appliedAt: null },
      ],
    };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when requestUuid is missing", () => {
    const { requestUuid, ...rest } = validRequestDetail;
    expect(staffRequestDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when jobDescription is missing", () => {
    const { jobDescription, ...rest } = validRequestDetail;
    expect(staffRequestDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when seats is not an integer", () => {
    const data = { ...validRequestDetail, seats: "2" };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when updatedAt is not a Date", () => {
    const data = { ...validRequestDetail, updatedAt: "2025-06-01T10:00:00Z" };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when createdAt is not a Date", () => {
    const data = { ...validRequestDetail, createdAt: "2025-05-20T08:00:00Z" };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when company has missing required field", () => {
    const { company_id, ...restCompany } = validRequestDetail.company!;
    const data = { ...validRequestDetail, company: restCompany };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when candidates is not an array", () => {
    const data = { ...validRequestDetail, candidates: "not-an-array" };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when a candidate has invalid shape", () => {
    const data = {
      ...validRequestDetail,
      candidates: [{ uuid: 123 }],
    };
    expect(staffRequestDetailOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusOutputSchema
// ---------------------------------------------------------------------------
describe("updateRequestStatusOutputSchema", () => {
  it("accepts a success operation", () => {
    expect(
      updateRequestStatusOutputSchema.safeParse({ operation: "success", message: "Status updated" }).success
    ).toBe(true);
  });

  it("accepts an error operation", () => {
    expect(
      updateRequestStatusOutputSchema.safeParse({ operation: "error", message: "Request not found" }).success
    ).toBe(true);
  });

  it("rejects when operation is missing", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ message: "Status updated" }).success).toBe(false);
  });

  it("rejects when message is missing", () => {
    expect(updateRequestStatusOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects an invalid operation value", () => {
    expect(
      updateRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "test" }).success
    ).toBe(false);
  });

  it("rejects when operation is not a string", () => {
    expect(
      updateRequestStatusOutputSchema.safeParse({ operation: 1, message: "test" }).success
    ).toBe(false);
  });
});
