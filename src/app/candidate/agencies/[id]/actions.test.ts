import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  type AgencyItem,
  type AgencyActionResult,
} from "../schemas";

// ---------------------------------------------------------------------------
// Mocks — data layer & auth
// ---------------------------------------------------------------------------

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { prisma } = await import("@/lib/prisma");
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");
const actions = await import("./actions");

// ---------------------------------------------------------------------------
// Helpers for type safety when constructing mock rows
// ---------------------------------------------------------------------------

function makeCompanyRow(overrides: Record<string, unknown> = {}) {
  return {
    company_id: 1,
    company_name: "Test Agency",
    company_common_name_en: null,
    company_common_name_ar: null,
    company_email: "agency@example.com",
    company_website: "https://example.com",
    company_logo: null,
    commercial_licence: "LIC-123",
    total_candidate: null,
    no_of_active_requests: 0,
    country_id: null,
    company_created_at: null,
    company_updated_at: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getAgencySchema", () => {
  it("accepts a valid positive company ID", () => {
    const result = getAgencySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const result = getAgencySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const result = getAgencySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative companyId", () => {
    const result = getAgencySchema.safeParse({ companyId: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string companyId to number", () => {
    const result = getAgencySchema.safeParse({ companyId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });
});

describe("updateAgencySchema", () => {
  it("accepts valid update params", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "Updated Agency",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Updated Agency");
    }
  });

  it("trims companyName", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "  Spaced Name  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Spaced Name");
    }
  });

  it("rejects missing companyId", () => {
    const result = updateAgencySchema.safeParse({
      companyName: "Agency",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty companyName", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional email", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "Agency",
      companyEmail: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string email", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "Agency",
      companyEmail: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "Agency",
      companyEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteAgencySchema", () => {
  it("accepts valid delete params", () => {
    const result = deleteAgencySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const result = deleteAgencySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces companyId from string", () => {
    const result = deleteAgencySchema.safeParse({ companyId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(99);
    }
  });
});

// ---------------------------------------------------------------------------
// Action tests — server action logic with mocked Prisma
// ---------------------------------------------------------------------------

describe("getAgency action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "candidate",
      id: "1",
      name: "Test",
      email: "test@test.com",
      issuedAt: Date.now(),
    });
  });

  it("returns a company when found", async () => {
    const row = makeCompanyRow({ company_id: 7 });
    mockFindFirst.mockResolvedValue(row);

    const result = await actions.getAgency(7);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { company_id: 7, deleted: 0 },
    });
    expect(result).not.toBeNull();
    expect(result!.company_id).toBe(7);
    expect(result!.company_name).toBe("Test Agency");
  });

  it("returns null when company not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.getAgency(999);
    expect(result).toBeNull();
  });

  it("throws on invalid companyId (non-positive)", async () => {
    await expect(actions.getAgency(0)).rejects.toThrow("Company ID is required");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("converts total_candidate to number when present", async () => {
    const row = makeCompanyRow({ total_candidate: "42" });
    mockFindFirst.mockResolvedValue(row);

    const result = await actions.getAgency(7);
    expect(result!.total_candidate).toBe(42);
  });

  it("sets total_candidate to null when null in DB", async () => {
    const row = makeCompanyRow({ total_candidate: null });
    mockFindFirst.mockResolvedValue(row);

    const result = await actions.getAgency(7);
    expect(result!.total_candidate).toBeNull();
  });

  it("requires candidate.read.own capability", async () => {
    mockFindFirst.mockResolvedValue(makeCompanyRow());
    await actions.getAgency(7);
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.read.own",
    );
  });
});

describe("updateAgency action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "candidate",
      id: "1",
      name: "Test",
      email: "test@test.com",
      issuedAt: Date.now(),
    });
  });

  it("updates a company successfully", async () => {
    mockFindFirst
      .mockResolvedValueOnce({ company_id: 1 }) // existing check
      .mockResolvedValueOnce(null); // no duplicate

    const result = (await actions.updateAgency({
      companyId: 1,
      companyName: "Updated Agency",
      companyEmail: "new@example.com",
    })) as AgencyActionResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.companyId).toBe(1);
    }
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { company_id: 1 },
      data: expect.objectContaining({
        company_name: "Updated Agency",
        company_email: "new@example.com",
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/agencies");
  });

  it("accepts empty optional fields (sets null in update)", async () => {
    mockFindFirst
      .mockResolvedValueOnce({ company_id: 1 })
      .mockResolvedValueOnce(null);

    await actions.updateAgency({
      companyId: 1,
      companyName: "Minimal Agency",
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { company_id: 1 },
      data: expect.objectContaining({
        company_name: "Minimal Agency",
        company_email: null,
        company_website: null,
        commercial_licence: null,
      }),
    });
  });

  it("returns error when company not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const result = (await actions.updateAgency({
      companyId: 999,
      companyName: "Ghost Agency",
    })) as AgencyActionResult;

    expect(result).toEqual({ success: false, error: "Agency not found" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on duplicate name", async () => {
    mockFindFirst
      .mockResolvedValueOnce({ company_id: 1 })
      .mockResolvedValueOnce({ company_id: 2 });

    const result = (await actions.updateAgency({
      companyId: 1,
      companyName: "Duplicate Name",
    })) as AgencyActionResult;

    expect(result).toEqual({
      success: false,
      error: "An agency with this name already exists",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid input", async () => {
    const result = (await actions.updateAgency({
      companyId: 1,
      companyName: "",
    })) as AgencyActionResult & { success: false };

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("requires candidate.profile.edit capability", async () => {
    mockFindFirst
      .mockResolvedValueOnce({ company_id: 1 })
      .mockResolvedValueOnce(null);

    await actions.updateAgency({
      companyId: 1,
      companyName: "Test",
    });

    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
  });
});

describe("deleteAgency action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "candidate",
      id: "1",
      name: "Test",
      email: "test@test.com",
      issuedAt: Date.now(),
    });
  });

  it("soft-deletes a company successfully", async () => {
    mockFindFirst.mockResolvedValue({ company_id: 7 });

    const result = (await actions.deleteAgency(7)) as AgencyActionResult;

    expect(result).toEqual({ success: true, companyId: 7 });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { company_id: 7 },
      data: expect.objectContaining({ deleted: 1 }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/agencies");
  });

  it("returns error when company not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = (await actions.deleteAgency(999)) as AgencyActionResult;

    expect(result).toEqual({
      success: false,
      error: "Agency not found",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid companyId", async () => {
    const result = (await actions.deleteAgency(0)) as AgencyActionResult;

    expect(result.success).toBe(false);
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("requires candidate.profile.edit capability", async () => {
    mockFindFirst.mockResolvedValue({ company_id: 1 });

    await actions.deleteAgency(1);

    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
  });
});
