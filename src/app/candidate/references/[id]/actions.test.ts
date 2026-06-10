import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReferenceEntrySchema,
  deleteReferenceEntrySchema,
} from "./schemas";
import { updateReferenceSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getReferenceEntrySchema", () => {
  it("accepts a valid reference UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "ref_abc-123" })
        .success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects null UUID", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: null }).success,
    ).toBe(false);
  });
});

describe("deleteReferenceEntrySchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteReferenceEntrySchema.safeParse({ referenceUuid: "ref_xyz" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      deleteReferenceEntrySchema.safeParse({ referenceUuid: "" }).success,
    ).toBe(false);
  });
});

describe("updateReferenceSchema", () => {
  it("accepts valid update data", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "ref_001",
      name: "John Doe",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 5555 1234",
      email: "john@acme.com",
      relationship: "colleague",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal update (name + uuid only)", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "ref_001",
      name: "Jane Doe",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing referenceUuid", () => {
    expect(
      updateReferenceSchema.safeParse({ name: "John" }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateReferenceSchema.safeParse({
        referenceUuid: "ref_001",
        name: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_reference: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../actions", () => ({
  getCandidateReference: vi.fn(),
  updateCandidateReference: vi.fn(),
  deleteCandidateReference: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const parent = await import("../actions");
const actions = await import("./actions");

const mockSession = {
  role: "candidate" as const,
  id: "42",
  name: "Test Candidate",
  email: "candidate@test.local",
  issuedAt: Date.now(),
};

const mockReference = {
  reference_uuid: "ref_001",
  candidate_id: 42,
  name: "John Doe",
  company: "Acme Corp",
  position: "Manager",
  phone: "+965 5555 1234",
  email: "john@acme.com",
  relationship: "colleague",
  deleted: 0,
  created_at: new Date("2026-06-10"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireRoleCapability).mockResolvedValue(mockSession);
});

describe("getReferenceEntry", () => {
  it("returns reference entry for valid UUID", async () => {
    vi.mocked(parent.getCandidateReference).mockResolvedValue(mockReference);

    const result = await actions.getReferenceEntry("ref_001");

    expect(result).toEqual(mockReference);
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.read.own",
    );
    expect(parent.getCandidateReference).toHaveBeenCalledWith("ref_001");
  });

  it("throws on invalid UUID (empty string)", async () => {
    await expect(actions.getReferenceEntry("")).rejects.toThrow();
    expect(parent.getCandidateReference).not.toHaveBeenCalled();
  });

  it("returns null when parent returns null", async () => {
    vi.mocked(parent.getCandidateReference).mockResolvedValue(null);

    const result = await actions.getReferenceEntry("ref_missing");
    expect(result).toBeNull();
  });
});

describe("updateReferenceEntry", () => {
  it("updates reference entry successfully", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(
      mockReference as any,
    );

    const result = await actions.updateReferenceEntry(
      "ref_001",
      "John Updated",
      "New Corp",
    );

    expect(result).toEqual({ success: true });
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
    expect(prisma.candidate_reference.findFirst).toHaveBeenCalledWith({
      where: {
        reference_uuid: "ref_001",
        candidate_id: 42,
        deleted: 0,
      },
      select: { reference_uuid: true },
    });
    expect(parent.updateCandidateReference).toHaveBeenCalledWith({
      referenceUuid: "ref_001",
      name: "John Updated",
      company: "New Corp",
      position: undefined,
      phone: undefined,
      email: undefined,
      relationship: undefined,
    });
  });

  it("returns error when reference not found or access denied", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await actions.updateReferenceEntry(
      "ref_nonexistent",
      "Fake Name",
    );

    expect(result).toEqual({
      success: false,
      error: "Reference entry not found or access denied",
    });
    expect(parent.updateCandidateReference).not.toHaveBeenCalled();
  });

  it("returns error for invalid input (empty UUID)", async () => {
    const result = await actions.updateReferenceEntry("", "John");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(parent.updateCandidateReference).not.toHaveBeenCalled();
  });

  it("returns error for empty name", async () => {
    const result = await actions.updateReferenceEntry("ref_001", "");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("deleteReferenceEntry", () => {
  it("deletes reference entry successfully", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(
      mockReference as any,
    );

    const result = await actions.deleteReferenceEntry("ref_001");

    expect(result).toEqual({ success: true });
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
    expect(parent.deleteCandidateReference).toHaveBeenCalledWith("ref_001");
  });

  it("returns error when reference not found or access denied", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await actions.deleteReferenceEntry("ref_nonexistent");

    expect(result).toEqual({
      success: false,
      error: "Reference entry not found or access denied",
    });
    expect(parent.deleteCandidateReference).not.toHaveBeenCalled();
  });

  it("returns error for invalid input (empty UUID)", async () => {
    const result = await actions.deleteReferenceEntry("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(parent.deleteCandidateReference).not.toHaveBeenCalled();
  });
});
