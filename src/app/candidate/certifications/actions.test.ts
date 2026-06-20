import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listCertificationsSchema,
  getCertificationSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
  type CertificationItem,
  type CertificationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mocks for server action tests
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_certification: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Dynamic imports — must happen after vi.mock calls are hoisted
const mockSession = async () => {
  const { requireRoleCapability } = await import("@/modules/auth/session");
  return requireRoleCapability as unknown as ReturnType<typeof vi.fn>;
};

const mockPrisma = async () => {
  const { prisma } = await import("@/lib/prisma");
  return prisma.candidate_certification;
};

// ---------------------------------------------------------------------------
// listCertificationsSchema
// ---------------------------------------------------------------------------

describe("listCertificationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listCertificationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listCertificationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCertificationsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCertificationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCertificationsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const result = listCertificationsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// getCertificationSchema
// ---------------------------------------------------------------------------

describe("getCertificationSchema", () => {
  it("accepts a valid certification ID", () => {
    const result = getCertificationSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("coerces string certification ID to number", () => {
    const result = getCertificationSchema.safeParse({ certificationId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certification ID", () => {
    expect(getCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero certification ID", () => {
    expect(getCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });

  it("rejects negative certification ID", () => {
    expect(getCertificationSchema.safeParse({ certificationId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCertificationSchema
// ---------------------------------------------------------------------------

describe("createCertificationSchema", () => {
  it("accepts valid minimal data", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified");
      expect(result.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("accepts full data with optional fields", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified Solutions Architect",
      issuingOrganization: "Amazon Web Services",
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      credentialId: "AWS-12345",
      credentialUrl: "https://aws.amazon.com/verify/12345",
      description: "Professional-level cloud architecture certification",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified Solutions Architect");
      expect(result.data.credentialUrl).toBe("https://aws.amazon.com/verify/12345");
    }
  });

  it("rejects missing certification name", () => {
    const result = createCertificationSchema.safeParse({
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty certification name", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "",
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing issuing organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "x".repeat(256),
      issuingOrganization: "Amazon",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and organization", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "  AWS Certified  ",
      issuingOrganization: "  Amazon  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationName).toBe("AWS Certified");
      expect(result.data.issuingOrganization).toBe("Amazon");
    }
  });

  it("rejects invalid credential URL", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      credentialUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string credential URL", () => {
    const result = createCertificationSchema.safeParse({
      certificationName: "AWS Certified",
      issuingOrganization: "Amazon",
      credentialUrl: "",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateCertificationSchema
// ---------------------------------------------------------------------------

describe("updateCertificationSchema", () => {
  it("accepts valid update data", () => {
    const result = updateCertificationSchema.safeParse({
      certificationId: 1,
      certificationName: "Updated Cert",
      issuingOrganization: "Updated Org",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(1);
    }
  });

  it("rejects missing certification ID", () => {
    expect(updateCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certification ID", () => {
    expect(updateCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCertificationSchema
// ---------------------------------------------------------------------------

describe("deleteCertificationSchema", () => {
  it("accepts a valid certification ID", () => {
    const result = deleteCertificationSchema.safeParse({ certificationId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificationId).toBe(42);
    }
  });

  it("rejects missing certification ID", () => {
    expect(deleteCertificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero ID", () => {
    expect(deleteCertificationSchema.safeParse({ certificationId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CertificationItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CertificationItem = {
      certification_id: 1,
      certification_name: "AWS Certified",
      issuing_organization: "Amazon",
      issue_date: new Date("2024-01-15"),
      expiry_date: new Date("2027-01-15"),
      credential_id: "AWS-12345",
      credential_url: "https://aws.amazon.com/verify/12345",
      description: "Professional-level certification",
      created_at: new Date("2024-06-01"),
      updated_at: new Date("2024-06-01"),
    };
    expect(mock.certification_id).toBe(1);
    expect(mock.certification_name).toBe("AWS Certified");
    expect(mock.credential_url).toBe("https://aws.amazon.com/verify/12345");
  });

  it("accepts null optional fields", () => {
    const mock: CertificationItem = {
      certification_id: 2,
      certification_name: "Cert",
      issuing_organization: "Org",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    };
    expect(mock.issue_date).toBeNull();
    expect(mock.credential_url).toBeNull();
  });
});

describe("CertificationActionResult shape", () => {
  it("accepts success result", () => {
    const result: CertificationActionResult = { success: true, certificationId: 42 };
    expect(result.success).toBe(true);
    expect(result.certificationId).toBe(42);
  });

  it("accepts failure result", () => {
    const result: CertificationActionResult = { success: false, error: "Not found" };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not found");
  });
});

// ---------------------------------------------------------------------------
// Server action tests — mocked Prisma + session
// ---------------------------------------------------------------------------

const mockRows = [
  {
    certification_id: 1,
    candidate_id: 42,
    certification_name: "AWS Certified",
    issuing_organization: "Amazon",
    issue_date: new Date("2024-01-15"),
    expiry_date: new Date("2027-01-15"),
    credential_id: "AWS-12345",
    credential_url: "https://aws.amazon.com/verify/12345",
    description: "Professional-level certification",
    deleted: 0,
    created_at: new Date("2024-06-01"),
    updated_at: new Date("2024-06-01"),
  },
  {
    certification_id: 2,
    candidate_id: 42,
    certification_name: "Google Cloud",
    issuing_organization: "Google",
    issue_date: null,
    expiry_date: null,
    credential_id: null,
    credential_url: null,
    description: null,
    deleted: 0,
    created_at: new Date("2024-07-01"),
    updated_at: new Date("2024-07-01"),
  },
];

describe("listCandidateCertifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated certifications for the current candidate", async () => {
    const mockFindMany = (await mockPrisma()).findMany;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindMany).mockResolvedValue(mockRows);

    const { listCandidateCertifications } = await import("./actions");
    const result = await listCandidateCertifications({ page: 1, limit: 20 });

    expect(session).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { candidate_id: 42, deleted: 0 },
      orderBy: [{ created_at: "desc" }, { certification_id: "desc" }],
      skip: 0,
      take: 20,
    });
    expect(result).toHaveLength(2);
    expect(result[0].certification_name).toBe("AWS Certified");
    expect(result[1].certification_name).toBe("Google Cloud");
  });

  it("respects skip/take for page 2", async () => {
    const mockFindMany = (await mockPrisma()).findMany;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindMany).mockResolvedValue([mockRows[0]]);

    const { listCandidateCertifications } = await import("./actions");
    await listCandidateCertifications({ page: 2, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it("returns empty array when no certifications exist", async () => {
    const mockFindMany = (await mockPrisma()).findMany;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindMany).mockResolvedValue([]);

    const { listCandidateCertifications } = await import("./actions");
    const result = await listCandidateCertifications({});

    expect(result).toHaveLength(0);
  });
});

describe("getCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a certification by ID for the current candidate", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue(mockRows[0]);

    const { getCandidateCertification } = await import("./actions");
    const result = await getCandidateCertification(1);

    expect(session).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { certification_id: 1, candidate_id: 42, deleted: 0 },
    });
    expect(result).not.toBeNull();
    expect(result!.certification_name).toBe("AWS Certified");
  });

  it("returns null when certification not found", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue(null);

    const { getCandidateCertification } = await import("./actions");
    const result = await getCandidateCertification(999);

    expect(result).toBeNull();
  });
});

describe("createCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a certification and returns success", async () => {
    const mockCreate = (await mockPrisma()).create;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockCreate).mockResolvedValue({ ...mockRows[0], certification_id: 3 });

    const { createCandidateCertification } = await import("./actions");
    const result = await createCandidateCertification({
      certificationName: "Azure Certified",
      issuingOrganization: "Microsoft",
    });

    expect(session).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(result).toEqual({ success: true, certificationId: 3 });
  });

  it("saves provided optional fields", async () => {
    const mockCreate = (await mockPrisma()).create;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockCreate).mockResolvedValue({ ...mockRows[0], certification_id: 4 });

    const { createCandidateCertification } = await import("./actions");
    const result = await createCandidateCertification({
      certificationName: "Azure Admin",
      issuingOrganization: "Microsoft",
      issueDate: "2024-06-01",
      expiryDate: "2027-06-01",
      credentialId: "MS-999",
      credentialUrl: "https://learn.microsoft.com/verify/999",
      description: "Administrator certification",
    });

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certification_name: "Azure Admin",
          issuing_organization: "Microsoft",
          credential_id: "MS-999",
          credential_url: "https://learn.microsoft.com/verify/999",
        }),
      }),
    );
  });

  it("returns error on invalid input", async () => {
    const { createCandidateCertification } = await import("./actions");
    const result = await createCandidateCertification({
      certificationName: "",
      issuingOrganization: "",
    } as any);

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("error");
  });
});

describe("updateCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an owned certification successfully", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const mockUpdate = (await mockPrisma()).update;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue({ certification_id: 1 } as any);
    vi.mocked(mockUpdate).mockResolvedValue(mockRows[0] as any);

    const { updateCandidateCertification } = await import("./actions");
    const result = await updateCandidateCertification({
      certificationId: 1,
      certificationName: "Updated Name",
      issuingOrganization: "Updated Org",
    });

    expect(session).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { certification_id: 1, candidate_id: 42, deleted: 0 },
      select: { certification_id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { certification_id: 1 },
      data: expect.objectContaining({
        certification_name: "Updated Name",
        issuing_organization: "Updated Org",
      }),
    });
    expect(result).toEqual({ success: true, certificationId: 1 });
  });

  it("returns error when certification not owned", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue(null);

    const { updateCandidateCertification } = await import("./actions");
    const result = await updateCandidateCertification({
      certificationId: 999,
      certificationName: "Hacked",
      issuingOrganization: "Hacker",
    });

    expect(result).toEqual({
      success: false,
      error: "Certification not found or access denied",
    });
  });
});

describe("deleteCandidateCertification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes an owned certification", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const mockUpdate = (await mockPrisma()).update;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue({ certification_id: 1 } as any);

    const { deleteCandidateCertification } = await import("./actions");
    const result = await deleteCandidateCertification(1);

    expect(session).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { certification_id: 1, candidate_id: 42, deleted: 0 },
      select: { certification_id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { certification_id: 1 },
      data: { deleted: 1 },
    });
    expect(result).toEqual({ success: true, certificationId: 1 });
  });

  it("returns error when certification not owned", async () => {
    const mockFindFirst = (await mockPrisma()).findFirst;
    const session = await mockSession();

    vi.mocked(session).mockResolvedValue({ id: "42" });
    vi.mocked(mockFindFirst).mockResolvedValue(null);

    const { deleteCandidateCertification } = await import("./actions");
    const result = await deleteCandidateCertification(999);

    expect(result).toEqual({
      success: false,
      error: "Certification not found or access denied",
    });
  });
});
