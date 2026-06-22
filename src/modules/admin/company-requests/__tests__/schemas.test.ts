import { describe, it, expect } from "vitest";
import {
  listCompanyRequestsSchema,
  getCompanyRequestSchema,
  updateCompanyRequestStatusSchema,
  listCompanyRequestsOutputSchema,
  getCompanyRequestOutputSchema,
  updateCompanyRequestStatusOutputSchema,
  companyRequestRowSchema,
} from "../schemas";

describe("admin/company-requests schemas", () => {
  describe("listCompanyRequestsSchema", () => {
    it("accepts empty input with defaults", () => {
      const result = listCompanyRequestsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.countryId).toBeUndefined();
        expect(result.data.status).toBeUndefined();
      }
    });

    it("accepts pagination params", () => {
      const result = listCompanyRequestsSchema.safeParse({ page: 2, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("coerces string page/limit to numbers", () => {
      const result = listCompanyRequestsSchema.safeParse({ page: "3", limit: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it("accepts status filter 'pending'", () => {
      const result = listCompanyRequestsSchema.safeParse({ status: "pending" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("accepts status filter 'approved'", () => {
      const result = listCompanyRequestsSchema.safeParse({ status: "approved" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("approved");
      }
    });

    it("rejects invalid status value", () => {
      const result = listCompanyRequestsSchema.safeParse({ status: "invalid" });
      expect(result.success).toBe(false);
    });

    it("accepts countryId filter", () => {
      const result = listCompanyRequestsSchema.safeParse({ countryId: 42 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.countryId).toBe(42);
      }
    });

    it("rejects page less than 1", () => {
      const result = listCompanyRequestsSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const result = listCompanyRequestsSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("getCompanyRequestSchema", () => {
    it("accepts valid companyRequestUuid", () => {
      const result = getCompanyRequestSchema.safeParse({ companyRequestUuid: "abc-123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty companyRequestUuid", () => {
      const result = getCompanyRequestSchema.safeParse({ companyRequestUuid: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing companyRequestUuid", () => {
      const result = getCompanyRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("updateCompanyRequestStatusSchema", () => {
    it("accepts valid input with pending status", () => {
      const result = updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "abc-123",
        status: "pending",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid input with approved status", () => {
      const result = updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "abc-123",
        status: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "abc-123",
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty companyRequestUuid", () => {
      const result = updateCompanyRequestStatusSchema.safeParse({
        companyRequestUuid: "",
        status: "pending",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing companyRequestUuid", () => {
      const result = updateCompanyRequestStatusSchema.safeParse({
        status: "approved",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("companyRequestRowSchema", () => {
    it("validates a valid row", () => {
      const result = companyRequestRowSchema.safeParse({
        company_request_uuid: "uuid-1",
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        contact_name: "John Doe",
        contact_position: "CEO",
        phone_number: "+965 1234 5678",
        requesting_for: "Myself",
        currency_code: "KWD",
        country_id: 1,
        country_name_en: "Kuwait",
        status: 0,
        created_at: "2024-01-15T10:00:00.000Z",
        updated_at: "2024-01-15T12:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("validates row with null optional fields", () => {
      const result = companyRequestRowSchema.safeParse({
        company_request_uuid: "uuid-2",
        company_name: null,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country_name_en: null,
        status: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty company_request_uuid", () => {
      const result = companyRequestRowSchema.safeParse({
        company_request_uuid: "",
        company_name: null,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country_name_en: null,
        status: null,
        created_at: null,
        updated_at: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listCompanyRequestsOutputSchema", () => {
    it("validates a valid paginated output", () => {
      const result = listCompanyRequestsOutputSchema.safeParse({
        items: [
          {
            company_request_uuid: "uuid-1",
            company_name: "Acme Corp",
            company_email: "info@acme.com",
            contact_name: "John Doe",
            contact_position: "CEO",
            phone_number: "+965 1234 5678",
            requesting_for: "Myself",
            currency_code: "KWD",
            country_id: 1,
            country_name_en: "Kuwait",
            status: 0,
            created_at: "2024-01-15T10:00:00.000Z",
            updated_at: "2024-01-15T12:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative total", () => {
      const result = listCompanyRequestsOutputSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getCompanyRequestOutputSchema", () => {
    it("validates found request", () => {
      const result = getCompanyRequestOutputSchema.safeParse({
        request: {
          company_request_uuid: "uuid-1",
          company_name: "Acme Corp",
          company_email: "info@acme.com",
          contact_name: "John Doe",
          contact_position: "CEO",
          phone_number: "+965 1234 5678",
          requesting_for: "Myself",
          currency_code: "KWD",
          country_id: 1,
          country_name_en: "Kuwait",
          status: 0,
          created_at: null,
          updated_at: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it("validates null request (not found)", () => {
      const result = getCompanyRequestOutputSchema.safeParse({
        request: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCompanyRequestStatusOutputSchema", () => {
    it("validates success result", () => {
      const result = updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
      });
      expect(result.success).toBe(true);
    });

    it("validates error result", () => {
      const result = updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "error",
        message: "Something went wrong",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid operation", () => {
      const result = updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "invalid",
        message: "msg",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty message", () => {
      const result = updateCompanyRequestStatusOutputSchema.safeParse({
        operation: "success",
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
