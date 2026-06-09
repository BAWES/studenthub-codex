import { describe, it, expect } from "vitest";
import {
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listStaffRequestsSchema
// ---------------------------------------------------------------------------

describe("listStaffRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listStaffRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listStaffRequestsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter", () => {
    const result = listStaffRequestsSchema.safeParse({ status: "started" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("started");
    }
  });

  it("rejects invalid status filter", () => {
    const result = listStaffRequestsSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStaffRequestsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffRequestsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts search query", () => {
    const result = listStaffRequestsSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
    }
  });
});

// ---------------------------------------------------------------------------
// getStaffRequestDetailSchema
// ---------------------------------------------------------------------------

describe("getStaffRequestDetailSchema", () => {
  it("accepts a valid request UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({ requestUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusSchema
// ---------------------------------------------------------------------------

describe("updateRequestStatusSchema", () => {
  it("accepts valid update params", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "started",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc-123-def-456");
      expect(result.data.status).toBe("started");
    }
  });

  it("accepts pending status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("accepts delivered status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "delivered",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "cancelled",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateRequestStatusSchema.safeParse({ status: "started" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "",
      status: "started",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional feedback param", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "delivered",
      feedback: "Candidate accepted offer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.feedback).toBe("Candidate accepted offer");
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type StaffRequestRow = {
  id: string;
  title: string;
  company: string;
  seats: number;
  status: string;
  updated: string;
};

type StaffRequestDetail = {
  requestUuid: string;
  positionTitle: string | null;
  jobDescription: string;
  compensation: string;
  seats: number;
  location: string | null;
  status: string | null;
  company: { company_id: number; company_name: string | null } | null;
};

type UpdateRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};

describe("StaffRequestRow shape", () => {
  it("defines the expected fields", () => {
    const mock: StaffRequestRow = {
      id: "req_abc-123",
      title: "Senior Developer",
      company: "Acme Corp",
      seats: 2,
      status: "started",
      updated: "2 hours ago",
    };
    expect(mock.id).toBe("req_abc-123");
    expect(mock.title).toBe("Senior Developer");
    expect(mock.seats).toBe(2);
    expect(mock.status).toBe("started");
  });
});

describe("StaffRequestDetail shape", () => {
  it("accepts a valid detail object", () => {
    const detail: StaffRequestDetail = {
      requestUuid: "req_abc-123",
      positionTitle: "Senior Developer",
      jobDescription: "Looking for a senior developer...",
      compensation: "$100k-$120k",
      seats: 2,
      location: "New York, NY",
      status: "started",
      company: { company_id: 1, company_name: "Acme Corp" },
    };
    expect(detail.positionTitle).toBe("Senior Developer");
    expect(detail.company?.company_name).toBe("Acme Corp");
  });
});

describe("UpdateRequestStatusResult shape", () => {
  it("accepts a success result", () => {
    const result: UpdateRequestStatusResult = {
      operation: "success",
      message: "Request status updated",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: UpdateRequestStatusResult = {
      operation: "error",
      message: "Request not found",
    };
    expect(result.operation).toBe("error");
  });
});
