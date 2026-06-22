import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireRoleCapability, mockFindMany, mockCount } = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_education: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

import { listCandidateEducation } from "./actions";
import type { ListCandidateEducationInput } from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateEducation — runtime
// ---------------------------------------------------------------------------
describe("listCandidateEducation — runtime", () => {
  const SAMPLE_ROW = {
    education_uuid: "edu-uuid-1",
    candidate_id: 1,
    candidate: { candidate_name: "Ahmed Al-Sabah" },
    university: { university_name_en: "Kuwait University", university_name_ar: "جامعة الكويت" },
    degree: { degree_name_en: "Bachelor", degree_name_ar: "بكالوريوس" },
    major: { major_name_en: "Computer Science", major_name_ar: "علوم حاسوب" },
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  const EXPECTED_ITEM = {
    education_uuid: "edu-uuid-1",
    candidate_id: 1,
    candidate_name: "Ahmed Al-Sabah",
    university_name: "Kuwait University",
    degree_name: "Bachelor",
    major_name: "Computer Science",
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: SAMPLE_ROW.created_at,
    updated_at: SAMPLE_ROW.updated_at,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([SAMPLE_ROW]);
    mockCount.mockResolvedValue(1);
  });

  it("calls requireRoleCapability with admin, admin.read", async () => {
    await listCandidateEducation({});
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.read");
  });

  it("queries with default pagination when no params given", async () => {
    await listCandidateEducation({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { created_at: "desc" },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({ where: {} });
  });

  it("queries with custom page and limit", async () => {
    await listCandidateEducation({ page: 3, limit: 10 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (page - 1) * limit = (3 - 1) * 10 = 20
        take: 10,
      }),
    );
  });

  it("includes search filter when provided", async () => {
    await listCandidateEducation({ search: "Kuwait" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { candidate: { candidate_name: { contains: "Kuwait" } } },
            { university: { university_name_en: { contains: "Kuwait" } } },
            { university: { university_name_ar: { contains: "Kuwait" } } },
          ],
        },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { candidate: { candidate_name: { contains: "Kuwait" } } },
            { university: { university_name_en: { contains: "Kuwait" } } },
            { university: { university_name_ar: { contains: "Kuwait" } } },
          ],
        },
      }),
    );
  });

  it("returns mapped items with candidate_name and university_name", async () => {
    const result = await listCandidateEducation({});
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(EXPECTED_ITEM);
  });

  it("returns pagination metadata", async () => {
    mockCount.mockResolvedValue(55);
    const result = await listCandidateEducation({ page: 3, limit: 20 });
    expect(result.total).toBe(55);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(3); // ceil(55/20) = 3
  });

  it("uses English name for university when available", async () => {
    const row = {
      ...SAMPLE_ROW,
      university: { university_name_en: "KU", university_name_ar: "جامعة الكويت" },
    };
    mockFindMany.mockResolvedValue([row]);
    const result = await listCandidateEducation({});
    expect(result.items[0].university_name).toBe("KU");
  });

  it("falls back to Arabic name when English name is empty", async () => {
    const row = {
      ...SAMPLE_ROW,
      university: { university_name_en: "", university_name_ar: "جامعة الكويت" },
    };
    mockFindMany.mockResolvedValue([row]);
    const result = await listCandidateEducation({});
    expect(result.items[0].university_name).toBe("جامعة الكويت");
  });

  it("handles null degree and major", async () => {
    const row = {
      ...SAMPLE_ROW,
      degree: null,
      major: null,
    };
    mockFindMany.mockResolvedValue([row]);
    const result = await listCandidateEducation({});
    expect(result.items[0].degree_name).toBeNull();
    expect(result.items[0].major_name).toBeNull();
  });

  it("handles null candidate_name", async () => {
    const row = {
      ...SAMPLE_ROW,
      candidate: null,
    };
    mockFindMany.mockResolvedValue([row]);
    const result = await listCandidateEducation({});
    expect(result.items[0].candidate_name).toBeNull();
  });

  it("returns default empty result on invalid input", async () => {
    const result = await listCandidateEducation({ page: "invalid" } as unknown as ListCandidateEducationInput);
    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  });

  it("returns empty result when no rows found", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    const result = await listCandidateEducation({});
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("includes all relation selects in query", async () => {
    await listCandidateEducation({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          candidate: { select: { candidate_name: true } },
          university: { select: { university_name_en: true, university_name_ar: true } },
          degree: { select: { degree_name_en: true, degree_name_ar: true } },
          major: { select: { major_name_en: true, major_name_ar: true } },
        },
      }),
    );
  });
});
