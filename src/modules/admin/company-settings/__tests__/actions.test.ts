import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  listAdminCompanySettings,
  getAdminCompanySettings,
  updateAdminCompanySettings,
} from "../actions";

const mockRow = {
  company_id: 1,
  company_name: "Acme Corp",
  company_common_name_en: "Acme",
  company_common_name_ar: null,
  company_description_en: "A company",
  company_description_ar: null,
  company_website: "https://acme.com",
  company_email: "info@acme.com",
  company_hourly_rate: 50,
  company_bonus_commission: 10,
  company_followup: true,
  company_followup_interval_weeks: 4,
  company_approved_to_hire: true,
  currency_code: "KWD",
};

describe("listAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns items when the module returns data", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([mockRow as any]);

    const result = await listAdminCompanySettings();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].company_id).toBe(1);
    expect(result.items[0].company_name).toBe("Acme Corp");
  });

  it("returns empty items when module returns empty", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);

    const result = await listAdminCompanySettings();
    expect(result.items).toEqual([]);
  });
});

describe("getAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns settings for a valid company ID", async () => {
    vi.mocked(prisma.company.findFirst).mockResolvedValue(mockRow as any);

    const result = await getAdminCompanySettings(1);
    expect(result).not.toBeNull();
    expect(result!.company_name).toBe("Acme Corp");
    expect(result!.company_email).toBe("info@acme.com");
  });

  it("returns null for non-existent company", async () => {
    vi.mocked(prisma.company.findFirst).mockResolvedValue(null);

    const result = await getAdminCompanySettings(999);
    expect(result).toBeNull();
  });
});

describe("updateAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when module update succeeds", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue({ company_id: 1 } as any);
    vi.mocked(prisma.company.update).mockResolvedValue({} as any);

    const result = await updateAdminCompanySettings(1, {
      companyName: "New Name",
      companyEmail: "new@example.com",
    });

    expect(result.operation).toBe("success");
  });

  it("returns error when module update fails", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

    const result = await updateAdminCompanySettings(999, {
      companyName: "Ghost",
    });

    expect(result.operation).toBe("error");
  });
});
