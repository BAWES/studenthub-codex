import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  requestListItemSchema,
  listRequestsResultSchema,
  requestUuidResultSchema,
  requestDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: request schema validation
//
// The listRequests, getRequest, createRequest, and updateRequest actions use
// these schemas internally. Testing them separately avoids mocking "use server"
// dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listRequestsSchema = z.object({
  status: z
    .enum(["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"])
    .optional(),
  positionType: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  contactUuid: z.string().optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  query: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
});

const createRequestSchema = z.object({
  companyId: z.number().int().positive(),
  contactUuid: z.string().optional(),
  positionType: z.number().int().positive(),
  positionTitle: z.string().min(1, "Position title is required"),
  numberOfEmployees: z.number().int().positive().optional(),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  jobDescription: z.string().min(1, "Job description is required"),
  compensation: z.string().optional(),
  noOfEmployeesPerStory: z.number().int().positive().optional().default(1),
  gender: z.boolean().optional(),
  nationalityId: z.number().int().positive().optional(),
  ourFeesUnit: z.string().optional(),
  ourFees: z.number().optional(),
});

const updateRequestSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  positionType: z.number().int().positive().optional(),
  positionTitle: z.string().optional(),
  numberOfEmployees: z.number().int().positive().optional(),
  location: z.string().optional(),
  additionalInfo: z.string().optional(),
  jobDescription: z.string().optional(),
  compensation: z.string().optional(),
  requestStatus: z
    .enum(["pending", "started", "delivered", "cancelled", "finished_by_recruitment", "re_work"])
    .optional(),
  noOfEmployeesPerStory: z.number().int().positive().optional(),
  gender: z.boolean().optional(),
  nationalityId: z.number().int().positive().optional(),
  ourFeesUnit: z.string().optional(),
  ourFees: z.number().optional(),
});

// ---------------------------------------------------------------------------
// listRequestsSchema
// ---------------------------------------------------------------------------

describe("listRequestsSchema", () => {
  it("accepts empty params", () => {
    const result = listRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts status filter", () => {
    const result = listRequestsSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
    }
  });

  it("accepts positionType filter", () => {
    const result = listRequestsSchema.safeParse({ positionType: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.positionType).toBe(1);
    }
  });

  it("accepts companyId filter", () => {
    const result = listRequestsSchema.safeParse({ companyId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("accepts contactUuid filter", () => {
    const result = listRequestsSchema.safeParse({ contactUuid: "abc-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123");
    }
  });

  it("accepts query filter", () => {
    const result = listRequestsSchema.safeParse({ query: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("developer");
    }
  });

  it("accepts candidateId filter", () => {
    const result = listRequestsSchema.safeParse({ candidateId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(7);
    }
  });

  it("accepts pagination params", () => {
    const result = listRequestsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects invalid status", () => {
    const result = listRequestsSchema.safeParse({ status: "invalid-status" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listRequestsSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listRequestsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listRequestsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRequestSchema
// ---------------------------------------------------------------------------

describe("getRequestSchema", () => {
  it("accepts a valid request UUID", () => {
    const result = getRequestSchema.safeParse({ requestUuid: "req_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc123");
    }
  });

  it("rejects empty request UUID", () => {
    const result = getRequestSchema.safeParse({ requestUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing request UUID", () => {
    const result = getRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createRequestSchema
// ---------------------------------------------------------------------------

describe("createRequestSchema", () => {
  it("accepts valid creation data with all required fields", () => {
    const result = createRequestSchema.safeParse({
      companyId: 1,
      positionType: 2,
      positionTitle: "Software Engineer",
      jobDescription: "Develop and maintain software",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.positionTitle).toBe("Software Engineer");
    }
  });

  it("accepts creation with optional fields", () => {
    const result = createRequestSchema.safeParse({
      companyId: 1,
      positionType: 2,
      positionTitle: "Senior Developer",
      jobDescription: "Lead development team",
      location: "Kuwait City",
      compensation: "Competitive",
      numberOfEmployees: 3,
      nationalityId: 1,
      gender: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBe("Kuwait City");
      expect(result.data.numberOfEmployees).toBe(3);
    }
  });

  it("rejects empty position title", () => {
    const result = createRequestSchema.safeParse({
      companyId: 1,
      positionType: 2,
      positionTitle: "",
      jobDescription: "Some description",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty job description", () => {
    const result = createRequestSchema.safeParse({
      companyId: 1,
      positionType: 2,
      positionTitle: "Engineer",
      jobDescription: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = createRequestSchema.safeParse({
      positionType: 2,
      positionTitle: "Engineer",
      jobDescription: "Desc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive companyId", () => {
    const result = createRequestSchema.safeParse({
      companyId: 0,
      positionType: 2,
      positionTitle: "Engineer",
      jobDescription: "Desc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive positionType", () => {
    const result = createRequestSchema.safeParse({
      companyId: 1,
      positionType: -1,
      positionTitle: "Engineer",
      jobDescription: "Desc",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateRequestSchema
// ---------------------------------------------------------------------------

describe("updateRequestSchema", () => {
  it("accepts valid update data with just UUID and one field", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "req_abc123",
      positionTitle: "Updated Title",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc123");
      expect(result.data.positionTitle).toBe("Updated Title");
    }
  });

  it("accepts update with all optional fields", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "req_abc123",
      positionTitle: "New Title",
      positionType: 3,
      jobDescription: "New description",
      requestStatus: "started",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestStatus).toBe("started");
    }
  });

  it("rejects empty request UUID", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "",
      positionTitle: "New Title",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing request UUID", () => {
    const result = updateRequestSchema.safeParse({
      positionTitle: "New Title",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid requestStatus", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "req_abc123",
      requestStatus: "non_existent",
    });
    expect(result.success).toBe(false);
  });

  it("accepts update with only UUID (no changes)", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "req_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive nationalityId", () => {
    const result = updateRequestSchema.safeParse({
      requestUuid: "req_abc123",
      nationalityId: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: requestListItemSchema
// ---------------------------------------------------------------------------

describe("requestListItemSchema (output)", () => {
  const validItem = {
    request_uuid: "req_abc123",
    company_id: 1,
    contact_uuid: "contact_abc",
    staff_id: 42,
    request_position_type: 2,
    request_position_title: "Software Engineer",
    request_job_description: "Develop software",
    request_compensation: "Competitive",
    request_number_of_employees: 3,
    no_of_employees_per_story: 1,
    request_location: "Kuwait City",
    request_additional_info: "Some info",
    request_status: "pending",
    request_priority: 1,
    gender: false,
    nationality_id: null,
    request_created_datetime: new Date("2025-01-01"),
    request_updated_datetime: new Date("2025-01-02"),
  };

  it("accepts a valid request list item", () => {
    const result = requestListItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid, ...rest } = validItem;
    const result = requestListItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for request_job_description", () => {
    const result = requestListItemSchema.safeParse({ ...validItem, request_job_description: 123 });
    expect(result.success).toBe(false);
  });

  it("accepts nullable fields as null", () => {
    const result = requestListItemSchema.safeParse({
      ...validItem,
      company_id: null,
      staff_id: null,
      request_position_title: null,
      nationality_id: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation: listRequestsResultSchema
// ---------------------------------------------------------------------------

describe("listRequestsResultSchema (output)", () => {
  const validDate = new Date("2025-01-01");
  const validItem = {
    request_uuid: "req_abc",
    company_id: null,
    contact_uuid: null,
    staff_id: null,
    request_position_type: null,
    request_position_title: null,
    request_job_description: "Job",
    request_compensation: "Pay",
    request_number_of_employees: null,
    no_of_employees_per_story: 1,
    request_location: null,
    request_additional_info: null,
    request_status: null,
    request_priority: null,
    gender: false,
    nationality_id: null,
    request_created_datetime: validDate,
    request_updated_datetime: validDate,
  };

  it("accepts a valid list result with items", () => {
    const result = listRequestsResultSchema.safeParse({
      requests: [validItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty requests array", () => {
    const result = listRequestsResultSchema.safeParse({
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listRequestsResultSchema.safeParse({
      requests: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listRequestsResultSchema.safeParse({
      requests: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: requestUuidResultSchema
// ---------------------------------------------------------------------------

describe("requestUuidResultSchema (output)", () => {
  it("accepts a valid result with request_uuid", () => {
    const result = requestUuidResultSchema.safeParse({ request_uuid: "req_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    const result = requestUuidResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const result = requestUuidResultSchema.safeParse({ request_uuid: 123 });
    expect(result.success).toBe(false);
  });

  it("accepts empty string request_uuid", () => {
    const result = requestUuidResultSchema.safeParse({ request_uuid: "" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation: requestDetailSchema
// ---------------------------------------------------------------------------

describe("requestDetailSchema (output)", () => {
  const validDetail = {
    request_uuid: "req_abc",
    company_id: 1,
    contact_uuid: "contact_abc",
    staff_id: 42,
    request_created_by: 10,
    request_updated_by: 10,
    request_position_type: 2,
    request_position_title: "Engineer",
    request_job_description: "Develop",
    request_compensation: "Pay",
    request_number_of_employees: 3,
    no_of_employees_per_story: 1,
    request_location: "Kuwait",
    request_additional_info: null,
    request_status: "pending",
    request_feedback: null,
    request_priority: 1,
    gender: false,
    nationality_id: null,
    our_fees: 500.0,
    our_fees_unit: "KWD",
    request_created_datetime: new Date("2025-01-01"),
    request_updated_datetime: new Date("2025-01-02"),
  };

  it("accepts a valid request detail", () => {
    const result = requestDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("rejects missing required string field", () => {
    const { request_job_description, ...rest } = validDetail;
    const result = requestDetailSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts nullable fields as null", () => {
    const result = requestDetailSchema.safeParse({
      ...validDetail,
      company_id: null,
      staff_id: null,
      our_fees: null,
      our_fees_unit: null,
      request_feedback: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong type for no_of_employees_per_story", () => {
    const result = requestDetailSchema.safeParse({ ...validDetail, no_of_employees_per_story: "one" });
    expect(result.success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid, ...rest } = validDetail;
    const result = requestDetailSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
