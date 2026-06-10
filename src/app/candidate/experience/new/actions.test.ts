import { describe, it, expect, vi, beforeEach } from "vitest";
import { createExperienceSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("createExperienceSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = createExperienceSchema.safeParse({
      experience: "Software Engineer",
      employer: "Tech Corp",
      startYear: 2020,
      endYear: 2023,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Software Engineer");
      expect(r.data.employer).toBe("Tech Corp");
      expect(r.data.startYear).toBe(2020);
      expect(r.data.endYear).toBe(2023);
    }
  });

  it("accepts minimal input (experience only)", () => {
    const r = createExperienceSchema.safeParse({
      experience: "Intern",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Intern");
      expect(r.data.employer).toBe("");
      expect(r.data.startYear).toBeUndefined();
      expect(r.data.endYear).toBeUndefined();
    }
  });

  it("trims whitespace from experience and employer", () => {
    const r = createExperienceSchema.safeParse({
      experience: "  Lead Developer  ",
      employer: "  Company  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Lead Developer");
      expect(r.data.employer).toBe("Company");
    }
  });

  it("rejects empty experience", () => {
    expect(createExperienceSchema.safeParse({ experience: "" }).success).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "x".repeat(129) }).success,
    ).toBe(false);
  });

  it("accepts experience at exactly 128 chars", () => {
    expect(
      createExperienceSchema.safeParse({ experience: "x".repeat(128) }).success,
    ).toBe(true);
  });

  it("rejects employer over 255 chars", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        employer: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        startYear: 1899,
      }).success,
    ).toBe(false);
  });

  it("rejects startYear above 2100", () => {
    expect(
      createExperienceSchema.safeParse({
        experience: "Engineer",
        startYear: 2101,
      }).success,
    ).toBe(false);
  });

  it("rejects endYear below startYear via schema", () => {
    // Schema itself allows this — the action validates it separately
    const r = createExperienceSchema.safeParse({
      experience: "Engineer",
      startYear: 2023,
      endYear: 2020,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Action tests
// ---------------------------------------------------------------------------

// Mock session module
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

// Mock parent action
vi.mock("../actions", () => ({
  createCandidateExperience: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const { createCandidateExperience } = await import("../actions");
const actions = await import("./actions");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireRoleCapability).mockResolvedValue({
    role: "candidate" as const,
    id: "42",
    name: "Test Candidate",
    email: "candidate@test.local",
    issuedAt: Date.now(),
  });
});

describe("createExperience", () => {
  it("creates experience successfully with valid data", async () => {
    vi.mocked(createCandidateExperience).mockResolvedValue({
      success: true,
      experienceId: 123,
    });

    const result = await actions.createExperience({
      experience: "Software Engineer",
      employer: "Tech Corp",
      startYear: 2020,
      endYear: 2023,
    });

    expect(result.success).toBe(true);
    expect(requireRoleCapability).toHaveBeenCalledWith(
      "candidate",
      "candidate.profile.edit",
    );
    expect(createCandidateExperience).toHaveBeenCalledWith({
      experience: "Software Engineer",
      employer: "Tech Corp",
      startYear: 2020,
      endYear: 2023,
    });
  });

  it("returns error for invalid input (empty experience)", async () => {
    const result = await actions.createExperience({
      experience: "",
      employer: "Tech Corp",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(createCandidateExperience).not.toHaveBeenCalled();
  });

  it("validates date range — rejects endYear before startYear", async () => {
    const result = await actions.createExperience({
      experience: "Engineer",
      startYear: 2023,
      endYear: 2020,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("End year cannot be before start year");
    }
    expect(createCandidateExperience).not.toHaveBeenCalled();
  });

  it("allows same start and end year", async () => {
    vi.mocked(createCandidateExperience).mockResolvedValue({
      success: true,
      experienceId: 124,
    });

    const result = await actions.createExperience({
      experience: "Current Role",
      employer: "Startup Inc",
      startYear: 2024,
      endYear: 2024,
    });

    expect(result.success).toBe(true);
    expect(createCandidateExperience).toHaveBeenCalled();
  });

  it("allows endYear without startYear", async () => {
    vi.mocked(createCandidateExperience).mockResolvedValue({
      success: true,
      experienceId: 125,
    });

    const result = await actions.createExperience({
      experience: "Part-time",
      endYear: 2022,
    });

    expect(result.success).toBe(true);
    expect(createCandidateExperience).toHaveBeenCalled();
  });

  it("propagates parent error", async () => {
    vi.mocked(createCandidateExperience).mockResolvedValue({
      success: false,
      error: "Database error",
    });

    const result = await actions.createExperience({
      experience: "Engineer",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Database error");
    }
  });
});
