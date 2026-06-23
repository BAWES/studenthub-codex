import { describe, it, expect } from "vitest";
import {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  candidateIdRequestRowSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
} from "./schemas";

describe("listCandidateIdRequestsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listCandidateIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit values", () => {
    const r = listCandidateIdRequestsSchema.safeParse({
      page: 2,
      limit: 50,
      status: "pending",
    });
    expect(r.success).toBe(true);
  });

  it("accepts approved status filter", () => {
    expect(listCandidateIdRequestsSchema.safeParse({ status: "approved" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listCandidateIdRequestsSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCandidateIdRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCandidateIdRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCandidateIdRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("getCandidateIdRequestSchema", () => {
  it("accepts valid UUID", () => {
    expect(getCandidateIdRequestSchema.safeParse({ cirUuid: "cir-001" }).success).toBe(true);
  });

  it("rejects missing cirUuid", () => {
    expect(getCandidateIdRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty cirUuid", () => {
    expect(getCandidateIdRequestSchema.safeParse({ cirUuid: "" }).success).toBe(false);
  });
});

describe("updateCandidateIdRequestStatusSchema", () => {
  it("accepts valid input with approve", () => {
    const r = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "cir-001",
      status: "approved",
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid input with reject and reason", () => {
    const r = updateCandidateIdRequestStatusSchema.safeParse({
      cirUuid: "cir-001",
      status: "rejected",
      rejectionReason: "Documents incomplete",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cirUuid", () => {
    expect(updateCandidateIdRequestStatusSchema.safeParse({ status: "approved" }).success).toBe(false);
  });

  it("rejects empty cirUuid", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({ cirUuid: "", status: "approved" }).success,
    ).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({ cirUuid: "cir-001", status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects rejection reason over 1000 chars", () => {
    expect(
      updateCandidateIdRequestStatusSchema.safeParse({
        cirUuid: "cir-001",
        status: "rejected",
        rejectionReason: "x".repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe("candidateIdRequestRowSchema", () => {
  const validRow = {
    cir_uuid: "cir-001",
    candidate_ids: "1,2,3",
    status: "pending",
    rejection_reason: null,
    created_by_name: "Admin User",
    updated_by_name: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
  };

  it("accepts a valid row", () => {
    expect(candidateIdRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      candidateIdRequestRowSchema.safeParse({
        ...validRow,
        candidate_ids: null,
        rejection_reason: null,
        created_by_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validRow;
    expect(candidateIdRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty cir_uuid", () => {
    expect(candidateIdRequestRowSchema.safeParse({ ...validRow, cir_uuid: "" }).success).toBe(false);
  });
});

describe("listCandidateIdRequestsOutputSchema", () => {
  it("accepts valid output", () => {
    const r = listCandidateIdRequestsOutputSchema.safeParse({
      items: [
        {
          cir_uuid: "cir-001",
          candidate_ids: "1,2",
          status: "pending",
          rejection_reason: null,
          created_by_name: "Admin",
          updated_by_name: null,
          created_at: null,
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

  it("accepts empty items", () => {
    const r = listCandidateIdRequestsOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCandidateIdRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCandidateIdRequestsOutputSchema.safeParse({
        items: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

describe("getCandidateIdRequestOutputSchema", () => {
  it("accepts a valid request", () => {
    const r = getCandidateIdRequestOutputSchema.safeParse({
      request: {
        cir_uuid: "cir-001",
        candidate_ids: "1,2",
        status: "pending",
        rejection_reason: null,
        created_by_name: "Admin",
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null request", () => {
    expect(getCandidateIdRequestOutputSchema.safeParse({ request: null }).success).toBe(true);
  });
});

describe("updateCandidateIdRequestStatusOutputSchema", () => {
  it("accepts success response", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "success", message: "Updated" })
        .success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "error", message: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "invalid", message: "Oops" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(updateCandidateIdRequestStatusOutputSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});
