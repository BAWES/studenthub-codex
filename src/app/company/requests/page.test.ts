import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestDetailSchema,
  createCompanyRequestSchema,
  updateRequestStatusSchema,
  deleteRequestSchema,
} from "./schemas";

/**
 * Page migration test for company/requests.
 *
 * Verifies the data contract between page and action.
 * The requests page lists company staffing requests with CRUD actions.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company requests page — data contract", () => {
  // ---------------------------------------------------------------------------
  // listCompanyRequestsSchema
  // ---------------------------------------------------------------------------
  it("listCompanyRequestsSchema accepts empty input", () => {
    const r = listCompanyRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("listCompanyRequestsSchema accepts explicit values", () => {
    const r = listCompanyRequestsSchema.safeParse({
      company_id: 1,
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyRequestsSchema rejects zero page", () => {
    const r = listCompanyRequestsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("listCompanyRequestsSchema rejects limit below 1", () => {
    const r = listCompanyRequestsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("listCompanyRequestsSchema rejects limit above 100", () => {
    const r = listCompanyRequestsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // getCompanyRequestDetailSchema
  // ---------------------------------------------------------------------------
  it("getCompanyRequestDetailSchema accepts valid uuid", () => {
    const r = getCompanyRequestDetailSchema.safeParse({ uuid: "req-123" });
    expect(r.success).toBe(true);
  });

  it("getCompanyRequestDetailSchema rejects missing uuid", () => {
    const r = getCompanyRequestDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getCompanyRequestDetailSchema rejects empty uuid", () => {
    const r = getCompanyRequestDetailSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // createCompanyRequestSchema
  // ---------------------------------------------------------------------------
  it("createCompanyRequestSchema accepts minimal valid input", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "Software Engineer",
    });
    expect(r.success).toBe(true);
  });

  it("createCompanyRequestSchema accepts full input", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "Software Engineer",
      compensation: "2000 KWD/month",
      number_of_employees: 3,
      location: "Kuwait City",
    });
    expect(r.success).toBe(true);
  });

  it("createCompanyRequestSchema rejects missing company_id", () => {
    const r = createCompanyRequestSchema.safeParse({
      position_title: "Engineer",
    });
    expect(r.success).toBe(false);
  });

  it("createCompanyRequestSchema rejects missing position_title", () => {
    const r = createCompanyRequestSchema.safeParse({ company_id: 1 });
    expect(r.success).toBe(false);
  });

  it("createCompanyRequestSchema rejects empty position_title", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "",
    });
    expect(r.success).toBe(false);
  });

  it("createCompanyRequestSchema rejects number_of_employees above 1000", () => {
    const r = createCompanyRequestSchema.safeParse({
      company_id: 1,
      position_title: "Engineer",
      number_of_employees: 1001,
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // updateRequestStatusSchema
  // ---------------------------------------------------------------------------
  it("updateRequestStatusSchema accepts valid input", () => {
    const r = updateRequestStatusSchema.safeParse({
      uuid: "req-1",
      status: "started",
    });
    expect(r.success).toBe(true);
  });

  it("updateRequestStatusSchema accepts all valid statuses", () => {
    const statuses = [
      "pending",
      "started",
      "delivered",
      "cancelled",
      "finished_by_recruitment",
      "re_work",
    ];
    for (const status of statuses) {
      const r = updateRequestStatusSchema.safeParse({
        uuid: "req-1",
        status,
      });
      expect(r.success).toBe(true);
    }
  });

  it("updateRequestStatusSchema accepts feedback", () => {
    const r = updateRequestStatusSchema.safeParse({
      uuid: "req-1",
      status: "cancelled",
      feedback: "No longer needed",
    });
    expect(r.success).toBe(true);
  });

  it("updateRequestStatusSchema rejects missing uuid", () => {
    const r = updateRequestStatusSchema.safeParse({ status: "started" });
    expect(r.success).toBe(false);
  });

  it("updateRequestStatusSchema rejects missing status", () => {
    const r = updateRequestStatusSchema.safeParse({ uuid: "req-1" });
    expect(r.success).toBe(false);
  });

  it("updateRequestStatusSchema rejects invalid status", () => {
    const r = updateRequestStatusSchema.safeParse({
      uuid: "req-1",
      status: "invalid",
    });
    expect(r.success).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // deleteRequestSchema
  // ---------------------------------------------------------------------------
  it("deleteRequestSchema accepts valid uuid", () => {
    const r = deleteRequestSchema.safeParse({ uuid: "req-1" });
    expect(r.success).toBe(true);
  });

  it("deleteRequestSchema rejects missing uuid", () => {
    const r = deleteRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("deleteRequestSchema rejects empty uuid", () => {
    const r = deleteRequestSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });
});
