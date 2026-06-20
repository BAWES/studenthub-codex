import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockMetrics = vi.fn();

vi.mock("@/modules/candidates/profile/actions", () => ({
  getCandidateProfileMetrics: mockMetrics,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("../actions", () => ({
  getCandidateProfile: vi.fn(),
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
    bank_account_name: null,
    candidate_iban: null,
    country_id: 1,
    university_id: null,
    bank_id: null,
  },
  roleActions: [],
};

const mockMetricsResult = {
  experienceCount: 3,
  educationCount: 2,
  skillCount: 5,
  certificationCount: 1,
  languageCount: 2,
  applicationCount: 0,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Candidate Profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    (getCandidateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDetail,
    );
    mockMetrics.mockResolvedValue(mockMetricsResult);
  });

  describe("getCandidateProfileDetail", () => {
    it("returns profile detail and metrics for authenticated candidate", async () => {
      const result = await getCandidateProfileDetail();

      expect(result.detail).toBe(mockDetail);
      expect(result.metrics).toEqual(mockMetricsResult);
    });

    it("uses the authenticated user's id for profile lookups", async () => {
      await getCandidateProfileDetail();

      expect(getCandidateProfile).toHaveBeenCalledWith({
        candidateId: Number(mockUser.id),
      });
      expect(mockMetrics).toHaveBeenCalledWith({
        candidateId: Number(mockUser.id),
      });
    });

    it("returns zero-count metrics when there are no related records", async () => {
      mockMetrics.mockResolvedValue({
        experienceCount: 0,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
        applicationCount: 0,
      });

      const result = await getCandidateProfileDetail();

      expect(result.metrics.experienceCount).toBe(0);
      expect(result.metrics.educationCount).toBe(0);
      expect(result.metrics.skillCount).toBe(0);
    });

    it("requires candidate.read.own capability", async () => {
      await getCandidateProfileDetail();
      expect(requireRoleCapability).toHaveBeenCalledWith(
        "candidate",
        "candidate.read.own",
      );
    });
  });
});
