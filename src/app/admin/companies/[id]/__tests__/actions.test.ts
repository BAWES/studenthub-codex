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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock workspace format helpers (used by both the child and parent module actions)
vi.mock("@/modules/workspace/format", () => ({
  formatMoney: vi.fn((v) => v ? `${v} KWD` : "0 KWD"),
  formatDate: vi.fn(() => "Mock Date"),
}));

const { updateAdminCompany } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/companies/[id] actions
// ---------------------------------------------------------------------------

describe("admin/companies/[id] actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // updateAdminCompany
  // -----------------------------------------------------------------------

  describe("updateAdminCompany", () => {
    const validInput = {
      companyId: 1,
      companyName: "Updated Corp",
    };

    it("updates company name successfully", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      const result = await updateAdminCompany(validInput);

      expect(result.operation).toBe("success");
      expect(result.message).toBe("Company updated");
    });

    it("updates multiple fields selectively", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      await updateAdminCompany({
        companyId: 1,
        companyName: "New Name",
        companyEmail: "new@email.com",
        companyHourlyRate: 25,
        currencyCode: "USD",
      });

      const data = vi.mocked(prisma.company.update).mock.calls[0][0]?.data as any;
      expect(data.company_name).toBe("New Name");
      expect(data.company_email).toBe("new@email.com");
      expect(data.company_hourly_rate).toBe(25);
      expect(data.currency_code).toBe("USD");
      expect(data.company_updated_at).toBeInstanceOf(Date);
    });

    it("only includes provided fields in update data", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      await updateAdminCompany({
        companyId: 1,
        companyWebsite: "https://example.com",
      });

      const data = vi.mocked(prisma.company.update).mock.calls[0][0]?.data as any;
      expect(data.company_website).toBe("https://example.com");
      expect(data.company_name).toBeUndefined();
      expect(data.company_email).toBeUndefined();
    });

    it("accepts nullable fields as undefined", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      await updateAdminCompany({
        companyId: 1,
        companyCommonNameEn: null,
        companyEmail: null,
      });

      const data = vi.mocked(prisma.company.update).mock.calls[0][0]?.data as any;
      expect(data.company_common_name_en).toBeNull();
      expect(data.company_email).toBeNull();
    });

    it("returns error for non-existent company", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

      const result = await updateAdminCompany({
        companyId: 999,
        companyName: "Nope",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Company not found");
    });

    it("returns error for invalid company ID (negative)", async () => {
      const result = await updateAdminCompany({
        companyId: -1,
        companyName: "Bad",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error for invalid company ID (zero)", async () => {
      const result = await updateAdminCompany({
        companyId: 0,
        companyName: "Bad",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error for invalid email format", async () => {
      const result = await updateAdminCompany({
        companyId: 1,
        companyEmail: "not-an-email",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error for invalid URL format", async () => {
      const result = await updateAdminCompany({
        companyId: 1,
        companyWebsite: "not-a-url",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("throws on Prisma findUnique failure (uncaught)", async () => {
      vi.mocked(prisma.company.findUnique).mockRejectedValue(
        new Error("Connection timeout"),
      );

      await expect(updateAdminCompany(validInput)).rejects.toThrow(
        "Connection timeout",
      );
    });

    it("returns error on Prisma update failure", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockRejectedValue(
        new Error("Deadlock detected"),
      );

      const result = await updateAdminCompany(validInput);

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Deadlock detected");
    });

    it("calls revalidatePath after update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      await updateAdminCompany(validInput);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/companies");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/companies/1");
    });

    it("sets company_updated_at on every update", async () => {
      vi.mocked(prisma.company.findUnique).mockResolvedValue({
        company_id: 1,
      } as any);
      vi.mocked(prisma.company.update).mockResolvedValue({} as any);

      await updateAdminCompany({
        companyId: 1,
        companyName: "Test",
      });

      const data = vi.mocked(prisma.company.update).mock.calls[0][0]?.data as any;
      expect(data.company_updated_at).toBeInstanceOf(Date);
    });
  });
});
