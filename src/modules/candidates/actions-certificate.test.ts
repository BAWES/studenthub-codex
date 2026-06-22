import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Mocks — must use vi.hoisted() because vi.mock factories are hoisted
// ---------------------------------------------------------------------------

const {
  mockFindFirst,
  mockCreate,
  mockUpdate,
  mockRequireRoleCapability,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockRequireRoleCapability: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_certificate: {
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock calls)
// ---------------------------------------------------------------------------

import { addCandidateCertificate, removeCandidateCertificate } from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: certificate schema validation
//
// addCandidateCertificate and removeCandidateCertificate in actions.ts use
// this zod schema internally. Testing it separately avoids the need to mock
// "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const certificateSchema = z.object({
  certificate_type: z.enum(["true", "false"]).transform((v) => v === "true"),
  start_date: z.string().max(10).optional(),
  end_date: z.string().max(10).optional(),
});

describe("certificateSchema", () => {
  it("accepts valid certificate with certificate_type=true", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(true);
    }
  });

  it("accepts valid certificate with certificate_type=false", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(false);
    }
  });

  it("rejects invalid certificate_type value", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing certificate_type entirely", () => {
    const result = certificateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional start_date", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      start_date: "2026-01-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.start_date).toBe("2026-01-15");
    }
  });

  it("accepts optional end_date", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      end_date: "2026-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.end_date).toBe("2026-06-01");
    }
  });

  it("accepts both dates", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
      start_date: "2025-09-01",
      end_date: "2026-06-13",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(false);
      expect(result.data.start_date).toBe("2025-09-01");
      expect(result.data.end_date).toBe("2026-06-13");
    }
  });

  it("rejects start_date longer than 10 characters", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      start_date: "2026-01-15T00:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts omitting both dates", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(true);
      expect(result.data.start_date).toBeUndefined();
      expect(result.data.end_date).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// addCandidateCertificate
// ---------------------------------------------------------------------------

describe("addCandidateCertificate", () => {
  const fakeSession = { id: "42", role: "candidate" };
  const mockFormData = (overrides: Record<string, string> = {}) => {
    const defaults: Record<string, string> = {
      certificate_type: "true",
      start_date: "2026-01-15",
      end_date: "2026-06-01",
    };
    const data = { ...defaults, ...overrides };
    return {
      get: (key: string) => data[key] ?? null,
    } as unknown as FormData;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(fakeSession);
    mockCreate.mockResolvedValue({ certificate_uuid: "cert_test_uuid" });
  });

  it("successfully creates a certificate with valid data", async () => {
    const result = await addCandidateCertificate(
      { error: "" },
      mockFormData(),
    );
    expect(result).toEqual({ error: "" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.read.own",
    );
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certificate_uuid: expect.stringContaining("cert_"),
          candidate_id: 42,
          certificate_type: true,
        }),
      }),
    );
  });

  it("creates certificate with certificate_type=false", async () => {
    const result = await addCandidateCertificate(
      { error: "" },
      mockFormData({ certificate_type: "false" }),
    );
    expect(result).toEqual({ error: "" });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certificate_type: false,
        }),
      }),
    );
  });

  it("rejects invalid certificate_type", async () => {
    const result = await addCandidateCertificate(
      { error: "" },
      mockFormData({ certificate_type: "invalid" }),
    );
    expect(result.error).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects missing certificate_type", async () => {
    const result = await addCandidateCertificate(
      { error: "" },
      mockFormData({ certificate_type: "" }),
    );
    expect(result.error).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("accepts certificate without optional dates", async () => {
    const result = await addCandidateCertificate(
      { error: "" },
      mockFormData({ start_date: "", end_date: "" }),
    );
    expect(result).toEqual({ error: "" });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("sets is_deleted to false and timestamps on create", async () => {
    await addCandidateCertificate({ error: "" }, mockFormData());
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          is_deleted: false,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// removeCandidateCertificate
// ---------------------------------------------------------------------------

describe("removeCandidateCertificate", () => {
  const fakeSession = { id: "42", role: "candidate" };
  const mockFormData = (uuid: string) =>
    ({
      get: (key: string) => {
        if (key === "certificateUuid") return uuid;
        return null;
      },
    }) as unknown as FormData;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(fakeSession);
    mockFindFirst.mockResolvedValue({
      certificate_uuid: "existing-uuid",
    });
    mockUpdate.mockResolvedValue({ certificate_uuid: "existing-uuid" });
  });

  it("returns error when certificateUuid is missing", async () => {
    const result = await removeCandidateCertificate(
      { error: "" },
      mockFormData(""),
    );
    expect(result).toEqual({ error: "Missing certificate identifier." });
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when certificate is not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await removeCandidateCertificate(
      { error: "" },
      mockFormData("nonexistent-uuid"),
    );
    expect(result).toEqual({ error: "Certificate not found." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("successfully deletes a certificate", async () => {
    const result = await removeCandidateCertificate(
      { error: "" },
      mockFormData("existing-uuid"),
    );
    expect(result).toEqual({ error: "" });
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          certificate_uuid: "existing-uuid",
          candidate_id: 42,
          is_deleted: false,
        },
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { certificate_uuid: "existing-uuid" },
        data: expect.objectContaining({
          is_deleted: true,
          updated_at: expect.any(Date),
        }),
      }),
    );
  });

  it("checks candidate_id matches session on find", async () => {
    await removeCandidateCertificate(
      { error: "" },
      mockFormData("existing-uuid"),
    );
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          candidate_id: 42,
        }),
      }),
    );
  });
});
