import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
  type AgencyActionResult,
} from "../schemas";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleGetAgency = vi.fn();
const mockModuleUpdateAgency = vi.fn();
const mockModuleDeleteAgency = vi.fn();

vi.mock("@/modules/candidates/agencies/actions", () => ({
  getAgency: mockModuleGetAgency,
  updateAgency: mockModuleUpdateAgency,
  deleteAgency: mockModuleDeleteAgency,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");
const actions = await import("./actions");

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
// Action tests — delegation verification
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

  it("delegates to module getAgency with correct params", async () => {
    mockModuleGetAgency.mockResolvedValue({
      company_id: 7,
      company_name: "Test Agency",
    });

    const result = await actions.getAgency(7);

    expect(mockModuleGetAgency).toHaveBeenCalledWith({ companyId: 7 });
    expect(result).toEqual({ company_id: 7, company_name: "Test Agency" });
  });

  it("returns null when module returns null", async () => {
    mockModuleGetAgency.mockResolvedValue(null);

    const result = await actions.getAgency(999);
    expect(result).toBeNull();
  });

  it("throws on invalid companyId (non-positive)", async () => {
    await expect(actions.getAgency(0)).rejects.toThrow("Company ID is required");
    expect(mockModuleGetAgency).not.toHaveBeenCalled();
  });

  it("requires candidate.read.own capability", async () => {
    mockModuleGetAgency.mockResolvedValue({ company_id: 7 });
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

  it("delegates to module updateAgency with correct params", async () => {
    mockModuleUpdateAgency.mockResolvedValue({
      success: true,
      companyId: 1,
    });

    const result = (await actions.updateAgency({
      companyId: 1,
      companyName: "Updated Agency",
      companyEmail: "new@example.com",
    })) as AgencyActionResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.companyId).toBe(1);
    }
    expect(mockModuleUpdateAgency).toHaveBeenCalledWith({
      companyId: 1,
      companyName: "Updated Agency",
      companyEmail: "new@example.com",
      companyWebsite: undefined,
      commercialLicence: undefined,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/agencies");
  });

  it("returns error when module returns error", async () => {
    mockModuleUpdateAgency.mockResolvedValue({
      success: false,
      error: "Agency not found",
    });

    const result = (await actions.updateAgency({
      companyId: 999,
      companyName: "Ghost Agency",
    })) as AgencyActionResult;

    expect(result).toEqual({ success: false, error: "Agency not found" });
  });

  it("returns error on invalid input without calling module", async () => {
    const result = (await actions.updateAgency({
      companyId: 1,
      companyName: "",
    })) as AgencyActionResult & { success: false };

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(mockModuleUpdateAgency).not.toHaveBeenCalled();
  });

  it("requires candidate.profile.edit capability", async () => {
    mockModuleUpdateAgency.mockResolvedValue({ success: true, companyId: 1 });

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

  it("delegates to module deleteAgency with correct params", async () => {
    mockModuleDeleteAgency.mockResolvedValue({
      success: true,
      companyId: 7,
    });

    const result = (await actions.deleteAgency(7)) as AgencyActionResult;

    expect(result).toEqual({ success: true, companyId: 7 });
    expect(mockModuleDeleteAgency).toHaveBeenCalledWith({ companyId: 7 });
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/agencies");
  });

  it("returns error when module returns error", async () => {
    mockModuleDeleteAgency.mockResolvedValue({
      success: false,
      error: "Agency not found",
    });

    const result = (await actions.deleteAgency(999)) as AgencyActionResult;

    expect(result).toEqual({ success: false, error: "Agency not found" });
  });

  it("returns error on invalid companyId without calling module", async () => {
    const result = (await actions.deleteAgency(0)) as AgencyActionResult;

    expect(result.success).toBe(false);
    expect(mockModuleDeleteAgency).not.toHaveBeenCalled();
  });

  it("requires candidate.profile.edit capability", async () => {
    mockModuleDeleteAgency.mockResolvedValue({ success: true, companyId: 1 });

    await actions.deleteAgency(1);

    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
  });
});
