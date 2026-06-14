import { describe, it, expect } from "vitest";
import {
  companyRequestListItemSchema,
  companyRequestDetailSchema,
  listCompanyRequestsResultSchema,
  companyRequestActionResultSchema,
} from "./schemas";

describe("company requests page — data contract", () => {
  it("companyRequestListItemSchema validates a valid request list item", () => {
    const r = companyRequestListItemSchema.safeParse({
      request_uuid: "req-123",
      company_id: 1,
      request_position_title: "Software Engineer",
      request_compensation: "2000 KWD",
      request_number_of_employees: 2,
      request_location: "Kuwait City",
      request_status: "pending",
      request_created_datetime: new Date("2024-01-01"),
      request_updated_datetime: new Date("2024-06-01"),
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.request_position_title).toBe("Software Engineer");
  });

  it("companyRequestListItemSchema rejects missing request_uuid", () => {
    const r = companyRequestListItemSchema.safeParse({ request_position_title: "Engineer" });
    expect(r.success).toBe(false);
  });

  it("companyRequestListItemSchema accepts null for nullable fields", () => {
    const r = companyRequestListItemSchema.safeParse({
      request_uuid: "req-123",
      company_id: null,
      request_position_title: null,
      request_compensation: null,
      request_number_of_employees: null,
      request_location: null,
      request_status: null,
      request_created_datetime: new Date(),
      request_updated_datetime: new Date(),
      company_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyRequestsResultSchema validates a paginated result", () => {
    const r = listCompanyRequestsResultSchema.safeParse({
      requests: [
        {
          request_uuid: "r1", company_id: null,
          request_position_title: null, request_compensation: null,
          request_number_of_employees: null, request_location: null,
          request_status: null,
          request_created_datetime: new Date(),
          request_updated_datetime: new Date(),
          company_name: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.requests.length).toBe(1);
  });

  it("listCompanyRequestsResultSchema rejects non-array requests", () => {
    const r = listCompanyRequestsResultSchema.safeParse({
      requests: "bad",
      total: 0, page: 0, limit: 0, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("companyRequestDetailSchema validates a request detail", () => {
    const r = companyRequestDetailSchema.safeParse({
      request_uuid: "req-123",
      company_id: 1,
      contact_uuid: "cu-456",
      staff_id: 78,
      request_position_title: "Software Engineer",
      request_job_description: "Full stack developer",
      request_compensation: "2000 KWD",
      request_number_of_employees: 2,
      request_location: "Kuwait City",
      request_additional_info: "Remote option available",
      request_status: "started",
      request_feedback: "Good candidate pipeline",
      request_created_datetime: new Date("2024-01-01"),
      request_updated_datetime: new Date("2024-06-01"),
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
  });

  it("companyRequestDetailSchema accepts null for nullable fields", () => {
    const r = companyRequestDetailSchema.safeParse({
      request_uuid: "req-123",
      company_id: null,
      contact_uuid: null,
      staff_id: null,
      request_position_title: null,
      request_job_description: "",
      request_compensation: "",
      request_number_of_employees: null,
      request_location: null,
      request_additional_info: null,
      request_status: null,
      request_feedback: null,
      request_created_datetime: new Date(),
      request_updated_datetime: new Date(),
      company_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("companyRequestActionResultSchema validates success", () => {
    const r = companyRequestActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("companyRequestActionResultSchema validates error", () => {
    const r = companyRequestActionResultSchema.safeParse({ error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("companyRequestActionResultSchema rejects missing both success and error", () => {
    const r = companyRequestActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
