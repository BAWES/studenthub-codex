import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — data layer & auth
// ---------------------------------------------------------------------------

const mockCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_experience: { count: mockCount },
    candidate_education: { count: mockCount },
    candidate_skill: { count: mockCount },
    candidate_certification: { count: mockCount },
    candidate_language: { count: mockCount },
    job_listing_application: { count: mockCount },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("../actions", () => ({
  getCandidateProfile: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const { getCandidateProfile } = await import("../actions");
const { getCandidateProfileDetail } = await import("./actions");

const mockUser = {
  role: "candidate" as const,
  id: "1",
  name: "Test Candidate",
  email: "test@candidate.studenthub.local",
  issuedAt: Date.now(),
};

const mockDetail: any = {
  candidate: {
    candidate_id: 1,
    candidate_name: "Test Candidate",
    candidate_email: "test@example.com",
    candidate_phone: "+965****0000",
    candidate_objective: "Looking for a job",
    candidate_intro: "I am a test candidate",
    candidate_birth_date: null,
    candidate_personal_photo: null,
    candidate_hourly_rate: null,
    profile_url: null,
    candidate_civil_id: null,
    candidate_address_line1: null,
    candidate_gender: null,
    candidate_preferred_time: null,
  },
  invitations: [],
  workHours: [],
  histories: [],
  notes: [],
  stats: null,
  hasApplied: false,
};

describe("Candidate Profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCandidateProfileDetail", () => {
    it("returns profile detail and metrics for authenticated candidate", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      vi.mocked(getCandidateProfile).mockResolvedValue(mockDetail);
      mockCount.mockResolvedValue(3);

      const result = await getCandidateProfileDetail();

      expect(result.detail).toEqual(mockDetail);
      expect(result.metrics.experienceCount).toBe(3);
      expect(result.metrics.educationCount).toBe(3);
      expect(result.metrics.skillCount).toBe(3);
      expect(result.metrics.certificationCount).toBe(3);
      expect(result.metrics.languageCount).toBe(3);
      expect(result.metrics.applicationCount).toBe(3);
      expect(requireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
    });

    it("uses the authenticated user's id for profile lookups", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      vi.mocked(getCandidateProfile).mockResolvedValue(mockDetail);
      mockCount.mockResolvedValue(0);

      await getCandidateProfileDetail();

      expect(getCandidateProfile).toHaveBeenCalledWith({ candidateId: 1 });
    });

    it("returns zero-count metrics when there are no related records", async () => {
      vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
      vi.mocked(getCandidateProfile).mockResolvedValue(mockDetail);
      mockCount.mockResolvedValue(0);

      const result = await getCandidateProfileDetail();

      expect(result.metrics.experienceCount).toBe(0);
      expect(result.metrics.educationCount).toBe(0);
      expect(result.metrics.skillCount).toBe(0);
      expect(result.metrics.certificationCount).toBe(0);
      expect(result.metrics.languageCount).toBe(0);
      expect(result.metrics.applicationCount).toBe(0);
    });
  });
});
