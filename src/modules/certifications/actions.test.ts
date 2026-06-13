import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted() because vi.mock factories are hoisted
// ---------------------------------------------------------------------------

const {
  mockFindMany,
  mockFindFirst,
  mockCreate,
  mockUpdate,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_certification: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock calls)
// ---------------------------------------------------------------------------

import {
  listCandidateCertifications,
  getCandidateCertification,
  createCandidateCertification,
  updateCandidateCertification,
  deleteCandidateCertification,
} from "./actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Factory for a minimal Prisma row. */
function makeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    certification_id: 1,
    candidate_id: 42,
    certification_name: "AWS Certified Developer",
    issuing_organization: "Amazon Web Services",
    issue_date: new Date("2024-01-15"),
    expiry_date: new Date("2027-01-15"),
    credential_id: "AWS-DVP-12345",
    credential_url: "https://aws.amazon.com/verify/12345",
    description: "Associate-level cloud certification",
    deleted: 0,
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: new Date("2024-01-15T10:00:00Z"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// listCandidateCertifications
// ---------------------------------------------------------------------------

describe("listCandidateCertifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([makeRow()]);
  });

  it("returns a list of certifications with default pagination", async () => {
    const result = await listCandidateCertifications(42);
    expect(result).toHaveLength(1);
    expect(result[0].certification_name).toBe("AWS Certified Developer");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
        skip: 0,
        take: 20,
        orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
      }),
    );
  });

  it("applies custom pagination params", async () => {
    await listCandidateCertifications(42, { page: 3, limit: 10 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty array when no certifications exist", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await listCandidateCertifications(99);
    expect(result).toEqual([]);
  });

  it("throws on invalid page param", async () => {
    await expect(
      listCandidateCertifications(42, { page: 0 }),
    ).rejects.toThrow();
  });

  it("throws on invalid limit param", async () => {
    await expect(
      listCandidateCertifications(42, { limit: 101 }),
    ).rejects.toThrow();
  });

  it("maps each result through the output schema", async () => {
    const row = makeRow({
      certification_name: "Google Cloud Architect",
      issuing_organization: "Google Cloud",
    });
    mockFindMany.mockResolvedValue([row]);
    const result = await listCandidateCertifications(42);
    expect(result[0].certification_name).toBe("Google Cloud Architect");
    expect(result[0].issuing_organization).toBe("Google Cloud");
  });
});

// ---------------------------------------------------------------------------
// getCandidateCertification
// ---------------------------------------------------------------------------

describe("getCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a certification when found", async () => {
    mockFindFirst.mockResolvedValue(makeRow());
    const result = await getCandidateCertification(42, 1);
    expect(result).not.toBeNull();
    expect(result!.certification_id).toBe(1);
    expect(result!.certification_name).toBe("AWS Certified Developer");
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          certification_id: 1,
          candidate_id: 42,
          deleted: 0,
        },
      }),
    );
  });

  it("returns null when certification not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getCandidateCertification(42, 999);
    expect(result).toBeNull();
  });

  it("returns null when certification belongs to another candidate", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getCandidateCertification(99, 1);
    expect(result).toBeNull();
  });

  it("throws on invalid certificationId", async () => {
    await expect(
      getCandidateCertification(42, -1),
    ).rejects.toThrow("Certification ID is required");
  });

  it("throws on missing certificationId", async () => {
    await expect(
      getCandidateCertification(42, 0),
    ).rejects.toThrow("Certification ID is required");
  });
});

// ---------------------------------------------------------------------------
// createCandidateCertification
// ---------------------------------------------------------------------------

describe("createCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue(makeRow({ certification_id: 2 }));
  });

  it("successfully creates a certification with all fields", async () => {
    const result = await createCandidateCertification(42, {
      certificationName: "AWS Certified Developer",
      issuingOrganization: "Amazon Web Services",
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      credentialId: "AWS-DVP-12345",
      credentialUrl: "https://aws.amazon.com/verify/12345",
      description: "Associate-level cloud certification",
    });
    expect(result).toEqual({ success: true, certificationId: 2 });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 42,
          certification_name: "AWS Certified Developer",
          issuing_organization: "Amazon Web Services",
          deleted: 0,
        }),
      }),
    );
  });

  it("creates a certification with only required fields", async () => {
    mockCreate.mockResolvedValue(makeRow({ certification_id: 3 }));
    const result = await createCandidateCertification(42, {
      certificationName: "CompTIA Security+",
      issuingOrganization: "CompTIA",
    });
    expect(result).toEqual({ success: true, certificationId: 3 });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 42,
          certification_name: "CompTIA Security+",
          credential_id: null,
          credential_url: null,
          description: null,
        }),
      }),
    );
  });

  it("trims whitespace from name and organization", async () => {
    mockCreate.mockResolvedValue(makeRow({ certification_id: 4 }));
    const result = await createCandidateCertification(42, {
      certificationName: "  PMP  ",
      issuingOrganization: "  PMI  ",
    });
    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certification_name: "PMP",
          issuing_organization: "PMI",
        }),
      }),
    );
  });

  it("rejects empty certification name", async () => {
    const result = await createCandidateCertification(42, {
      certificationName: "",
      issuingOrganization: "PMI",
    });
    expect(result).toEqual({
      success: false,
      error: "Certification name is required",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects empty issuing organization", async () => {
    const result = await createCandidateCertification(42, {
      certificationName: "PMP",
      issuingOrganization: "",
    });
    expect(result.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects name exceeding 255 characters", async () => {
    const result = await createCandidateCertification(42, {
      certificationName: "A".repeat(256),
      issuingOrganization: "PMI",
    });
    expect(result.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid credential URL", async () => {
    const result = await createCandidateCertification(42, {
      certificationName: "Test",
      issuingOrganization: "Org",
      credentialUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("accepts empty credentialUrl string", async () => {
    mockCreate.mockResolvedValue(makeRow({ certification_id: 5 }));
    const result = await createCandidateCertification(42, {
      certificationName: "Test",
      issuingOrganization: "Org",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("sets timestamps on create", async () => {
    await createCandidateCertification(42, {
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    const call = mockCreate.mock.calls[0][0];
    expect(call.data.created_at).toBeInstanceOf(Date);
    expect(call.data.updated_at).toBeInstanceOf(Date);
    expect(call.data.created_at.getTime()).toBe(call.data.updated_at.getTime());
  });

  it("handles null issueDate and expiryDate", async () => {
    mockCreate.mockResolvedValue(makeRow({ certification_id: 6 }));
    const result = await createCandidateCertification(42, {
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          issue_date: null,
          expiry_date: null,
        }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// updateCandidateCertification
// ---------------------------------------------------------------------------

describe("updateCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ certification_id: 1 });
    mockUpdate.mockResolvedValue(makeRow());
  });

  it("successfully updates a certification", async () => {
    const result = await updateCandidateCertification(42, {
      certificationId: 1,
      certificationName: "AWS Certified Developer - Associate",
      issuingOrganization: "Amazon Web Services",
    });
    expect(result).toEqual({ success: true, certificationId: 1 });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { certification_id: 1, candidate_id: 42, deleted: 0 },
        select: { certification_id: true },
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { certification_id: 1 },
        data: expect.objectContaining({
          certification_name: "AWS Certified Developer - Associate",
        }),
      }),
    );
  });

  it("returns error when certification not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await updateCandidateCertification(42, {
      certificationId: 999,
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    expect(result).toEqual({
      success: false,
      error: "Certification not found or access denied",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when certification belongs to another candidate", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await updateCandidateCertification(99, {
      certificationId: 1,
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects invalid certificationId", async () => {
    const result = await updateCandidateCertification(42, {
      certificationId: 0,
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects empty certification name on update", async () => {
    const result = await updateCandidateCertification(42, {
      certificationId: 1,
      certificationName: "",
      issuingOrganization: "Org",
    });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("trims whitespace on update", async () => {
    const result = await updateCandidateCertification(42, {
      certificationId: 1,
      certificationName: "  Updated Name  ",
      issuingOrganization: "  Updated Org  ",
    });
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certification_name: "Updated Name",
          issuing_organization: "Updated Org",
        }),
      }),
    );
  });

  it("updates updated_at timestamp", async () => {
    await updateCandidateCertification(42, {
      certificationId: 1,
      certificationName: "Test",
      issuingOrganization: "Org",
    });
    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.updated_at).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateCertification
// ---------------------------------------------------------------------------

describe("deleteCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ certification_id: 1 });
    mockUpdate.mockResolvedValue(makeRow());
  });

  it("soft-deletes a certification", async () => {
    const result = await deleteCandidateCertification(42, 1);
    expect(result).toEqual({ success: true, certificationId: 1 });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { certification_id: 1, candidate_id: 42, deleted: 0 },
        select: { certification_id: true },
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { certification_id: 1 },
        data: { deleted: 1 },
      }),
    );
  });

  it("returns error when certification not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await deleteCandidateCertification(42, 999);
    expect(result).toEqual({
      success: false,
      error: "Certification not found or access denied",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when certification belongs to another candidate", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await deleteCandidateCertification(99, 1);
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects invalid certificationId", async () => {
    const result = await deleteCandidateCertification(42, -1);
    expect(result).toEqual({ success: false, error: "Invalid certification ID" });
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects zero certificationId", async () => {
    const result = await deleteCandidateCertification(42, 0);
    expect(result.success).toBe(false);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
