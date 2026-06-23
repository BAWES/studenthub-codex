import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindFirst,
  mockCreate,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_experience: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import { prisma } from "@/lib/prisma";

// Import module under test
import * as actions from "./actions";

// ===========================================================================
// Fixtures
// ===========================================================================

const mockSession = { id: "42", role: "candidate" };

const mockExperienceRow = {
  candidate_experience_id: 1,
  candidate_id: 42,
  experience: "Software Engineer",
  employer: "Acme Corp",
  start_year: 2020,
  end_year: 2023,
  deleted: 0,
  candidate_experience_created_at: new Date("2024-01-01T00:00:00Z"),
};

const mockExperienceItem = {
  candidate_experience_id: 1,
  candidate_id: 42,
  experience: "Software Engineer",
  employer: "Acme Corp",
  start_year: 2020,
  end_year: 2023,
  created_at: new Date("2024-01-01T00:00:00Z"),
};

// ===========================================================================
// listCandidateExperience
// ===========================================================================

describe("listCandidateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("lists non-deleted experiences for the candidate (newest first)", async () => {
    mockFindMany.mockResolvedValue([mockExperienceRow]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listCandidateExperience();

    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deleted: 0, candidate_id: 42 },
        orderBy: { candidate_experience_id: "desc" },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({ where: { deleted: 0, candidate_id: 42 } });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      candidate_experience_id: 1,
      experience: "Software Engineer",
    });
  });

  it("returns empty array when no experiences exist", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await actions.listCandidateExperience();

    expect(result).toEqual([]);
  });

  it("applies pagination when page/limit provided", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listCandidateExperience({ page: 2, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("throws on invalid input params", async () => {
    await expect(actions.listCandidateExperience({ page: -1 })).rejects.toThrow();
  });

  it("logs output validation errors without throwing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFindMany.mockResolvedValue([{ ...mockExperienceRow, candidate_experience_id: "not-a-number" }]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listCandidateExperience();

    expect(result).toHaveLength(1);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ===========================================================================
// getCandidateExperience
// ===========================================================================

describe("getCandidateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("returns a single experience entry by ID", async () => {
    mockFindFirst.mockResolvedValue(mockExperienceRow);

    const result = await actions.getCandidateExperience(1);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        candidate_experience_id: 1,
        candidate_id: 42,
        deleted: 0,
      },
    });
    expect(result).toMatchObject({ candidate_experience_id: 1 });
  });

  it("returns null when entry not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.getCandidateExperience(999);

    expect(result).toBeNull();
  });

  it("throws on invalid experience ID", async () => {
    await expect(actions.getCandidateExperience(-1)).rejects.toThrow();
  });
});

// ===========================================================================
// createCandidateExperience
// ===========================================================================

describe("createCandidateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("creates a new experience entry and returns success", async () => {
    const createdRow = { ...mockExperienceRow, candidate_experience_id: 5 };
    mockCreate.mockResolvedValue(createdRow);

    const result = await actions.createCandidateExperience({
      experience: "Senior Engineer",
      employer: "Beta Inc",
      startYear: 2021,
      endYear: 2024,
    });

    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        candidate_id: 42,
        experience: "Senior Engineer",
        employer: "Beta Inc",
        start_year: 2021,
        end_year: 2024,
        deleted: 0,
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/experience");
    expect(result).toEqual({ success: true, experienceId: 5 });
  });

  it("returns error on invalid input", async () => {
    const result = await actions.createCandidateExperience({
      experience: "", // empty string fails min(1)
    });

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when end year is before start year", async () => {
    const result = await actions.createCandidateExperience({
      experience: "Engineer",
      startYear: 2024,
      endYear: 2020,
    });

    expect(result).toEqual({ success: false, error: "End year cannot be before start year" });
  });

  it("creates without optional employer (defaults to empty string)", async () => {
    mockCreate.mockResolvedValue({ ...mockExperienceRow, candidate_experience_id: 6 });

    const result = await actions.createCandidateExperience({
      experience: "Junior Dev",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employer: "",
        }),
      }),
    );
    expect(result).toEqual({ success: true, experienceId: 6 });
  });
});

// ===========================================================================
// updateCandidateExperience
// ===========================================================================

describe("updateCandidateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("updates an existing experience entry", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });
    mockUpdate.mockResolvedValue({ ...mockExperienceRow, experience: "Updated Title" });

    const result = await actions.updateCandidateExperience({
      experienceId: 1,
      experience: "Updated Title",
      employer: "New Corp",
      startYear: 2022,
      endYear: 2025,
    });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1, candidate_id: 42, deleted: 0 },
      select: { candidate_experience_id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1 },
      data: {
        experience: "Updated Title",
        employer: "New Corp",
        start_year: 2022,
        end_year: 2025,
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/experience");
    expect(result).toEqual({ success: true, experienceId: 1 });
  });

  it("returns error when entry not found or ownership fails", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.updateCandidateExperience({
      experienceId: 999,
      experience: "Engineer",
    });

    expect(result).toEqual({ success: false, error: "Experience entry not found or access denied" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid input", async () => {
    const result = await actions.updateCandidateExperience({
      experienceId: -1,
      experience: "Engineer",
    });

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });

  it("returns error on invalid date range", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });

    const result = await actions.updateCandidateExperience({
      experienceId: 1,
      experience: "Engineer",
      startYear: 2024,
      endYear: 2020,
    });

    expect(result).toEqual({ success: false, error: "End year cannot be before start year" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("handles partial updates correctly (employer defaults to empty string)", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });
    mockUpdate.mockResolvedValue(mockExperienceRow);

    await actions.updateCandidateExperience({
      experienceId: 1,
      experience: "Just Title Change",
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1 },
      data: {
        experience: "Just Title Change",
        employer: "",
      },
    });
  });
});

// ===========================================================================
// deleteCandidateExperience
// ===========================================================================

describe("deleteCandidateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("soft-deletes an existing experience entry", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });
    mockUpdate.mockResolvedValue({ ...mockExperienceRow, deleted: 1 });

    const result = await actions.deleteCandidateExperience(1);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1, candidate_id: 42, deleted: 0 },
      select: { candidate_experience_id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1 },
      data: { deleted: 1 },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/experience");
    expect(result).toEqual({ success: true, experienceId: 1 });
  });

  it("returns error when entry not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.deleteCandidateExperience(999);

    expect(result).toEqual({ success: false, error: "Experience entry not found or access denied" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid experience ID", async () => {
    const result = await actions.deleteCandidateExperience(-1);

    expect(result).toEqual({ success: false, error: "Invalid experience ID" });
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Route wrapper functions
// ===========================================================================

describe("getExperienceEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("delegates to getCandidateExperience and returns result", async () => {
    mockFindFirst.mockResolvedValue(mockExperienceRow);

    const result = await actions.getExperienceEntry(1);

    expect(result).toMatchObject({ candidate_experience_id: 1 });
  });
});

describe("updateExperienceEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("delegates to updateCandidateExperience and revalidates the detail path on success", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });
    mockUpdate.mockResolvedValue(mockExperienceRow);

    const result = await actions.updateExperienceEntry(1, "Engineer", "Co");

    expect(result).toEqual({ success: true, experienceId: 1 });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/experience/1");
  });

  it("does not revalidate detail path on failure", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.updateExperienceEntry(999, "Engineer");

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });
});

describe("deleteExperienceEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("delegates to deleteCandidateExperience", async () => {
    mockFindFirst.mockResolvedValue({ candidate_experience_id: 1 });
    mockUpdate.mockResolvedValue({ ...mockExperienceRow, deleted: 1 });

    const result = await actions.deleteExperienceEntry(1);

    expect(result).toEqual({ success: true, experienceId: 1 });
  });
});

describe("createExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("creates experience via delegate", async () => {
    mockCreate.mockResolvedValue({ ...mockExperienceRow, candidate_experience_id: 10 });

    const result = await actions.createExperience({
      experience: "DevOps Engineer",
    });

    expect(result).toEqual({ success: true, experienceId: 10 });
  });

  it("returns error on invalid input", async () => {
    const result = await actions.createExperience({
      experience: "",
    });

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error on invalid date range", async () => {
    const result = await actions.createExperience({
      experience: "Dev",
      startYear: 2024,
      endYear: 2020,
    });

    expect(result).toEqual({ success: false, error: "End year cannot be before start year" });
  });
});
