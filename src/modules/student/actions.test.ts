import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindUnique, mockUpdate, mockFindMany, mockCreate } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
    mockFindMany: vi.fn(),
    mockCreate: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    candidate_skill: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
    },
    candidate_experience: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import {
  getStudentProfile,
  updateStudentProfile,
  listSkills,
  addSkill,
  removeSkill,
  listExperience,
  addExperience,
  updateExperience,
  removeExperience,
} from "./actions";
import type { StudentProfile, SkillItem, ExperienceItem } from "./actions";

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
} from "@/app/student/schemas";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("getStudentProfileSchema", () => {
  it("accepts a valid numeric student ID", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: 42 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.studentId).toBe(42);
  });

  it("coerces string ID to number", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: "99" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.studentId).toBe(99);
  });

  it("rejects missing studentId", () => {
    const result = getStudentProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects undefined studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: undefined });
    expect(result.success).toBe(false);
  });
});

describe("updateStudentProfileSchema", () => {
  it("accepts valid profile update with all fields", () => {
    const result = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "John",
      objective: "Learn",
      intro: "Hello world",
      phone: "+96512345678",
      address: "Kuwait City",
    });
    expect(result.success).toBe(true);
  });

  it("accepts profile update with only studentId (partial)", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects empty studentId", () => {
    const result = updateStudentProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name string", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1, name: "x".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects objective over 255 chars", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1, objective: "x".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects phone over 20 chars", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1, phone: "x".repeat(21) });
    expect(result.success).toBe(false);
  });
});

describe("listSkillsSchema", () => {
  it("accepts valid studentId", () => {
    const result = listSkillsSchema.safeParse({ studentId: 42 });
    expect(result.success).toBe(true);
  });

  it("coerces string studentId to number", () => {
    const result = listSkillsSchema.safeParse({ studentId: "7" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.studentId).toBe(7);
  });

  it("rejects missing studentId", () => {
    const result = listSkillsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero studentId", () => {
    const result = listSkillsSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("addSkillSchema", () => {
  it("accepts valid skill input", () => {
    const result = addSkillSchema.safeParse({ studentId: 1, skill: "TypeScript" });
    expect(result.success).toBe(true);
  });

  it("rejects empty skill name", () => {
    const result = addSkillSchema.safeParse({ studentId: 1, skill: "" });
    expect(result.success).toBe(false);
  });

  it("rejects skill over 128 chars", () => {
    const result = addSkillSchema.safeParse({ studentId: 1, skill: "x".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("rejects missing studentId", () => {
    const result = addSkillSchema.safeParse({ skill: "React" });
    expect(result.success).toBe(false);
  });
});

describe("removeSkillSchema", () => {
  it("accepts valid skill ID", () => {
    const result = removeSkillSchema.safeParse({ skillId: 10 });
    expect(result.success).toBe(true);
  });

  it("coerces string skillId to number", () => {
    const result = removeSkillSchema.safeParse({ skillId: "5" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.skillId).toBe(5);
  });

  it("rejects missing skillId", () => {
    const result = removeSkillSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero skillId", () => {
    const result = removeSkillSchema.safeParse({ skillId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("listExperienceSchema", () => {
  it("accepts valid studentId", () => {
    const result = listExperienceSchema.safeParse({ studentId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing studentId", () => {
    const result = listExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("addExperienceSchema", () => {
  it("accepts valid experience input with all fields", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Software Engineer",
      employer: "Acme Corp",
      startYear: 2020,
      endYear: 2023,
    });
    expect(result.success).toBe(true);
  });

  it("accepts experience with only required fields", () => {
    const result = addExperienceSchema.safeParse({ studentId: 1, experience: "Developer" });
    expect(result.success).toBe(true);
  });

  it("rejects empty experience title", () => {
    const result = addExperienceSchema.safeParse({ studentId: 1, experience: "" });
    expect(result.success).toBe(false);
  });

  it("rejects experience title over 128 chars", () => {
    const result = addExperienceSchema.safeParse({ studentId: 1, experience: "x".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("rejects employer over 255 chars", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Dev",
      employer: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateExperienceSchema", () => {
  it("accepts valid experience update with all fields", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: 5,
      experience: "Senior Dev",
      employer: "Corp",
      startYear: 2021,
      endYear: 2024,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (only experienceId)", () => {
    const result = updateExperienceSchema.safeParse({ experienceId: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects empty experienceId", () => {
    const result = updateExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty experience string", () => {
    const result = updateExperienceSchema.safeParse({ experienceId: 1, experience: "" });
    expect(result.success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    const result = updateExperienceSchema.safeParse({ experienceId: 1, experience: "x".repeat(129) });
    expect(result.success).toBe(false);
  });
});

describe("removeExperienceSchema", () => {
  it("accepts valid experience ID", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: 5 });
    expect(result.success).toBe(true);
  });

  it("coerces string experienceId to number", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.experienceId).toBe(3);
  });

  it("rejects missing experienceId", () => {
    const result = removeExperienceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: 0 });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// Action-level tests — mocked DB
// ===========================================================================

describe("getStudentProfile action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws on invalid input before session check", async () => {
    // Schema validation happens after requireRoleCapability;
    // mock the session to pass so we test the schema rejection path
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    await expect(getStudentProfile({ studentId: 0 })).rejects.toThrow("Student ID is required");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns student profile when found", async () => {
    const dbRow = {
      candidate_id: 42,
      candidate_name: "Alice",
      candidate_email: "alice@example.com",
      candidate_phone: "+965****1111",
      candidate_personal_photo: "/photos/alice.jpg",
      candidate_objective: "Learn to code",
      candidate_intro: "Hi, I'm Alice",
      candidate_address_line1: "Kuwait City",
      candidate_skill: [
        { candidate_skill_id: 1, skill: "JavaScript" },
        { candidate_skill_id: 2, skill: "React" },
      ],
      candidate_experience: [
        {
          candidate_experience_id: 10,
          experience: "Junior Dev",
          employer: "Startup X",
          start_year: 2022,
          end_year: 2023,
        },
      ],
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getStudentProfile({ studentId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
      }),
    );
    expect(result).not.toBeNull();
    expect(result!.id).toBe(42);
    expect(result!.name).toBe("Alice");
    expect(result!.email).toBe("alice@example.com");
    expect(result!.phone).toBe("+965****1111");
    expect(result!.photo).toBe("/photos/alice.jpg");
    expect(result!.objective).toBe("Learn to code");
    expect(result!.intro).toBe("Hi, I'm Alice");
    expect(result!.address).toBe("Kuwait City");
    expect(result!.skills).toHaveLength(2);
    expect(result!.skills[0]).toEqual({ id: 1, name: "JavaScript" });
    expect(result!.experience).toHaveLength(1);
    expect(result!.experience[0]).toEqual({
      id: 10,
      title: "Junior Dev",
      employer: "Startup X",
      startYear: 2022,
      endYear: 2023,
    });
  });

  it("returns null when student not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getStudentProfile({ studentId: 999 });

    expect(result).toBeNull();
  });

  it("returns empty skills and experience arrays when none exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({
      candidate_id: 1,
      candidate_name: "Bob",
      candidate_email: "bob@example.com",
      candidate_phone: null,
      candidate_personal_photo: null,
      candidate_objective: null,
      candidate_intro: null,
      candidate_address_line1: null,
      candidate_skill: [],
      candidate_experience: [],
    });

    const result = await getStudentProfile({ studentId: 1 });

    expect(result).not.toBeNull();
    expect(result!.skills).toHaveLength(0);
    expect(result!.experience).toHaveLength(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getStudentProfile({ studentId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("updateStudentProfile action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws on invalid input before session check", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    await expect(updateStudentProfile({ studentId: 0 })).rejects.toThrow("Number must be greater than 0");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates student profile with all fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({});

    const result = await updateStudentProfile({
      studentId: 1,
      name: "Updated Name",
      objective: "New goal",
      intro: "About me",
      phone: "+965****9999",
      address: "New Address",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_id: 1 },
      data: {
        candidate_name: "Updated Name",
        candidate_objective: "New goal",
        candidate_intro: "About me",
        candidate_phone: "+965****9999",
        candidate_address_line1: "New Address",
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/1");
    expect(result).toEqual({ success: true });
  });

  it("skips DB update when no fields provided", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateStudentProfile({ studentId: 1 });

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/1");
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateStudentProfile({ studentId: 1, name: "X" })).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("listSkills action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns skills list for a student", async () => {
    const dbRows = [
      { candidate_skill_id: 1, skill: "JavaScript" },
      { candidate_skill_id: 2, skill: "TypeScript" },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);

    const result = await listSkills({ studentId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
        orderBy: { skill: "asc" },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 1, name: "JavaScript" });
    expect(result[1]).toEqual({ id: 2, name: "TypeScript" });
  });

  it("returns empty array when no skills", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);

    const result = await listSkills({ studentId: 99 });

    expect(result).toHaveLength(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listSkills({ studentId: 1 })).rejects.toThrow("Unauthorized");
  });
});

describe("addSkill action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a skill and returns new id", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ candidate_skill_id: 55 });

    const result = await addSkill({ studentId: 1, skill: "GraphQL" });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCreate).toHaveBeenCalledWith({
      data: { candidate_id: 1, skill: "GraphQL" },
      select: { candidate_skill_id: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/1");
    expect(result).toEqual({ success: true, id: 55 });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(addSkill({ studentId: 1, skill: "X" })).rejects.toThrow("Unauthorized");
  });
});

describe("removeSkill action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes a skill", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({});

    const result = await removeSkill({ skillId: 10 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_skill_id: 10 },
      data: { deleted: 1 },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/");
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(removeSkill({ skillId: 1 })).rejects.toThrow("Unauthorized");
  });
});

describe("listExperience action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns experience list for a student", async () => {
    const dbRows = [
      {
        candidate_experience_id: 10,
        experience: "Junior Dev",
        employer: "Startup X",
        start_year: 2022,
        end_year: 2023,
      },
      {
        candidate_experience_id: 11,
        experience: "Senior Dev",
        employer: "Big Corp",
        start_year: 2024,
        end_year: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);

    const result = await listExperience({ studentId: 42 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_id: 42, deleted: 0 },
        orderBy: { start_year: "desc" },
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 10, title: "Junior Dev", employer: "Startup X", startYear: 2022, endYear: 2023 });
    expect(result[1]).toEqual({ id: 11, title: "Senior Dev", employer: "Big Corp", startYear: 2024, endYear: null });
  });

  it("returns empty array when no experience", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);

    const result = await listExperience({ studentId: 99 });

    expect(result).toHaveLength(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listExperience({ studentId: 1 })).rejects.toThrow("Unauthorized");
  });
});

describe("addExperience action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds experience with all fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ candidate_experience_id: 77 });

    const result = await addExperience({
      studentId: 1,
      experience: "Software Engineer",
      employer: "Acme Corp",
      startYear: 2020,
      endYear: 2023,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        candidate_id: 1,
        experience: "Software Engineer",
        employer: "Acme Corp",
        start_year: 2020,
        end_year: 2023,
      },
      select: { candidate_experience_id: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/1");
    expect(result).toEqual({ success: true, id: 77 });
  });

  it("adds experience with only required fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ candidate_experience_id: 78 });

    const result = await addExperience({
      studentId: 1,
      experience: "Freelancer",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        candidate_id: 1,
        experience: "Freelancer",
        employer: undefined,
        start_year: undefined,
        end_year: undefined,
      },
      select: { candidate_experience_id: true },
    });
    expect(result).toEqual({ success: true, id: 78 });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(addExperience({ studentId: 1, experience: "X" })).rejects.toThrow("Unauthorized");
  });
});

describe("updateExperience action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates experience with all fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({});

    const result = await updateExperience({
      experienceId: 5,
      experience: "Senior Dev",
      employer: "New Corp",
      startYear: 2021,
      endYear: 2024,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 5 },
      data: {
        experience: "Senior Dev",
        employer: "New Corp",
        start_year: 2021,
        end_year: 2024,
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/");
    expect(result).toEqual({ success: true });
  });

  it("skips DB update when no fields provided", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateExperience({ experienceId: 5 });

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/");
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateExperience({ experienceId: 1 })).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("removeExperience action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes an experience entry", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({});

    const result = await removeExperience({ experienceId: 10 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.profile.edit");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { candidate_experience_id: 10 },
      data: { deleted: 1 },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/");
    expect(result).toEqual({ success: true });
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(removeExperience({ experienceId: 1 })).rejects.toThrow("Unauthorized");
  });
});
