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

// Helpers
function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    company_request_uuid: "REQ-UUID-001",
    company_name: "Acme Corp",
    company_email: "acme@test.com",
    contact_name: "John Doe",
    contact_position: "CEO",
    phone_number: "+965 5000 0000",
    requesting_for: "self",
    currency_code: "KWD",
    country_id: 1,
    country_name_en: "Kuwait",
    status: 0,
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: "2026-06-02T10:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// admin/company-requests actions
// ---------------------------------------------------------------------------

describe("admin/company-requests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listCompanyRequests
  // -----------------------------------------------------------------------

  describe("listCompanyRequests", () => {
    it("returns empty result when no requests exist", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      const result = await listCompanyRequests({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it("returns paginated company request rows", async () => {
      const prismaRow = {
        company_request_uuid: "REQ-UUID-001",
        company_name: "Acme Corp",
        company_email: "acme@test.com",
        contact_name: "John Doe",
        contact_position: "CEO",
        phone_number: "+965 5000 0000",
        requesting_for: "self",
        currency_code: "KWD",
        country_id: 1,
        country: { country_name_en: "Kuwait" },
        status: 0,
        created_at: new Date("2026-06-01T10:00:00Z"),
        updated_at: new Date("2026-06-02T10:00:00Z"),
      };

      vi.mocked(prisma.company_request.findMany).mockResolvedValue([prismaRow as any]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(1);

      const result = await listCompanyRequests({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        company_request_uuid: "REQ-UUID-001",
        company_name: "Acme Corp",
        company_email: "acme@test.com",
        status: 0,
        country_name_en: "Kuwait",
      });
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("filters by countryId", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ countryId: 2 });

      const where = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(where.country_id).toBe(2);
    });

    it("filters by status (pending)", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ status: "pending" });

      const where = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(where.status).toBe(0);
    });

    it("filters by status (approved)", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(0);

      await listCompanyRequests({ status: "approved" });

      const where = vi.mocked(prisma.company_request.findMany).mock.calls[0][0]?.where as any;
      expect(where.status).toBe(1);
    });

    it("handles missing country gracefully", async () => {
      vi.mocked(prisma.company_request.findMany).mockResolvedValue([{
        company_request_uuid: "REQ-UUID-002",
        company_name: "No Country Co",
        company_email: null,
        contact_name: null,
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_id: null,
        country: null,
        status: null,
        created_at: null,
        updated_at: null,
      } as any]);
      vi.mocked(prisma.company_request.count).mockResolvedValue(1);

      const result = await listCompanyRequests({});

      expect(result.items[0].company_name).toBe("No Country Co");
      expect(result.items[0].country_name_en).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // getCompanyRequest
  // -----------------------------------------------------------------------

  describe("getCompanyRequest", () => {
    it("returns a single company request by UUID", async () => {
      vi.mocked(prisma.company_request.findFirst).mockResolvedValue({
        company_request_uuid: "REQ-UUID-001",
        company_name: "Acme Corp",
        company_email: "acme@test.com",
        contact_name: "John Doe",
        contact_position: "CEO",
        phone_number: "+965 5000 0000",
        requesting_for: "self",
        currency_code: "KWD",
        country_id: 1,
        country: { country_name_en: "Kuwait" },
        status: 0,
        created_at: new Date("2026-06-01T10:00:00Z"),
        updated_at: new Date("2026-06-02T10:00:00Z"),
      } as any);

      const result = await getCompanyRequest("REQ-UUID-001");

      expect(result.request).not.toBeNull();
      expect(result.request?.company_name).toBe("Acme Corp");
      expect(result.request?.country_name_en).toBe("Kuwait");
    });

    it("returns null request for non-existent UUID", async () => {
      vi.mocked(prisma.company_request.findFirst).mockResolvedValue(null);

      const result = await getCompanyRequest("NONEXISTENT-UUID");

      expect(result.request).toBeNull();
    });

    it("throws error for invalid UUID", async () => {
      await expect(getCompanyRequest("")).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // updateCompanyRequestStatus
  // -----------------------------------------------------------------------

  describe("updateCompanyRequestStatus", () => {
    it("approves a pending company request", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "REQ-UUID-001",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "REQ-UUID-001",
        status: "approved",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("approved");
      expect(vi.mocked(prisma.company_request.update).mock.calls[0][0]?.data).toMatchObject({
        status: true,
      });
    });

    it("reverts an approved request to pending", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "REQ-UUID-001",
        status: true,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "REQ-UUID-001",
        status: "pending",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("pending");
      expect(vi.mocked(prisma.company_request.update).mock.calls[0][0]?.data).toMatchObject({
        status: false,
      });
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue(null);

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "NONEXISTENT-UUID",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Company request not found");
    });

    it("returns error for invalid UUID", async () => {
      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "REQ-UUID-001",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockRejectedValue(new Error("DB error"));

      const result = await updateCompanyRequestStatus({
        companyRequestUuid: "REQ-UUID-001",
        status: "approved",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });

    it("calls revalidatePath after status update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.company_request.findUnique).mockResolvedValue({
        company_request_uuid: "REQ-UUID-001",
        status: false,
      } as any);
      vi.mocked(prisma.company_request.update).mockResolvedValue({} as any);

      await updateCompanyRequestStatus({
        companyRequestUuid: "REQ-UUID-001",
        status: "approved",
      });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/company-requests");
    });
  });
});
