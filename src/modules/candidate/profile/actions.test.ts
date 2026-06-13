import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  profileMetricsSchema,
  getCandidateProfileDetailResultSchema,
} from "@/app/candidate/profile/schemas";
import type { ProfileMetrics, GetCandidateProfileDetailResult } from "@/app/candidate/profile/schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockGetCandidateProfile, mockGetCandidateProfileMetrics } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockGetCandidateProfile: vi.fn(),
    mockGetCandidateProfileMetrics: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireCapability,
}));

// ── Mock app-level candidate actions ─────────────────────────
vi.mock("@/app/candidate/actions", () => ({
  getCandidateProfile: mockGetCandidateProfile,
}));

// ── Mock module-level candidates/profile actions ──────────────
vi.mock("@/modules/candidates/profile/actions", () => ({
  getCandidateProfileMetrics: mockGetCandidateProfileMetrics,
}));

import { getCandidateProfileDetail } from "./actions";

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("profileMetricsSchema", () => {
  it("accepts valid metrics with all counts zero", () => {
    const metrics: ProfileMetrics = {
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    };
    const result = profileMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it("accepts valid metrics with positive counts", () => {
    const metrics: ProfileMetrics = {
      experienceCount: 3,
      educationCount: 2,
      skillCount: 8,
      certificationCount: 1,
      languageCount: 4,
      applicationCount: 5,
    };
    const result = profileMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it("rejects negative count", () => {
    const result = profileMetricsSchema.safeParse({
      experienceCount: -1,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer count", () => {
    const result = profileMetricsSchema.safeParse({
      experienceCount: 1.5,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required field", () => {
    const result = profileMetricsSchema.safeParse({
      experienceCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects null count", () => {
    const result = profileMetricsSchema.safeParse({
      experienceCount: null,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateProfileDetailResultSchema", () => {
  it("accepts valid combined result", () => {
    const result: GetCandidateProfileDetailResult = {
      detail: { id: 1, name: "Test" },
      metrics: {
        experienceCount: 2,
        educationCount: 3,
        skillCount: 5,
        certificationCount: 1,
        languageCount: 2,
        applicationCount: 0,
      },
    };
    const parsed = getCandidateProfileDetailResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty detail object", () => {
    const result: GetCandidateProfileDetailResult = {
      detail: {},
      metrics: {
        experienceCount: 0,
        educationCount: 0,
        skillCount: 0,
        certificationCount: 0,
        languageCount: 0,
        applicationCount: 0,
      },
    };
    const parsed = getCandidateProfileDetailResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing metrics field", () => {
    const parsed = getCandidateProfileDetailResultSchema.safeParse({
      detail: { id: 1 },
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects null metrics", () => {
    const parsed = getCandidateProfileDetailResultSchema.safeParse({
      detail: { id: 1 },
      metrics: null,
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked delegation
// ---------------------------------------------------------------------------

describe("getCandidateProfileDetail action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default session mock — candidate role with id
    mockRequireCapability.mockResolvedValue({ id: 42, role: "candidate" });
  });

  it("calls requireRoleCapability with correct role and capability", async () => {
    mockGetCandidateProfile.mockResolvedValue({ id: 42, name: "Ali" });
    mockGetCandidateProfileMetrics.mockResolvedValue({
      experienceCount: 2,
      educationCount: 3,
      skillCount: 5,
      certificationCount: 1,
      languageCount: 2,
      applicationCount: 0,
    });

    await getCandidateProfileDetail();

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("delegates to getCandidateProfile and getCandidateProfileMetrics with correct candidateId", async () => {
    mockRequireCapability.mockResolvedValue({ id: 42, role: "candidate" });
    mockGetCandidateProfile.mockResolvedValue({ id: 42, name: "Ali" });
    mockGetCandidateProfileMetrics.mockResolvedValue({
      experienceCount: 2,
      educationCount: 3,
      skillCount: 5,
      certificationCount: 1,
      languageCount: 2,
      applicationCount: 0,
    });

    await getCandidateProfileDetail();

    expect(mockGetCandidateProfile).toHaveBeenCalledWith({ candidateId: 42 });
    expect(mockGetCandidateProfileMetrics).toHaveBeenCalledWith({ candidateId: 42 });
  });

  it("returns combined detail and metrics", async () => {
    const detail = { id: 42, name: "Ali", email: "ali@example.com" };
    const metrics = {
      experienceCount: 2,
      educationCount: 3,
      skillCount: 5,
      certificationCount: 1,
      languageCount: 2,
      applicationCount: 0,
    };

    mockGetCandidateProfile.mockResolvedValue(detail);
    mockGetCandidateProfileMetrics.mockResolvedValue(metrics);

    const result = await getCandidateProfileDetail();

    expect(result).toEqual({ detail, metrics });
  });

  it("propagates empty metrics when delegation returns zeros", async () => {
    mockGetCandidateProfile.mockResolvedValue({ id: 42, name: "Ali" });
    mockGetCandidateProfileMetrics.mockResolvedValue({
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });

    const result = await getCandidateProfileDetail();

    expect(result.metrics).toEqual({
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });
  });

  it("throws when session rejects (requireRoleCapability throws)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getCandidateProfileDetail()).rejects.toThrow("Unauthorized");
    expect(mockGetCandidateProfile).not.toHaveBeenCalled();
    expect(mockGetCandidateProfileMetrics).not.toHaveBeenCalled();
  });

  it("throws when getCandidateProfile throws", async () => {
    mockGetCandidateProfile.mockRejectedValue(new Error("Candidate not found"));
    mockGetCandidateProfileMetrics.mockResolvedValue({
      experienceCount: 0,
      educationCount: 0,
      skillCount: 0,
      certificationCount: 0,
      languageCount: 0,
      applicationCount: 0,
    });

    await expect(getCandidateProfileDetail()).rejects.toThrow("Candidate not found");
  });

  it("throws when getCandidateProfileMetrics throws", async () => {
    mockGetCandidateProfile.mockResolvedValue({ id: 42 });
    mockGetCandidateProfileMetrics.mockRejectedValue(new Error("Metrics error"));

    await expect(getCandidateProfileDetail()).rejects.toThrow("Metrics error");
  });
});
