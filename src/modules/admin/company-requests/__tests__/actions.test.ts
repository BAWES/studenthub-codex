import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_request: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listCompanyRequests,
  getCompanyRequest,
  updateCompanyRequestStatus,
} = await import("../actions");

describe("admin/company-requests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listCompanyRequests
  // -----------------------------------------------------------------------

  describe("listCompanyRequests", () => {
    it("returns paginated results with default values", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      const result = await listCompanyRequests({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.items).toEqual([]);
    });

    it("filters by status 'pending' (converts to 0)", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ status: "pending" });

      const whereArg = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe(0);
    });

    it("filters by status 'approved' (converts to 1)", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ status: "approved" });

      const whereArg = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.status).toBe(1);
    });

    it("filters by countryId", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ countryId: 42 });

      const whereArg = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.country_id).toBe(42);
    });

    it("includes country relation", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({});

      const includeArg = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.include as any;
      expect(includeArg.country).toEqual({ select: { country_name_en: true } });
    });

    it("maps rows with company and country names", async () => {
      const mockRow = {
        company_request_uuid: "cr-uuid-1",
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        contact_name: "John Doe",
        contact_position: "CEO",
        phone_number: "+965 1234 5678",
        requesting_for: "Myself",
        currency_code: "KWD",
        country_id: 1,
        status: false,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        country: { country_name_en: "Kuwait" },
      };

      vi.mocked(prisma.company_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.company_request.count).mockResolvedValue(1);

      const result = await listCompanyRequests({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        company_request_uuid: "cr-uuid-1",
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
      });
    });

    it("handles null country gracefully", async () => {
      const mockRow = {
        company_request_uuid: "cr-uuid-2",
        company_name: null,
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        status: null,
        created_at: null,
        updated_at: null,
        country: null,
      };

      vi.mocked(prisma.company_request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.company_request.count).mockResolvedValue(1);

      const result = await listCompanyRequests({});

      expect(result.items[0].country_name_en).toBeNull();
    });

    it("computes totalPages correctly", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(55);

      const result = await listCompanyRequests({ limit: 20, page: 1 });

      expect(result.totalPages).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // getCompanyRequest
  // -----------------------------------------------------------------------

  describe("getCompanyRequest", () => {
    it("returns request detail when found", async () => {
      const mockRow = {
        company_request_uuid: "cr-uuid-1",
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        contact_name: "John Doe",
        contact_position: "CEO",
        phone_number: "+965 1234 5678",
        requesting_for: "Myself",
        currency_code: "KWD",
        country_id: 1,
        status: false,
        created_at: new Date("2024-01-15T10:00:00Z"),
        updated_at: new Date("2024-01-15T12:00:00Z"),
        country: { country_name_en: "Kuwait" },
      };

      vi.mocked(prisma.company_request.findFirst).mockResolvedValue(mockRow as any);

      const result = await getCompanyRequest("cr-uuid-1");

      expect(result.request).not.toBeNull();
      expect(result.request?.company_request_uuid).toBe("cr-uuid-1");
      expect(result.request?.company_name).toBe("Acme Corp");
      expect(result.request?.country_name_en).toBe("Kuwait");
    });

    it("returns null request when not found", async () => {
      vi.mocked(prisma.company_request.findFirst).mockResolvedValue(null);

      const result = await getCompanyRequest("non-existent");

      expect(result.request).toBeNull();
    });

    it("includes country in query", async () => {
      vi.mocked(prisma.company_request.findFirst).mockResolvedValue(null);

      await getCompanyRequest("cr-uuid-1");

      const includeArg = vi.mocked(prisma.company_request.findFirst).mock.calls[0][0]?.include as any;
      expect(includeArg.country).toEqual({ select: { country_name_en: true } });
    });

    it("throws on invalid input", async () => {
      await expect(getCompanyRequest("")).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // updateCompanyRequestStatus
  // -----------------------------------------------------------------------

  describe("updateCompanyRequestStatus", () => {
    it("updates status to approved (boolean true)", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "cr-uuid-1",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "cr-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("approved");

      const updateData = vi.mocked(prisma.company_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe(true);
    });

    it("updates status to pending (boolean false)", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "cr-uuid-1",
        status: true,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "cr-uuid-1",
        status: "pending",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("pending");

      const updateData = vi.mocked(prisma.company_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.status).toBe(false);
    });

    it("sets updated_at during status update", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "cr-uuid-1",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      await updateCompanyRequestStatus({
        companyRequestUuid: "cr-uuid-1",
        status: "approved",
      });

      const updateData = vi.mocked(prisma.company_request.update).mock.calls[0][0]?.data as any;
      expect(updateData.updated_at).toBeInstanceOf(Date);
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue(null);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "non-existent",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error for invalid input", async () => {
      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "",
        status: "approved",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "cr-uuid-1",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockRejectedValue(new Error("DB error"));

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "cr-uuid-1",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });
});
