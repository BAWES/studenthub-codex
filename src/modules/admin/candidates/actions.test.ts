import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailObjectOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityCan,
  mockRevalidatePathCan,
  mockFindManyCan,
  mockCountCan,
  mockFindFirstCan,
  mockCreateCan,
  mockUpdateCan,
} = vi.hoisted(() => ({
  mockRequireCapabilityCan: vi.fn(),
  mockRevalidatePathCan: vi.fn(),
  mockFindManyCan: vi.fn(),
  mockCountCan: vi.fn(),
  mockFindFirstCan: vi.fn(),
  mockCreateCan: vi.fn(),
  mockUpdateCan: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityCan,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePathCan,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findMany: mockFindManyCan,
      count: mockCountCan,
      findFirst: mockFindFirstCan,
      create: mockCreateCan,
      update: mockUpdateCan,
    },
  },
}));

import { listCandidates, getCandidate, searchCandidates, createCandidate, updateCandidate, deleteCandidate } from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listCandidatesSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCandidatesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listCandidatesSchema.safeParse({ page: "2", limit: "15" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
    }
  });
});

describe("getCandidateSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });
});

describe("searchCandidatesSchema", () => {
  it("accepts a search query", () => {
    const r = searchCandidatesSchema.safeParse({ q: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Ahmed");
    }
  });

  it("accepts a search query with pagination", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test", page: 1, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("test");
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts an email search", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test@example.com" });
    expect(r.success).toBe(true);
  });

  it("rejects empty query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects whitespace-only query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "   " }).success).toBe(false);
  });

  it("rejects query over 100 chars", () => {
    expect(searchCandidatesSchema.safeParse({ q: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects missing query", () => {
    expect(searchCandidatesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", limit: 200 }).success).toBe(false);
  });
});

describe("createCandidateSchema", () => {
  it("accepts valid candidate creation data", () => {
    const r = createCandidateSchema.safeParse({ name: "Ahmed", email: "ahmed@example.com" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed");
      expect(r.data.email).toBe("ahmed@example.com");
      expect(r.data.nameAr).toBe("");
      expect(r.data.phone).toBe("");
    }
  });

  it("rejects missing name", () => {
    expect(createCandidateSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createCandidateSchema.safeParse({ name: "", email: "a@b.com" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createCandidateSchema.safeParse({ name: "Test", email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(createCandidateSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(createCandidateSchema.safeParse({ name: "x".repeat(256), email: "a@b.com" }).success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      nameAr: "أحمد علي",
      email: "ahmed@example.com",
      phone: "+96512345678",
      countryId: 1,
      universityId: 5,
      bankId: 3,
      bankAccountName: "Ahmed",
      iban: "KW123456",
      civilId: "123456789012",
      objective: "Looking for work",
      intro: "Experienced dev",
      address: "Kuwait City",
      birthDate: "1990-01-15",
      gender: 1,
      hourlyRate: 2.5,
    });
    expect(r.success).toBe(true);
  });

  it("accepts coerce string numbers", () => {
    const r = createCandidateSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      countryId: "2",
      hourlyRate: "3.5",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.countryId).toBe(2);
      expect(r.data.hourlyRate).toBe(3.5);
    }
  });

  it("rejects gender out of range", () => {
    expect(
      createCandidateSchema.safeParse({ name: "T", email: "a@b.com", gender: 5 }).success,
    ).toBe(false);
  });
});

describe("updateCandidateSchema", () => {
  it("accepts a valid update with candidateId only", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("accepts partial field updates", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      name: "New Name",
      email: "new@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("accepts status update", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 1, status: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(20);
    }
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("accepts nullable fields", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      phone: null,
      countryId: null,
      bankId: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email in update", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, email: "bad" }).success,
    ).toBe(false);
  });

  it("coerces candidateId from string", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });
});

describe("deleteCandidateSchema", () => {
  it("accepts a valid candidate ID", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("rejects zero candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("coerces candidateId from string", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: "77" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(77);
    }
  });

  it("rejects non-numeric candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  const validRow = {
    candidate_id: 1,
    name: "Ahmed Ali",
    name_ar: "أحمد علي",
    email: "ahmed@example.com",
    phone: "+965 1234 5678",
    status: 10,
    store_name: "Main Store",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-06-01T00:00:00.000Z",
  };

  it("accepts a valid candidate row", () => {
    expect(candidateRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        phone: null,
        store_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow, status: "active" }).success,
    ).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  const valid = {
    items: [
      {
        candidate_id: 1,
        name: "Ahmed",
        name_ar: "",
        email: "a@b.com",
        phone: null,
        status: 10,
        store_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list response", () => {
    expect(candidateListOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...valid, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing items", () => {
    const { items, ...rest } = valid;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  const validDetail = {
    candidate: {
      candidate_id: 1,
      candidate_name: "Ahmed Ali",
      candidate_name_ar: "أحمد علي",
      candidate_email: "ahmed@example.com",
      candidate_phone: "+965 1234 5678",
      candidate_status: 10,
      candidate_gender: 1,
      candidate_birth_date: "1990-01-15T00:00:00.000Z",
      candidate_hourly_rate: 2.5,
      currency_code: "KWD",
      candidate_created_at: "2024-01-01T00:00:00.000Z",
      candidate_updated_at: "2024-06-01T00:00:00.000Z",
      store: { store_name: "Main Store" },
      country: { country_name_en: "Kuwait" },
    },
    metrics: [
      { label: "Status", value: 10, note: "Active" },
    ],
  };

  it("accepts a valid candidate detail", () => {
    expect(candidateDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null candidate (not found)", () => {
    expect(
      candidateDetailOutputSchema.safeParse({ candidate: null, metrics: [] }).success,
    ).toBe(true);
  });

  it("rejects missing candidate object", () => {
    expect(candidateDetailOutputSchema.safeParse({ metrics: [] }).success).toBe(false);
  });

  it("rejects wrong metric shape", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        candidate: null,
        metrics: [{ bad: "field" }],
      }).success,
    ).toBe(false);
  });
});

describe("candidateActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: true as const,
        candidateId: 42,
      }).success,
    ).toBe(true);
  });

  it("accepts failure result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: false as const,
        error: "Candidate not found",
      }).success,
    ).toBe(true);
  });

  it("rejects success without candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects failure without error", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: true,
        candidateId: "abc",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Runtime tests with mocked Prisma
// ---------------------------------------------------------------------------

describe("listCandidates — runtime", () => {
  const MOCK_CANDIDATES = [
    {
      candidate_id: 1,
      candidate_name: "Ahmed Al-Sabah",
      candidate_name_ar: null,
      candidate_email: "ahmed@example.com",
      candidate_phone: null,
      candidate_status: 10,
      candidate_created_at: new Date("2026-06-01"),
      candidate_updated_at: new Date("2026-06-10"),
      store: { store_name: "Main Store" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockFindManyCan.mockResolvedValue(MOCK_CANDIDATES);
    mockCountCan.mockResolvedValue(1);
  });

  it("returns paginated candidate list", async () => {
    const result = await listCandidates({});
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  it("calls requireCapability with admin.system", async () => {
    await listCandidates({});
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("applies status filter", async () => {
    await listCandidates({ status: 10 });
    expect(mockFindManyCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ candidate_status: 10 }),
      }),
    );
  });

  it("applies search query filter", async () => {
    await listCandidates({ q: "Ahmed" });
    expect(mockFindManyCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ candidate_name: { contains: "Ahmed" } }),
          ]),
        }),
      }),
    );
  });

  it("applies storeId filter", async () => {
    await listCandidates({ storeId: 5 });
    expect(mockFindManyCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ store_id: 5 }),
      }),
    );
  });

  it("maps candidate to CandidateRow format", async () => {
    const result = await listCandidates({});
    const item = result.items[0];
    expect(item.name).toBe("Ahmed Al-Sabah");
    expect(item.email).toBe("ahmed@example.com");
    expect(item.store_name).toBe("Main Store");
  });

  it("returns empty result on invalid input", async () => {
    const result = await listCandidates({ page: -1 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getCandidate — runtime", () => {
  const MOCK_CANDIDATE = {
    candidate_id: 1,
    candidate_name: "Ahmed Al-Sabah",
    candidate_name_ar: null,
    candidate_email: "ahmed@example.com",
    candidate_phone: "50000000",
    candidate_status: 10,
    candidate_gender: null,
    candidate_birth_date: null,
    candidate_hourly_rate: null,
    currency_code: null,
    candidate_created_at: new Date("2026-06-01"),
    candidate_updated_at: new Date("2026-06-10"),
    store: null,
    country: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockFindFirstCan.mockResolvedValue(MOCK_CANDIDATE);
  });

  it("returns candidate detail when found", async () => {
    const result = await getCandidate(1);
    expect(result.candidate).not.toBeNull();
    expect(result.candidate!.candidate_id).toBe(1);
  });

  it("calls requireCapability with admin.system", async () => {
    await getCandidate(1);
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("queries with deleted:0 filter", async () => {
    await getCandidate(1);
    expect(mockFindFirstCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ candidate_id: 1, deleted: 0 }),
      }),
    );
  });

  it("returns null candidate when not found", async () => {
    mockFindFirstCan.mockResolvedValue(null);
    const result = await getCandidate(999);
    expect(result.candidate).toBeNull();
  });

  it("throws on invalid input (zero ID)", async () => {
    await expect(getCandidate(0)).rejects.toThrow();
  });
});

describe("searchCandidates — runtime", () => {
  const MOCK_RESULTS = [
    {
      candidate_id: 1,
      candidate_name: "Ahmed Al-Sabah",
      candidate_name_ar: null,
      candidate_email: "ahmed@example.com",
      candidate_phone: null,
      candidate_status: 10,
      candidate_created_at: new Date("2026-06-01"),
      candidate_updated_at: new Date("2026-06-10"),
      store: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockFindManyCan.mockResolvedValue(MOCK_RESULTS);
    mockCountCan.mockResolvedValue(1);
  });

  it("returns matching candidates", async () => {
    const result = await searchCandidates({ q: "Ahmed" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("Ahmed Al-Sabah");
  });

  it("calls requireCapability with admin.system", async () => {
    await searchCandidates({ q: "test" });
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("returns empty result on invalid input", async () => {
    const result = await searchCandidates({ q: "" } as any);
    expect(result.items).toEqual([]);
  });
});

describe("createCandidate — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockCreateCan.mockResolvedValue({ candidate_id: 1 });
  });

  it("creates candidate and returns success with candidateId", async () => {
    const result = await createCandidate({
      name: "New Candidate",
      email: "new@example.com",
    });
    expect(result.success).toBe(true);
    expect((result as any).candidateId).toBe(1);
  });

  it("calls requireCapability with admin.system", async () => {
    await createCandidate({
      name: "Test",
      email: "test@test.com",
    });
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("re-validates /admin/candidates on success", async () => {
    await createCandidate({
      name: "Test",
      email: "test@test.com",
    });
    expect(mockRevalidatePathCan).toHaveBeenCalledWith("/admin/candidates");
  });

  it("returns error on validation failure", async () => {
    const result = await createCandidate({} as any);
    expect(result.success).toBe(false);
    expect((result as any).error).toBeDefined();
  });
});

describe("updateCandidate — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockFindFirstCan.mockResolvedValue({ candidate_id: 1 });
    mockUpdateCan.mockResolvedValue({ candidate_id: 1 });
  });

  it("updates candidate and returns success", async () => {
    const result = await updateCandidate({
      candidateId: 1,
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
    expect((result as any).candidateId).toBe(1);
  });

  it("calls requireCapability with admin.system", async () => {
    await updateCandidate({ candidateId: 1, name: "New" });
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("checks candidate exists before update", async () => {
    await updateCandidate({ candidateId: 1 });
    expect(mockFindFirstCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ candidate_id: 1 }),
      }),
    );
  });

  it("returns error when candidate not found", async () => {
    mockFindFirstCan.mockResolvedValue(null);
    const result = await updateCandidate({ candidateId: 999 });
    expect(result.success).toBe(false);
    expect((result as any).error).toContain("not found");
  });

  it("re-validates /admin/candidates on success", async () => {
    await updateCandidate({ candidateId: 1, name: "New" });
    expect(mockRevalidatePathCan).toHaveBeenCalledWith("/admin/candidates");
  });
});

describe("deleteCandidate — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityCan.mockResolvedValue(undefined);
    mockFindFirstCan.mockResolvedValue({ candidate_id: 1 });
    mockUpdateCan.mockResolvedValue({ candidate_id: 1 });
  });

  it("soft-deletes candidate and returns success", async () => {
    const result = await deleteCandidate({ candidateId: 1 });
    expect(result.success).toBe(true);
  });

  it("calls requireCapability with admin.system", async () => {
    await deleteCandidate({ candidateId: 1 });
    expect(mockRequireCapabilityCan).toHaveBeenCalledWith("admin.system");
  });

  it("marks as deleted=1", async () => {
    await deleteCandidate({ candidateId: 1 });
    expect(mockUpdateCan).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 1 },
        data: expect.objectContaining({ deleted: 1 }),
      }),
    );
  });

  it("returns error when candidate not found", async () => {
    mockFindFirstCan.mockResolvedValue(null);
    const result = await deleteCandidate({ candidateId: 999 });
    expect(result.success).toBe(false);
    expect((result as any).error).toContain("not found");
  });
});
