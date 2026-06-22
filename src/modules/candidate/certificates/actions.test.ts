import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Mock prisma and session before importing the module under test
// ---------------------------------------------------------------------------

const mockFindMany = vi.hoisted(() => vi.fn());
const mockCount = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_certificate: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: unknown[]) =>
    mockRequireRoleCapability(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import AFTER mocks are hoisted
const {
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = await import("./actions");

// Import schemas from the canonical location
import {
  listCertificatesSchema,
  getCertificateSchema,
  createCertificateSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "@/modules/candidates/certificates/schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetMocks() {
  mockFindMany.mockReset();
  mockCount.mockReset();
  mockFindFirst.mockReset();
  mockCreate.mockReset();
  mockUpdate.mockReset();
  mockRequireRoleCapability.mockReset();
  mockRequireRoleCapability.mockResolvedValue({ id: "42", role: "candidate" });
}

function makePrismaRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-06-01");
  return {
    certificate_uuid: crypto.randomUUID(),
    certificate_type: true,
    certificate_title: "AWS Certified Developer",
    certificate_issuer: "Amazon Web Services",
    certificate_url: "https://aws.amazon.com/certification/",
    candidate_id: 42,
    candidate_work_history_id: null,
    exam_uuid: null,
    store_id: null,
    company_id: null,
    parent_company_id: null,
    start_date: null,
    end_date: null,
    staff_id: null,
    created_at: now,
    updated_at: now,
    is_deleted: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema validation tests
// ---------------------------------------------------------------------------

describe("listCertificatesSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listCertificatesSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit when empty", () => {
    const r = listCertificatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listCertificatesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listCertificatesSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });

  it("coerces string page and limit", () => {
    const r = listCertificatesSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getCertificateSchema", () => {
  it("accepts valid UUID string", () => {
    const r = getCertificateSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123");
    }
  });

  it("rejects missing uuid", () => {
    expect(getCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCertificateSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("createCertificateSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = createCertificateSchema.safeParse({
      certificateType: true,
      certificateTitle: "AWS Certified Developer",
      certificateIssuer: "Amazon",
      certificateUrl: "https://aws.amazon.com/certification/",
      startDate: "2024-01-01",
      endDate: "2025-12-31",
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty input (all fields optional)", () => {
    expect(createCertificateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial input with work history reference", () => {
    const r = createCertificateSchema.safeParse({
      candidateWorkHistoryId: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateWorkHistoryId).toBe(10);
    }
  });

  it("rejects non-boolean certificateType", () => {
    expect(
      createCertificateSchema.safeParse({
        certificateType: "yes",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string certificateTitle", () => {
    expect(
      createCertificateSchema.safeParse({
        certificateTitle: 42,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive candidateWorkHistoryId", () => {
    expect(
      createCertificateSchema.safeParse({
        candidateWorkHistoryId: -1,
      }).success,
    ).toBe(false);
  });
});

describe("updateCertificateSchema", () => {
  it("accepts valid update with all fields", () => {
    const r = updateCertificateSchema.safeParse({
      certificateUuid: "abc-123",
      certificateType: true,
      certificateTitle: "Updated Cert",
      certificateIssuer: "Updated Issuer",
      certificateUrl: "https://example.com/cert",
    });
    expect(r.success).toBe(true);
  });

  it("accepts partial update with only cert fields", () => {
    const r = updateCertificateSchema.safeParse({
      certificateUuid: "abc-123",
      certificateTitle: "Just title change",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({ certificateTitle: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      updateCertificateSchema.safeParse({
        certificateUuid: "",
        certificateTitle: "Test",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateSchema", () => {
  it("accepts valid certificate UUID", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "abc-123" })
        .success,
    ).toBe(true);
  });

  it("rejects missing certificateUuid", () => {
    expect(deleteCertificateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty certificateUuid", () => {
    expect(
      deleteCertificateSchema.safeParse({ certificateUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("certificateItemSchema", () => {
  it("accepts a valid certificate item", () => {
    expect(
      certificateItemSchema.safeParse({
        certificate_uuid: "uuid-1",
        certificate_type: true,
        certificate_title: "AWS Certified Developer",
        certificate_issuer: "Amazon",
        certificate_url: null,
        candidate_id: 42,
        candidate_work_history_id: null,
        exam_uuid: null,
        store_id: null,
        company_id: null,
        parent_company_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      }).success,
    ).toBe(true);
  });

  it("accepts item with nullable fields set to values", () => {
    expect(
      certificateItemSchema.safeParse({
        certificate_uuid: "uuid-2",
        certificate_type: false,
        certificate_title: "Cert",
        certificate_issuer: null,
        certificate_url: null,
        candidate_id: 1,
        candidate_work_history_id: 5,
        exam_uuid: "exam-1",
        store_id: 3,
        company_id: 10,
        parent_company_id: null,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        staff_id: 7,
        created_at: new Date(),
        updated_at: new Date(),
      }).success,
    ).toBe(true);
  });

  it("rejects missing required field", () => {
    expect(
      certificateItemSchema.safeParse({
        certificate_uuid: "uuid-3",
      }).success,
    ).toBe(false);
  });
});

describe("listCertificatesResultSchema", () => {
  it("accepts a valid result with zero certificates", () => {
    const r = listCertificatesResultSchema.safeParse({
      certificates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a valid result with one certificate", () => {
    const r = listCertificatesResultSchema.safeParse({
      certificates: [
        {
          certificate_uuid: "uuid-1",
          certificate_type: true,
          certificate_title: "AWS",
          certificate_issuer: null,
          certificate_url: null,
          candidate_id: 1,
          candidate_work_history_id: null,
          exam_uuid: null,
          store_id: null,
          company_id: null,
          parent_company_id: null,
          start_date: null,
          end_date: null,
          staff_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCertificatesResultSchema.safeParse({
        certificates: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong certificates type", () => {
    expect(
      listCertificatesResultSchema.safeParse({
        certificates: "not-array",
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

describe("certificateActionResultSchema", () => {
  it("accepts success result with data", () => {
    const r = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Certificate created",
      data: {
        certificate_uuid: "uuid-1",
        certificate_type: true,
        certificate_title: "AWS",
        certificate_issuer: null,
        certificate_url: null,
        candidate_id: 1,
        candidate_work_history_id: null,
        exam_uuid: null,
        store_id: null,
        company_id: null,
        parent_company_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts success result without data", () => {
    const r = certificateActionResultSchema.safeParse({
      operation: "success",
      message: "Done",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = certificateActionResultSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      certificateActionResultSchema.safeParse({
        operation: "unknown",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      certificateActionResultSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCertificateResultSchema", () => {
  it("accepts success result", () => {
    expect(
      deleteCertificateResultSchema.safeParse({
        operation: "success",
        message: "Deleted",
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      deleteCertificateResultSchema.safeParse({
        operation: "error",
        message: "Not found",
      }).success,
    ).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      deleteCertificateResultSchema.safeParse({
        operation: "unknown",
        message: "test",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Server action tests (with mocked prisma + session)
// ---------------------------------------------------------------------------

describe("listCertificates", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(listCertificates({})).rejects.toThrow("Forbidden");
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.read.own",
    );
  });

  it("returns empty list when no certificates exist", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listCertificates({});
    expect(result.certificates).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(0);
  });

  it("returns mapped certificates from prisma rows", async () => {
    const row = makePrismaRow();
    mockFindMany.mockResolvedValue([row]);
    mockCount.mockResolvedValue(1);

    const result = await listCertificates({});
    expect(result.certificates).toHaveLength(1);
    expect(result.total).toBe(1);

    const item = result.certificates[0];
    expect(item.certificate_uuid).toBe(row.certificate_uuid);
    expect(item.certificate_title).toBe("AWS Certified Developer");
    expect(item.certificate_issuer).toBe("Amazon Web Services");
    expect(item.candidate_id).toBe(42);
  });

  it("queries with correct pagination params", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listCertificates({ page: 2, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, is_deleted: false },
        skip: 10,
        take: 10,
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("computes correct totalPages", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(25);

    const result = await listCertificates({ page: 1, limit: 10 });
    expect(result.totalPages).toBe(3);
  });

  it("passes candidate_id and is_deleted filter to count", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listCertificates({});
    expect(mockCount).toHaveBeenCalledWith({
      where: { candidate_id: 42, is_deleted: false },
    });
  });
});

describe("getCertificate", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(getCertificate("some-uuid")).rejects.toThrow("Forbidden");
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.read.own",
    );
  });

  it("returns null when certificate not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getCertificate("nonexistent-uuid");
    expect(result).toBeNull();
  });

  it("returns mapped certificate when found", async () => {
    const row = makePrismaRow({ certificate_uuid: "found-uuid" });
    mockFindFirst.mockResolvedValue(row);

    const result = await getCertificate("found-uuid");
    expect(result).not.toBeNull();
    expect(result!.certificate_uuid).toBe("found-uuid");
    expect(result!.certificate_title).toBe("AWS Certified Developer");
    expect(result!.candidate_id).toBe(42);
  });

  it("queries scoped to candidate_id and non-deleted", async () => {
    mockFindFirst.mockResolvedValue(null);

    await getCertificate("test-uuid");
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        certificate_uuid: "test-uuid",
        candidate_id: 42,
        is_deleted: false,
      },
    });
  });

  it("throws on invalid empty UUID", async () => {
    await expect(getCertificate("")).rejects.toThrow();
  });
});

describe("createCertificate", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(
      createCertificate({ certificateTitle: "Test" }),
    ).rejects.toThrow("Forbidden");
  });

  it("creates a certificate with title and issuer", async () => {
    const input = {
      certificateType: true,
      certificateTitle: "New Cert",
      certificateIssuer: "Issuer Corp",
    };

    mockCreate.mockResolvedValue(
      makePrismaRow({
        certificate_title: "New Cert",
        certificate_issuer: "Issuer Corp",
        certificate_type: true,
      }),
    );

    const result = await createCertificate(input);
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Certificate created");
    if (result.operation === "success" && result.data) {
      expect(result.data.certificate_title).toBe("New Cert");
      expect(result.data.certificate_issuer).toBe("Issuer Corp");
    }
  });

  it("creates a certificate with all optional fields", async () => {
    const input = {
      certificateType: false,
      certificateTitle: "Full Cert",
      certificateIssuer: "Full Issuer",
      certificateUrl: "https://example.com/cert",
      candidateWorkHistoryId: 5,
      examUuid: "exam-001",
      storeId: 3,
      companyId: 10,
      parentCompanyId: 20,
      startDate: "2024-01-01",
      endDate: "2025-12-31",
    };

    mockCreate.mockResolvedValue(makePrismaRow({
      certificate_title: "Full Cert",
      certificate_issuer: "Full Issuer",
      certificate_url: "https://example.com/cert",
      certificate_type: false,
      candidate_work_history_id: 5,
      exam_uuid: "exam-001",
      store_id: 3,
      company_id: 10,
      parent_company_id: 20,
    }));

    const result = await createCertificate(input);

    // Verify all fields passed to prisma.create
    const createCall = mockCreate.mock.calls[0][0].data;
    expect(createCall.certificate_title).toBe("Full Cert");
    expect(createCall.certificate_url).toBe("https://example.com/cert");
    expect(createCall.candidate_work_history_id).toBe(5);
    expect(createCall.exam_uuid).toBe("exam-001");
    expect(createCall.store_id).toBe(3);
    expect(createCall.company_id).toBe(10);
    expect(createCall.parent_company_id).toBe(20);
    expect(createCall.certificate_uuid).toBeDefined();

    expect(result.operation).toBe("success");
  });

  it("returns validation error for invalid input", async () => {
    const result = await createCertificate({
      certificateType: "not-boolean" as any,
    });
    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("handles prisma error gracefully", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createCertificate({
      certificateTitle: "Will fail",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toContain("DB error");
  });
});

describe("updateCertificate", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(
      updateCertificate({
        certificateUuid: "abc-123",
        certificateTitle: "Updated",
      }),
    ).rejects.toThrow("Forbidden");
  });

  it("returns error when certificate not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await updateCertificate({
      certificateUuid: "nonexistent",
      certificateTitle: "Updated",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Certificate not found");
  });

  it("updates certificate when found", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockResolvedValue(
      makePrismaRow({
        certificate_uuid: "abc-123",
        certificate_title: "Updated Title",
      }),
    );

    const result = await updateCertificate({
      certificateUuid: "abc-123",
      certificateTitle: "Updated Title",
      certificateIssuer: "New Issuer",
    });

    expect(result.operation).toBe("success");
    expect(result.message).toBe("Certificate updated");
    if (result.operation === "success" && result.data) {
      expect(result.data.certificate_title).toBe("Updated Title");
    }
  });

  it("passes update fields to prisma.update", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockResolvedValue(makePrismaRow());

    await updateCertificate({
      certificateUuid: "abc-123",
      certificateType: false,
      certificateTitle: "Title",
      certificateIssuer: "Issuer",
      certificateUrl: "https://example.com",
      companyId: 5,
      storeId: 3,
    });

    const updateData = mockUpdate.mock.calls[0][0].data;
    expect(updateData.certificate_type).toBe(false);
    expect(updateData.certificate_title).toBe("Title");
    expect(updateData.certificate_issuer).toBe("Issuer");
    expect(updateData.certificate_url).toBe("https://example.com");
    expect(updateData.company_id).toBe(5);
    expect(updateData.store_id).toBe(3);
    expect(updateData.updated_at).toBeDefined();
  });

  it("does not pass undefined fields to prisma.update", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockResolvedValue(makePrismaRow());

    await updateCertificate({
      certificateUuid: "abc-123",
      certificateTitle: "Only Title Change",
    });

    const updateData = mockUpdate.mock.calls[0][0].data;
    expect(updateData.certificate_title).toBe("Only Title Change");
    expect(updateData.certificate_type).toBeUndefined();
    expect(updateData.certificate_issuer).toBeUndefined();
  });

  it("handles prisma update error gracefully", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockRejectedValue(new Error("Update failed"));

    const result = await updateCertificate({
      certificateUuid: "abc-123",
      certificateTitle: "Will fail",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Update failed");
  });

  it("verifies ownership before updating", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });

    await updateCertificate({
      certificateUuid: "abc-123",
      certificateTitle: "Updated",
    });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        certificate_uuid: "abc-123",
        candidate_id: 42,
        is_deleted: false,
      },
      select: { certificate_uuid: true },
    });
  });
});

describe("deleteCertificate", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(
      deleteCertificate({ certificateUuid: "abc-123" }),
    ).rejects.toThrow("Forbidden");
  });

  it("returns error when certificate not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await deleteCertificate({
      certificateUuid: "nonexistent",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Certificate not found");
  });

  it("soft-deletes certificate when found", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockResolvedValue({});

    const result = await deleteCertificate({
      certificateUuid: "abc-123",
    });
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Certificate deleted");
  });

  it("sets is_deleted true and updates timestamp", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockResolvedValue({});

    await deleteCertificate({ certificateUuid: "abc-123" });

    const updateData = mockUpdate.mock.calls[0][0].data;
    expect(updateData.is_deleted).toBe(true);
    expect(updateData.updated_at).toBeDefined();
  });

  it("verifies ownership before deleting", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });

    await deleteCertificate({ certificateUuid: "abc-123" });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        certificate_uuid: "abc-123",
        candidate_id: 42,
        is_deleted: false,
      },
      select: { certificate_uuid: true },
    });
  });

  it("handles prisma delete error gracefully", async () => {
    mockFindFirst.mockResolvedValue({ certificate_uuid: "abc-123" });
    mockUpdate.mockRejectedValue(new Error("Delete failed"));

    const result = await deleteCertificate({
      certificateUuid: "abc-123",
    });
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Delete failed");
  });

  it("returns validation error for empty UUID", async () => {
    const result = await deleteCertificate({
      certificateUuid: "",
    });
    expect(result.operation).toBe("error");
  });
});
