import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCandidateProfileSchema } from "./schemas";
import type { GetCandidateProfileInput } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("getCandidateProfileSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidate ID to number", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });

  it("rejects zero candidate ID", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: 0 }).success).toBe(
      false,
    );
  });

  it("rejects negative candidate ID", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: -1 }).success).toBe(
      false,
    );
  });

  it("rejects non-numeric candidate ID", () => {
    expect(
      getCandidateProfileSchema.safeParse({ candidateId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId field", () => {
    expect(getCandidateProfileSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: null }).success).toBe(
      false,
    );
  });

  it("rejects undefined candidateId", () => {
    expect(
      getCandidateProfileSchema.safeParse({ candidateId: undefined }).success,
    ).toBe(false);
  });

  it("rejects float candidate ID (int() requires whole numbers)", () => {
    // z.coerce.number() coerces 42.7 to 42.7, but .int() rejects non-integers
    expect(
      getCandidateProfileSchema.safeParse({ candidateId: 42.7 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock getCandidateDetail + auth, test getCandidateProfile
// ---------------------------------------------------------------------------

// Mock the data layer before importing the action
const mockGetCandidateDetail = vi.fn();
vi.mock("@/modules/candidates/candidate-detail", () => ({
  getCandidateDetail: mockGetCandidateDetail,
}));

// Mock auth for the action-level defense-in-depth check
const mockRequireCapability = vi.fn();
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// Import after mocks are set up
const { getCandidateProfile } = await import("./actions");

describe("getCandidateProfile action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns candidate detail for a valid candidate ID", async () => {
    const fakeDetail = { candidate: { candidate_id: 1 }, metrics: [], invitations: [], workHours: [], histories: [], notes: [], skills: [], tags: [], warnings: [], links: [], idCards: [], applications: [], interviews: [], suggestions: [], education: [], experiences: [], certificates: [], languages: [], stats: null };
    mockGetCandidateDetail.mockResolvedValue(fakeDetail);

    const result = await getCandidateProfile({ candidateId: 1 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
    expect(mockGetCandidateDetail).toHaveBeenCalledWith(
      1,
      "/candidate/invitations",
    );
    expect(result).toBe(fakeDetail);
  });

  it("passes the correct requestBasePath", async () => {
    const fakeDetail = { candidate: { candidate_id: 2 }, metrics: [], invitations: [], workHours: [], histories: [], notes: [], skills: [], tags: [], warnings: [], links: [], idCards: [], applications: [], interviews: [], suggestions: [], education: [], experiences: [], certificates: [], languages: [], stats: null };
    mockGetCandidateDetail.mockResolvedValue(fakeDetail);

    await getCandidateProfile({ candidateId: 2 });

    expect(mockGetCandidateDetail).toHaveBeenCalledWith(
      2,
      "/candidate/invitations",
    );
  });

  it("requires candidate.read.own capability (defense-in-depth)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));

    await expect(
      getCandidateProfile({ candidateId: 1 }),
    ).rejects.toThrow("Forbidden");
    expect(mockGetCandidateDetail).not.toHaveBeenCalled();
  });

  it("throws when getCandidateDetail rejects", async () => {
    mockGetCandidateDetail.mockRejectedValue(new Error("DB error"));

    await expect(
      getCandidateProfile({ candidateId: 1 }),
    ).rejects.toThrow("DB error");
  });

  it("throws on invalid input (negative ID)", async () => {
    await expect(
      getCandidateProfile({ candidateId: -1 }),
    ).rejects.toThrow("Candidate ID is required");
    expect(mockGetCandidateDetail).not.toHaveBeenCalled();
  });

  it("throws on missing candidateId", async () => {
    await expect(
      getCandidateProfile({} as unknown as GetCandidateProfileInput),
    ).rejects.toThrow();
    expect(mockGetCandidateDetail).not.toHaveBeenCalled();
  });

  it("coerces string ID before calling getCandidateDetail", async () => {
    const fakeDetail = { candidate: { candidate_id: 3 }, metrics: [], invitations: [], workHours: [], histories: [], notes: [], skills: [], tags: [], warnings: [], links: [], idCards: [], applications: [], interviews: [], suggestions: [], education: [], experiences: [], certificates: [], languages: [], stats: null };
    mockGetCandidateDetail.mockResolvedValue(fakeDetail);

    await getCandidateProfile({ candidateId: "3" as unknown as number });

    expect(mockGetCandidateDetail).toHaveBeenCalledWith(3, "/candidate/invitations");
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

import { candidateProfileOutputSchema } from "./schemas";

describe("candidateProfileOutputSchema", () => {
  it("accepts a valid full output", () => {
    const valid = {
      candidate: { candidate_id: 1, candidate_name: "Test" },
      metrics: [{ label: "Status", value: "Active", note: "Good" }],
      invitations: [],
      workHours: [],
      histories: [],
      notes: [],
      skills: [],
      tags: [],
      warnings: [],
      links: [],
      idCards: [],
      applications: [],
      interviews: [],
      suggestions: [],
      education: [],
      experiences: [],
      certificates: [],
      languages: [],
      stats: null,
    };
    const r = candidateProfileOutputSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects missing required arrays", () => {
    const r = candidateProfileOutputSchema.safeParse({ candidate: null });
    expect(r.success).toBe(false);
  });

  it("accepts null candidate and stats", () => {
    const minimal = {
      candidate: null,
      metrics: [],
      invitations: [],
      workHours: [],
      histories: [],
      notes: [],
      skills: [],
      tags: [],
      warnings: [],
      links: [],
      idCards: [],
      applications: [],
      interviews: [],
      suggestions: [],
      education: [],
      experiences: [],
      certificates: [],
      languages: [],
      stats: null,
    };
    const r = candidateProfileOutputSchema.safeParse(minimal);
    expect(r.success).toBe(true);
  });
});
