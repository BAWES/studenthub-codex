import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
  updateRequestStatusSchema,
  deleteRequestSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCompanyRequestsSchema
// ---------------------------------------------------------------------------
describe("listCompanyRequestsSchema", () => {
  it("accepts empty input", () => {
    expect(listCompanyRequestsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listCompanyRequestsSchema.safeParse({ company_id: 1, page: 2, limit: 50 }).success,
    ).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listCompanyRequestsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCompanyRequestsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCompanyRequestsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(listCompanyRequestsSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyRequestDetailSchema
// ---------------------------------------------------------------------------
describe("getCompanyRequestDetailSchema", () => {
  it("accepts valid input", () => {
    expect(getCompanyRequestDetailSchema.safeParse({ uuid: "req-123" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getCompanyRequestDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCompanyRequestDetailSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getCompanyRequestDetailSchema.safeParse({ uuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanyRequestSchema
// ---------------------------------------------------------------------------
describe("createCompanyRequestSchema", () => {
  const valid = {
    company_id: 1,
    position_title: "Software Engineer",
  };

  it("accepts minimal valid input", () => {
    expect(createCompanyRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createCompanyRequestSchema.safeParse({
        ...valid,
        compensation: "2000 KWD/month",
        number_of_employees: 3,
        location: "Kuwait City",
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(createCompanyRequestSchema.safeParse({ position_title: "Engineer" }).success).toBe(false);
  });

  it("rejects missing position_title", () => {
    expect(createCompanyRequestSchema.safeParse({ company_id: 1 }).success).toBe(false);
  });

  it("rejects empty position_title", () => {
    expect(createCompanyRequestSchema.safeParse({ ...valid, position_title: "" }).success).toBe(false);
  });

  it("rejects position_title exceeding 255 chars", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, position_title: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects number_of_employees below 1", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, number_of_employees: 0 }).success,
    ).toBe(false);
  });

  it("rejects number_of_employees above 1000", () => {
    expect(
      createCompanyRequestSchema.safeParse({ ...valid, number_of_employees: 1001 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatusSchema
// ---------------------------------------------------------------------------
describe("updateRequestStatusSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateRequestStatusSchema.safeParse({ uuid: "req-1", status: "started" }).success,
    ).toBe(true);
  });

  it("accepts all valid statuses", () => {
    const statuses = ["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"];
    for (const status of statuses) {
      expect(updateRequestStatusSchema.safeParse({ uuid: "req-1", status }).success).toBe(true);
    }
  });

  it("accepts feedback", () => {
    expect(
      updateRequestStatusSchema.safeParse({ uuid: "req-1", status: "cancelled", feedback: "No longer needed" })
        .success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(updateRequestStatusSchema.safeParse({ status: "started" }).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(updateRequestStatusSchema.safeParse({ uuid: "", status: "started" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateRequestStatusSchema.safeParse({ uuid: "req-1" }).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      updateRequestStatusSchema.safeParse({ uuid: "req-1", status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects feedback exceeding 255 chars", () => {
    expect(
      updateRequestStatusSchema.safeParse({ uuid: "req-1", status: "cancelled", feedback: "x".repeat(256) })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteRequestSchema
// ---------------------------------------------------------------------------
describe("deleteRequestSchema", () => {
  it("accepts valid input", () => {
    expect(deleteRequestSchema.safeParse({ uuid: "req-1" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(deleteRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(deleteRequestSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});
