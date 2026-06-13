import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    request: {
      findMany: vi.fn(),
    },
    company_contact: {
      findMany: vi.fn(),
    },
    store: {
      findMany: vi.fn(),
    },
    note: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listAdminCompanies,
  getAdminCompanyDetail,
  toggleCompanyApproval,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/companies actions
// ---------------------------------------------------------------------------

describe("admin/companies actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listAdminCompanies
  // -----------------------------------------------------------------------

  describe("listAdminCompanies", () => {
    it("returns empty result when no companies exist", async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company.count).mockResolvedValue(0);

      const result = await listAdminCompanies({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(0);
    });

    it("returns paginated company rows", async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([
        {
          company_id: 1,
          company_name: "Test Company",
          company_email: "test@company.com",
          no_of_active_requests: 5,
          company_approved_to_hire: true,
          company_hourly_rate: { toNumber: () => 10 },
          currency_code: "KWD",
          company_updated_at: new Date("2026-06-10"),
          staff: { staff_name: "John" },
        } as any,
      ]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const result = await listAdminCompanies({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        name: "Test Company",
        email: "test@company.com",
        owner: "John",
        requests: 5,
        status: "Approved",
      });
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("filters by approved status", async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company.count).mockResolvedValue(0);

      await listAdminCompanies({ status: "approved" });

      const where = vi.mocked(prisma.company.findMany).mock.calls[0][0]?.where as any;
      expect(where.company_approved_to_hire).toBe(true);
    });

    it("filters by search query", async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([]);
      vi.mocked(prisma.company.count).mockResolvedValue(0);

      await listAdminCompanies({ q: "Test" });

      const where = vi.mocked(prisma.company.findMany).mock.calls[0][0]?.where as any;
      expect(where.OR).toBeDefined();
      expect(where.OR[0].company_name.contains).toBe("Test");
    });

    it("returns not approved status for unapproved companies", async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([
        {
          company_id: 2,
          company_name: "Pending Co",
          company_email: null,
          no_of_active_requests: 0,
          company_approved_to_hire: false,
          company_hourly_rate: null,
          currency_code: null,
          company_updated_at: new Date("2026-06-09"),
          staff: null,
        } as any,
      ]);
      vi.mocked(prisma.company.count).mockResolvedValue(1);

      const result = await listAdminCompanies({});

      expect(result.items[0].status).toBe("Not approved");
      expect(result.items[0].email).toBe("No email");
      expect(result.items[0].owner).toBe("Unassigned");
    });
  });

  // -----------------------------------------------------------------------
  // getAdminCompanyDetail
  // -----------------------------------------------------------------------

  describe("getAdminCompanyDetail", () => {
    const companyData = {
      company_id: 1,
      company_name: "Detail Co",
      company_common_name_en: null,
      company_email: "detail@co.com",
      company_website: null,
      company_approved_to_hire: true,
      company_hourly_rate: { toNumber: () => 15 },
      currency_code: "KWD",
      no_of_active_requests: 3,
      company_created_at: new Date("2026-01-01"),
      company_updated_at: new Date("2026-06-10"),
      staff: { staff_name: "Sarah", staff_email: "sarah@co.com" },
      country: { country_name_en: "Kuwait" },
    } as any;

    it("returns company detail with all sections", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        companyData,
        [],
        [],
        [],
        [],
      ]);

      const result = await getAdminCompanyDetail(1);

      expect(result.company).not.toBeNull();
      expect(result.company?.company_name).toBe("Detail Co");
      expect(result.company?.company_approved_to_hire).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.requests).toEqual([]);
      expect(result.contacts).toEqual([]);
      expect(result.stores).toEqual([]);
      expect(result.notes).toEqual([]);
    });

    it("requires positive company ID", async () => {
      await expect(getAdminCompanyDetail(-1)).rejects.toThrow();
    });

    it("calls $transaction with five queries", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([
        companyData,
        [],
        [],
        [],
        [],
      ]);

      await getAdminCompanyDetail(1);

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      const queries = vi.mocked(prisma.$transaction).mock.calls[0][0] as any;
      expect((queries as any[]).length).toBe(5);
    });
  });

  // -----------------------------------------------------------------------
  // toggleCompanyApproval
  // -----------------------------------------------------------------------

  describe("toggleCompanyApproval", () => {
    it("toggles approval to true", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      const result = await toggleCompanyApproval(1, true);

      expect(result.success).toBe(true);
      expect(vi.mocked(prisma.company.update).mock.calls[0][0]?.data).toMatchObject({
        company_approved_to_hire: true,
      });
    });

    it("toggles approval to false", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      const result = await toggleCompanyApproval(1, false);

      expect(result.success).toBe(true);
      expect(vi.mocked(prisma.company.update).mock.calls[0][0]?.data).toMatchObject({
        company_approved_to_hire: false,
      });
    });

    it("returns error for non-existent company", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

      const result = await toggleCompanyApproval(999, true);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
    });

    it("requires positive company ID", async () => {
      const result = await toggleCompanyApproval(-1, true);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
