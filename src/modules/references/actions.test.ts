import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

import {
  referenceItemSchema,
  referenceListSchema,
  referenceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_reference: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");

// Import the module under test
const mod = await import("./actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockReference = {
  reference_uuid: "ref_abc123",
  candidate_id: 42,
  name: "Dr. Ahmed Al-Sabah",
  company: "Kuwait University",
  position: "Professor",
  phone: "+965 9999 0000",
  email: "ahmed@ku.edu.kw",
  relationship: "Academic advisor",
  deleted: 0,
  created_at: new Date("2026-06-01T10:00:00Z"),
  updated_at: new Date("2026-06-01T10:00:00Z"),
};

const mockReferences = [
  mockReference,
  {
    reference_uuid: "ref_def456",
    candidate_id: 42,
    name: "Fatima Al-Ali",
    company: "Gulf Bank",
    position: "Branch Manager",
    phone: null,
    email: "fatima@gulfbank.com",
    relationship: null,
    deleted: 0,
    created_at: new Date("2026-06-02T14:00:00Z"),
    updated_at: new Date("2026-06-02T14:00:00Z"),
  },
];

// ---------------------------------------------------------------------------
// Input schema validation tests
// ---------------------------------------------------------------------------

describe("listReferencesInputSchema", () => {
  it("accepts empty params (defaults)", () => {
    // Inline schema from actions — we test through exported functions
    // but also validate the defaults directly
    const schema = z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    const r = schema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const schema = z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    const r = schema.safeParse({ page: 3, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects negative page", () => {
    const schema = z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    expect(schema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const schema = z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    expect(schema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string numbers", () => {
    const schema = z.object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    });
    const r = schema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("createReferenceInputSchema", () => {
  it("accepts valid input with all fields", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
      company: z.string().max(255).optional().default("").transform((v) => v.trim()),
      position: z.string().max(255).optional().default("").transform((v) => v.trim()),
      phone: z.string().max(50).optional().default("").transform((v) => v.trim()),
      email: z.string().max(255).email().optional().or(z.literal("")).default(""),
      relationship: z.string().max(255).optional().default("").transform((v) => v.trim()),
    });
    const r = schema.safeParse({
      name: "Dr. Ahmed Al-Sabah",
      company: "Kuwait University",
      position: "Professor",
      phone: "+965 9999 0000",
      email: "ahmed@ku.edu.kw",
      relationship: "Academic advisor",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal input (name only)", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
      company: z.string().max(255).optional().default("").transform((v) => v.trim()),
      position: z.string().max(255).optional().default("").transform((v) => v.trim()),
      phone: z.string().max(50).optional().default("").transform((v) => v.trim()),
      email: z.string().max(255).email().optional().or(z.literal("")).default(""),
      relationship: z.string().max(255).optional().default("").transform((v) => v.trim()),
    });
    const r = schema.safeParse({ name: "Fatima Al-Ali" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Fatima Al-Ali");
      expect(r.data.company).toBe("");
    }
  });

  it("rejects empty name", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
    });
    expect(schema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
      email: z.string().max(255).email().optional().or(z.literal("")).default(""),
    });
    expect(schema.safeParse({ name: "Test", email: "not-an-email" }).success).toBe(false);
  });

  it("accepts empty email as valid", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
      email: z.string().max(255).email().optional().or(z.literal("")).default(""),
    });
    const r = schema.safeParse({ name: "Test", email: "" });
    expect(r.success).toBe(true);
  });

  it("rejects name over 255 chars", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
    });
    expect(schema.safeParse({ name: "x".repeat(256) }).success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const schema = z.object({
      name: z.string().min(1).max(255).transform((v) => v.trim()),
      company: z.string().max(255).optional().default("").transform((v) => v.trim()),
    });
    const r = schema.safeParse({ name: "  Ahmed  ", company: "  KU  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed");
      expect(r.data.company).toBe("KU");
    }
  });
});

describe("getReferenceInputSchema / deleteReferenceInputSchema", () => {
  it("accepts a valid UUID", () => {
    const schema = z.object({
      referenceUuid: z.string().min(1, "Reference UUID is required"),
    });
    expect(schema.safeParse({ referenceUuid: "ref_abc123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const schema = z.object({
      referenceUuid: z.string().min(1, "Reference UUID is required"),
    });
    expect(schema.safeParse({ referenceUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateReferences
// ---------------------------------------------------------------------------

describe("listCandidateReferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    vi.mocked(prisma.candidate_reference.findMany).mockResolvedValue(mockReferences);

    const result = await mod.listCandidateReferences(42, {});

    expect(result).toHaveLength(2);
    expect(result[0].reference_uuid).toBe("ref_abc123");
    expect(result[1].reference_uuid).toBe("ref_def456");
    expect(prisma.candidate_reference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
        skip: 0,
        take: 20,
        orderBy: [{ created_at: "desc" }, { reference_uuid: "desc" }],
      }),
    );
  });

  it("filters by candidate_id for different candidates", async () => {
    vi.mocked(prisma.candidate_reference.findMany).mockResolvedValue([]);

    await mod.listCandidateReferences(99, {});

    expect(prisma.candidate_reference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 99, deleted: 0 },
      }),
    );
  });

  it("handles pagination", async () => {
    vi.mocked(prisma.candidate_reference.findMany).mockResolvedValue([mockReference]);

    await mod.listCandidateReferences(42, { page: 2, limit: 10 });

    expect(prisma.candidate_reference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("returns empty array when no references exist", async () => {
    vi.mocked(prisma.candidate_reference.findMany).mockResolvedValue([]);

    const result = await mod.listCandidateReferences(42, {});

    expect(result).toHaveLength(0);
  });

  it("validates pagination params", async () => {
    await expect(mod.listCandidateReferences(42, { page: -1 })).rejects.toThrow();
    await expect(mod.listCandidateReferences(42, { limit: 200 })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// getCandidateReference
// ---------------------------------------------------------------------------

describe("getCandidateReference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a reference by UUID", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(mockReference);

    const result = await mod.getCandidateReference("ref_abc123");

    expect(result).not.toBeNull();
    expect(result!.reference_uuid).toBe("ref_abc123");
    expect(result!.name).toBe("Dr. Ahmed Al-Sabah");
    expect(prisma.candidate_reference.findFirst).toHaveBeenCalledWith({
      where: { reference_uuid: "ref_abc123", deleted: 0 },
    });
  });

  it("returns null when reference not found", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await mod.getCandidateReference("ref_nonexistent");

    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(mod.getCandidateReference("")).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// createCandidateReference
// ---------------------------------------------------------------------------

describe("createCandidateReference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new reference successfully", async () => {
    vi.mocked(prisma.candidate_reference.create).mockResolvedValue({
      ...mockReference,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await mod.createCandidateReference(42, {
      name: "Dr. Ahmed Al-Sabah",
      company: "Kuwait University",
      position: "Professor",
      phone: "+965 9999 0000",
      email: "ahmed@ku.edu.kw",
      relationship: "Academic advisor",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.referenceUuid).toMatch(/^ref_/);
    }
    expect(prisma.candidate_reference.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_id: 42,
          name: "Dr. Ahmed Al-Sabah",
          company: "Kuwait University",
          position: "Professor",
          phone: "+965 9999 0000",
          email: "ahmed@ku.edu.kw",
          relationship: "Academic advisor",
          deleted: 0,
        }),
      }),
    );
  });

  it("creates a reference with minimal fields", async () => {
    vi.mocked(prisma.candidate_reference.create).mockResolvedValue({
      ...mockReference,
      name: "Simple Name",
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await mod.createCandidateReference(42, { name: "Simple Name" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.referenceUuid).toMatch(/^ref_/);
    }
    // Optional fields should be stored as null when empty string default
    expect(prisma.candidate_reference.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Simple Name",
          company: null,
          position: null,
          phone: null,
          email: null,
          relationship: null,
        }),
      }),
    );
  });

  it("returns error on validation failure", async () => {
    const result = await mod.createCandidateReference(42, { name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(prisma.candidate_reference.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateCandidateReference
// ---------------------------------------------------------------------------

describe("updateCandidateReference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a reference successfully", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue({
      reference_uuid: "ref_abc123",
    } as any);
    vi.mocked(prisma.candidate_reference.update).mockResolvedValue({
      ...mockReference,
      company: "KISR",
      updated_at: new Date(),
    });

    const result = await mod.updateCandidateReference(42, {
      referenceUuid: "ref_abc123",
      name: "Dr. Ahmed Al-Sabah",
      company: "KISR",
      position: "Professor",
      phone: "+965 9999 0000",
      email: "ahmed@ku.edu.kw",
      relationship: "Academic advisor",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.referenceUuid).toBe("ref_abc123");
    }
    expect(prisma.candidate_reference.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reference_uuid: "ref_abc123" },
        data: expect.objectContaining({
          company: "KISR",
        }),
      }),
    );
  });

  it("returns error when reference not found", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await mod.updateCandidateReference(42, {
      referenceUuid: "ref_nonexistent",
      name: "Test",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/not found|access denied/i);
    }
    expect(prisma.candidate_reference.update).not.toHaveBeenCalled();
  });

  it("verifies candidate ownership", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await mod.updateCandidateReference(99, {
      referenceUuid: "ref_abc123",
      name: "Hacker",
    });

    expect(result.success).toBe(false);
    expect(prisma.candidate_reference.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reference_uuid: "ref_abc123", candidate_id: 99, deleted: 0 },
      }),
    );
  });

  it("returns error on validation failure", async () => {
    const result = await mod.updateCandidateReference(42, {
      referenceUuid: "",
      name: "Test",
    });

    expect(result.success).toBe(false);
    expect(prisma.candidate_reference.findFirst).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateReference
// ---------------------------------------------------------------------------

describe("deleteCandidateReference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes a reference successfully", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue({
      reference_uuid: "ref_abc123",
    } as any);
    vi.mocked(prisma.candidate_reference.update).mockResolvedValue({
      ...mockReference,
      deleted: 1,
    });

    const result = await mod.deleteCandidateReference("ref_abc123", 42);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.referenceUuid).toBe("ref_abc123");
    }
    expect(prisma.candidate_reference.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reference_uuid: "ref_abc123" },
        data: { deleted: 1 },
      }),
    );
  });

  it("returns error when reference not found", async () => {
    vi.mocked(prisma.candidate_reference.findFirst).mockResolvedValue(null);

    const result = await mod.deleteCandidateReference("ref_nonexistent", 42);

    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: "Reference record not found or access denied",
    });
    expect(prisma.candidate_reference.update).not.toHaveBeenCalled();
  });

  it("returns error on invalid UUID", async () => {
    const result = await mod.deleteCandidateReference("", 42);

    expect(result.success).toBe(false);
    expect(prisma.candidate_reference.findFirst).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Zod output schema validation
// ---------------------------------------------------------------------------

describe("referenceItemSchema (output)", () => {
  it("validates a complete reference item", () => {
    const item = {
      reference_uuid: "ref_abc123",
      candidate_id: 42,
      name: "Dr. Ahmed Al-Sabah",
      company: "Kuwait University",
      position: "Professor",
      phone: "+965 9999 0000",
      email: "ahmed@ku.edu.kw",
      relationship: "Academic advisor",
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(referenceItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const item = {
      reference_uuid: "ref_abc123",
      candidate_id: null,
      name: "Test",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    };
    expect(referenceItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    expect(
      referenceItemSchema.safeParse({
        candidate_id: 42,
        name: "Test",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "ref_abc123",
        candidate_id: 42,
        name: "",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });
});

describe("referenceListSchema (output)", () => {
  it("validates an array of items", () => {
    const items = [
      {
        reference_uuid: "ref_abc123",
        candidate_id: 42,
        name: "Test 1",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      },
      {
        reference_uuid: "ref_def456",
        candidate_id: 43,
        name: "Test 2",
        company: "Company",
        position: "Role",
        phone: "+965 1234 5678",
        email: "test@example.com",
        relationship: "Colleague",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    expect(referenceListSchema.safeParse(items).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(referenceListSchema.safeParse([]).success).toBe(true);
  });
});

describe("referenceActionResultSchema (output)", () => {
  it("validates a successful result", () => {
    const result = { success: true as const, referenceUuid: "ref_abc123" };
    expect(referenceActionResultSchema.safeParse(result).success).toBe(true);
  });

  it("validates an error result", () => {
    const result = { success: false as const, error: "Something went wrong" };
    expect(referenceActionResultSchema.safeParse(result).success).toBe(true);
  });

  it("rejects success result missing referenceUuid", () => {
    expect(
      referenceActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error result missing error", () => {
    expect(
      referenceActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects ambiguous result without discriminator", () => {
    expect(
      referenceActionResultSchema.safeParse({}).success,
    ).toBe(false);
  });
});
