import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStudentProfileSchema,
  updateStudentProfileSchema,
  listSkillsSchema,
  addSkillSchema,
  removeSkillSchema,
  listExperienceSchema,
  addExperienceSchema,
  updateExperienceSchema,
  removeExperienceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getStudentProfileSchema", () => {
  it("accepts valid student ID", () => {
    const r = getStudentProfileSchema.safeParse({ studentId: 1 });
    expect(r.success).toBe(true);
  });

  it("coerces string student ID to number", () => {
    const r = getStudentProfileSchema.safeParse({ studentId: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.studentId).toBe(42);
  });

  it("rejects missing studentId", () => {
    expect(getStudentProfileSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: -1 }).success).toBe(false);
  });
});

describe("updateStudentProfileSchema", () => {
  it("accepts studentId only (no updates)", () => {
    const r = updateStudentProfileSchema.safeParse({ studentId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const r = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "Ahmed Al-Salem",
      objective: "Looking for SWE internship",
      intro: "CS student at KU",
      phone: "+965 5555 1234",
      address: "Kuwait City",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed Al-Salem");
      expect(r.data.objective).toBe("Looking for SWE internship");
    }
  });

  it("rejects empty name", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, name: "" }).success,
    ).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, name: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(updateStudentProfileSchema.safeParse({ name: "test" }).success).toBe(false);
  });
});

describe("listSkillsSchema", () => {
  it("accepts valid student ID", () => {
    const r = listSkillsSchema.safeParse({ studentId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listSkillsSchema.safeParse({}).success).toBe(false);
  });
});

describe("addSkillSchema", () => {
  it("accepts valid input", () => {
    const r = addSkillSchema.safeParse({ studentId: 1, skill: "TypeScript" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skill).toBe("TypeScript");
  });

  it("rejects empty skill name", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: "" }).success).toBe(false);
  });

  it("rejects skill over 128 chars", () => {
    expect(
      addSkillSchema.safeParse({ studentId: 1, skill: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(addSkillSchema.safeParse({ skill: "Python" }).success).toBe(false);
  });
});

describe("removeSkillSchema", () => {
  it("accepts valid skill ID", () => {
    const r = removeSkillSchema.safeParse({ skillId: 1 });
    expect(r.success).toBe(true);
  });

  it("coerces string skillId", () => {
    const r = removeSkillSchema.safeParse({ skillId: "5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skillId).toBe(5);
  });

  it("rejects zero skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });

  it("rejects missing skillId", () => {
    expect(removeSkillSchema.safeParse({}).success).toBe(false);
  });
});

describe("listExperienceSchema", () => {
  it("accepts valid student ID", () => {
    const r = listExperienceSchema.safeParse({ studentId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listExperienceSchema.safeParse({}).success).toBe(false);
  });
});

describe("addExperienceSchema", () => {
  it("accepts minimal valid input", () => {
    const r = addExperienceSchema.safeParse({ studentId: 1, experience: "Intern" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Intern");
    }
  });

  it("accepts full input with all optional fields", () => {
    const r = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Software Engineer",
      employer: "Tech Co",
      startYear: 2024,
      endYear: 2025,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employer).toBe("Tech Co");
      expect(r.data.startYear).toBe(2024);
      expect(r.data.endYear).toBe(2025);
    }
  });

  it("rejects empty experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1, experience: "" }).success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects missing experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });
});

describe("updateExperienceSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = updateExperienceSchema.safeParse({
      experienceId: 1,
      experience: "Senior Engineer",
      employer: "New Company",
      startYear: 2023,
      endYear: 2026,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Senior Engineer");
      expect(r.data.startYear).toBe(2023);
    }
  });

  it("accepts experienceId only (partial update)", () => {
    const r = updateExperienceSchema.safeParse({ experienceId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(updateExperienceSchema.safeParse({ experience: "Title" }).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });
});

describe("removeExperienceSchema", () => {
  it("accepts valid experience ID", () => {
    const r = removeExperienceSchema.safeParse({ experienceId: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(removeExperienceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockCandidateFindUnique = vi.fn();
const mockCandidateUpdate = vi.fn();
const mockCandidateSkillFindMany = vi.fn();
const mockCandidateSkillCreate = vi.fn();
const mockCandidateSkillUpdate = vi.fn();
const mockCandidateExperienceFindMany = vi.fn();
const mockCandidateExperienceCreate = vi.fn();
const mockCandidateExperienceUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mockCandidateFindUnique,
      update: mockCandidateUpdate,
    },
    candidate_skill: {
      findMany: mockCandidateSkillFindMany,
      create: mockCandidateSkillCreate,
      update: mockCandidateSkillUpdate,
    },
    candidate_experience: {
      findMany: mockCandidateExperienceFindMany,
      create: mockCandidateExperienceCreate,
      update: mockCandidateExperienceUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const actions = await import("./actions");

const mockUser = {
  role: "candidate" as const,
  id: "student-1",
  name: "Student User",
  email: "student@example.com",
  issuedAt: Date.now(),
};

function makeCandidate(overrides: Record<string, unknown> = {}) {
  return {
    candidate_id: 1,
    candidate_name: "Ahmed Al-Salem",
    candidate_email: "ahmed@example.com",
    candidate_phone: "+965 5555 1234",
    candidate_personal_photo: null,
    candidate_objective: "Looking for internship",
    candidate_intro: "CS student",
    candidate_address_line1: "Kuwait City",
    candidate_skill: [],
    candidate_experience: [],
    ...overrides,
  };
}

describe("getStudentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full profile for valid student ID", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateFindUnique.mockResolvedValue(makeCandidate());

    const result = await actions.getStudentProfile({ studentId: 1 });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Ahmed Al-Salem");
    expect(result!.email).toBe("ahmed@example.com");
    expect(result!.skills).toEqual([]);
    expect(result!.experience).toEqual([]);
  });

  it("returns null when candidate not found", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateFindUnique.mockResolvedValue(null);

    const result = await actions.getStudentProfile({ studentId: 999 });
    expect(result).toBeNull();
  });

  it("returns skills mapped correctly", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateFindUnique.mockResolvedValue(
      makeCandidate({
        candidate_skill: [
          { candidate_skill_id: 10, skill: "TypeScript" },
          { candidate_skill_id: 11, skill: "React" },
        ],
      }),
    );

    const result = await actions.getStudentProfile({ studentId: 1 });

    expect(result!.skills).toHaveLength(2);
    expect(result!.skills[0]).toEqual({ id: 10, name: "TypeScript" });
    expect(result!.skills[1]).toEqual({ id: 11, name: "React" });
  });

  it("returns experience mapped correctly", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateFindUnique.mockResolvedValue(
      makeCandidate({
        candidate_experience: [
          {
            candidate_experience_id: 20,
            experience: "Intern",
            employer: "Company A",
            start_year: 2024,
            end_year: null,
          },
        ],
      }),
    );

    const result = await actions.getStudentProfile({ studentId: 1 });

    expect(result!.experience).toHaveLength(1);
    expect(result!.experience[0]).toEqual({
      id: 20,
      title: "Intern",
      employer: "Company A",
      startYear: 2024,
      endYear: null,
    });
  });

  it("filters deleted skills", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateFindUnique.mockResolvedValue(
      makeCandidate({
        candidate_skill: [
          { candidate_skill_id: 10, skill: "TypeScript" },
        ],
      }),
    );

    await actions.getStudentProfile({ studentId: 1 });

    const callArgs = mockCandidateFindUnique.mock.calls[0][0];
    expect(callArgs.where.deleted).toBe(0);
    expect(callArgs.where.candidate_id).toBe(1);
  });

  it("throws on invalid input", async () => {
    await expect(actions.getStudentProfile({ studentId: -1 })).rejects.toThrow();
    expect(mockCandidateFindUnique).not.toHaveBeenCalled();
  });
});

describe("updateStudentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates profile with provided fields", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 1 });

    const result = await actions.updateStudentProfile({
      studentId: 1,
      name: "Updated Name",
      objective: "New objective",
    });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateUpdate).toHaveBeenCalledWith({
      where: { candidate_id: 1 },
      data: { candidate_name: "Updated Name", candidate_objective: "New objective" },
    });
    expect(result.success).toBe(true);
  });

  it("skips Prisma update when no fields changed", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = await actions.updateStudentProfile({ studentId: 1 });

    expect(mockCandidateUpdate).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("maps phone and address correctly", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateUpdate.mockResolvedValue({ candidate_id: 1 });

    await actions.updateStudentProfile({
      studentId: 1,
      phone: "+965 5555 4321",
      address: "Salmiya",
    });

    expect(mockCandidateUpdate).toHaveBeenCalledWith({
      where: { candidate_id: 1 },
      data: { candidate_phone: "+965 5555 4321", candidate_address_line1: "Salmiya" },
    });
  });

  it("throws on invalid input", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    await expect(
      actions.updateStudentProfile({ studentId: 1, name: "" }),
    ).rejects.toThrow();
    expect(mockCandidateUpdate).not.toHaveBeenCalled();
  });
});

describe("listSkills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns sorted list of skills", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateSkillFindMany.mockResolvedValue([
      { candidate_skill_id: 2, skill: "Python" },
      { candidate_skill_id: 1, skill: "JavaScript" },
    ]);

    const result = await actions.listSkills({ studentId: 1 });

    expect(mockCandidateSkillFindMany).toHaveBeenCalledWith({
      where: { candidate_id: 1, deleted: 0 },
      select: { candidate_skill_id: true, skill: true },
      orderBy: { skill: "asc" },
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Python");
    expect(result[1].name).toBe("JavaScript");
  });

  it("returns empty array when no skills", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateSkillFindMany.mockResolvedValue([]);

    const result = await actions.listSkills({ studentId: 1 });
    expect(result).toEqual([]);
  });

  it("throws on invalid input", async () => {
    await expect(actions.listSkills({ studentId: -1 })).rejects.toThrow();
    expect(mockCandidateSkillFindMany).not.toHaveBeenCalled();
  });
});

describe("addSkill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates skill and returns id", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateSkillCreate.mockResolvedValue({ candidate_skill_id: 42 });

    const result = await actions.addSkill({ studentId: 1, skill: "TypeScript" });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateSkillCreate).toHaveBeenCalledWith({
      data: { candidate_id: 1, skill: "TypeScript" },
      select: { candidate_skill_id: true },
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(42);
  });

  it("throws on invalid input", async () => {
    await expect(
      actions.addSkill({ studentId: 1, skill: "" }),
    ).rejects.toThrow();
    expect(mockCandidateSkillCreate).not.toHaveBeenCalled();
  });
});

describe("removeSkill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes skill by setting deleted=1", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateSkillUpdate.mockResolvedValue({ candidate_skill_id: 5 });

    const result = await actions.removeSkill({ skillId: 5 });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateSkillUpdate).toHaveBeenCalledWith({
      where: { candidate_skill_id: 5 },
      data: { deleted: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("throws on invalid input", async () => {
    await expect(actions.removeSkill({ skillId: 0 })).rejects.toThrow();
    expect(mockCandidateSkillUpdate).not.toHaveBeenCalled();
  });
});

describe("listExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns sorted list of experience", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceFindMany.mockResolvedValue([
      {
        candidate_experience_id: 1,
        experience: "Junior Dev",
        employer: "Startup Co",
        start_year: 2023,
        end_year: 2024,
      },
    ]);

    const result = await actions.listExperience({ studentId: 1 });

    expect(mockCandidateExperienceFindMany).toHaveBeenCalledWith({
      where: { candidate_id: 1, deleted: 0 },
      select: {
        candidate_experience_id: true,
        experience: true,
        employer: true,
        start_year: true,
        end_year: true,
      },
      orderBy: { start_year: "desc" },
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Junior Dev");
    expect(result[0].employer).toBe("Startup Co");
    expect(result[0].startYear).toBe(2023);
    expect(result[0].endYear).toBe(2024);
  });

  it("returns empty array when no experience", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceFindMany.mockResolvedValue([]);

    const result = await actions.listExperience({ studentId: 1 });
    expect(result).toEqual([]);
  });

  it("throws on invalid input", async () => {
    await expect(actions.listExperience({ studentId: -1 })).rejects.toThrow();
    expect(mockCandidateExperienceFindMany).not.toHaveBeenCalled();
  });
});

describe("addExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates experience with all fields", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceCreate.mockResolvedValue({ candidate_experience_id: 10 });

    const result = await actions.addExperience({
      studentId: 1,
      experience: "Software Engineer",
      employer: "Tech Co",
      startYear: 2024,
      endYear: 2025,
    });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateExperienceCreate).toHaveBeenCalledWith({
      data: {
        candidate_id: 1,
        experience: "Software Engineer",
        employer: "Tech Co",
        start_year: 2024,
        end_year: 2025,
      },
      select: { candidate_experience_id: true },
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(10);
  });

  it("creates experience with only required fields", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceCreate.mockResolvedValue({ candidate_experience_id: 11 });

    const result = await actions.addExperience({
      studentId: 1,
      experience: "Internship",
    });

    expect(mockCandidateExperienceCreate).toHaveBeenCalledWith({
      data: {
        candidate_id: 1,
        experience: "Internship",
        employer: undefined,
        start_year: undefined,
        end_year: undefined,
      },
      select: { candidate_experience_id: true },
    });
    expect(result.success).toBe(true);
  });

  it("throws on invalid input", async () => {
    await expect(
      actions.addExperience({ studentId: 1, experience: "" }),
    ).rejects.toThrow();
    expect(mockCandidateExperienceCreate).not.toHaveBeenCalled();
  });
});

describe("updateExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates experience with provided fields", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceUpdate.mockResolvedValue({ candidate_experience_id: 1 });

    const result = await actions.updateExperience({
      experienceId: 1,
      experience: "Senior Dev",
      employer: "Big Corp",
    });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateExperienceUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1 },
      data: { experience: "Senior Dev", employer: "Big Corp" },
    });
    expect(result.success).toBe(true);
  });

  it("maps startYear and endYear to DB columns", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceUpdate.mockResolvedValue({ candidate_experience_id: 1 });

    await actions.updateExperience({
      experienceId: 1,
      startYear: 2022,
      endYear: 2026,
    });

    expect(mockCandidateExperienceUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 1 },
      data: { start_year: 2022, end_year: 2026 },
    });
  });

  it("skips Prisma update when no fields changed", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);

    const result = await actions.updateExperience({ experienceId: 1 });

    expect(mockCandidateExperienceUpdate).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("throws on invalid input", async () => {
    await expect(
      actions.updateExperience({ experienceId: -1 }),
    ).rejects.toThrow();
    expect(mockCandidateExperienceUpdate).not.toHaveBeenCalled();
  });
});

describe("removeExperience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes experience by setting deleted=1", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockCandidateExperienceUpdate.mockResolvedValue({ candidate_experience_id: 3 });

    const result = await actions.removeExperience({ experienceId: 3 });

    expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCandidateExperienceUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 3 },
      data: { deleted: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("throws on invalid input", async () => {
    await expect(actions.removeExperience({ experienceId: 0 })).rejects.toThrow();
    expect(mockCandidateExperienceUpdate).not.toHaveBeenCalled();
  });
});
