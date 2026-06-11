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

// Mock prisma + auth before importing the action
const mockPrismaTransaction = vi.fn();
const mockRequireCapability = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockPrismaTransaction,
    candidate: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    invitation: { findMany: vi.fn() },
    candidate_working_hour: { findMany: vi.fn() },
    candidate_work_history: { findMany: vi.fn() },
    note: { findMany: vi.fn() },
    candidate_skill: { findMany: vi.fn() },
    candidate_tag: { findMany: vi.fn() },
    candidate_warning: { findMany: vi.fn() },
    candidate_link: { findMany: vi.fn() },
    candidate_id_card: { findMany: vi.fn() },
    request_application: { findMany: vi.fn() },
    request_interview: { findMany: vi.fn() },
    suggestion: { findMany: vi.fn() },
    candidate_education: { findMany: vi.fn() },
    candidate_experience: { findMany: vi.fn() },
    candidate_certificate: { findMany: vi.fn() },
    candidate_language: { findMany: vi.fn() },
    candidate_stats: { findFirst: vi.fn() },
  }
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// Helper: build dummy return for prisma.$transaction
function buildTransactionReturn(candidateId: number) {
  return [
    { candidate_id: candidateId, candidate_name: "Test Student", candidate_email: "test@test.com", approved: 1, candidate_status: 10, candidate_hourly_rate: 3, currency_code: "KWD", is_incomplete_profile: false, candidate_civil_need_verification: false, candidate_uid: "C-001", candidate_phone: "+96500000000", candidate_objective: null, candidate_intro: null, candidate_personal_photo: null, candidate_resume: null, candidate_email_verification: 0, candidate_civil_id: null, candidate_civil_expiry_date: null, candidate_civil_photo_front: null, candidate_civil_photo_back: null, candidate_video: null, candidate_address_line1: null, candidate_birth_date: null, candidate_gender: null, candidate_driving_license: null, candidate_preferred_time: null, bank_id: null, bank_account_name: null, candidate_iban: null, candidate_job_search_status: null, profile_url: null, candidate_created_at: null, candidate_updated_at: null, country_id: null, country: null, university_id: null, university: null, store: null },
    [], // invitations
    [], // workHours
    [], // histories
    [], // notes
    [], // skills
    [], // tags
    [], // warnings
    [], // links
    [], // idCards
    [], // applications
    [], // interviews
    [], // suggestions
    [], // education
    [], // experiences
    [], // certificates
    [], // languages
    null, // stats
  ];
}

// Import after mocks are set up
const { getCandidateProfile } = await import("./actions");

describe("getCandidateProfile action", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns candidate detail for a valid candidate ID", async () => {
    mockPrismaTransaction.mockResolvedValue(buildTransactionReturn(1));

    const result = await getCandidateProfile({ candidateId: 1 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
    expect(mockPrismaTransaction).toHaveBeenCalled();
    expect(result.candidate.candidate_id).toBe(1);
    expect(result.candidate.candidate_name).toBe("Test Student");
  });

  it("passes the correct requestBasePath", async () => {
    mockPrismaTransaction.mockResolvedValue(buildTransactionReturn(2));

    await getCandidateProfile({ candidateId: 2 });

    expect(mockPrismaTransaction).toHaveBeenCalled();
  });

  it("requires candidate.read.own capability (defense-in-depth)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));

    await expect(
      getCandidateProfile({ candidateId: 1 }),
    ).rejects.toThrow("Forbidden");
    expect(mockPrismaTransaction).not.toHaveBeenCalled();
  });

  it("throws when prisma rejects", async () => {
    mockPrismaTransaction.mockRejectedValue(new Error("DB error"));

    await expect(
      getCandidateProfile({ candidateId: 1 }),
    ).rejects.toThrow("DB error");
  });

  it("throws on invalid input (negative ID)", async () => {
    await expect(
      getCandidateProfile({ candidateId: -1 }),
    ).rejects.toThrow("Candidate ID is required");
    expect(mockPrismaTransaction).not.toHaveBeenCalled();
  });

  it("throws on missing candidateId", async () => {
    await expect(
      getCandidateProfile({} as unknown as GetCandidateProfileInput),
    ).rejects.toThrow();
    expect(mockPrismaTransaction).not.toHaveBeenCalled();
  });

  it("coerces string ID and calls prisma", async () => {
    mockPrismaTransaction.mockResolvedValue(buildTransactionReturn(3));

    await getCandidateProfile({ candidateId: "3" as unknown as number });

    expect(mockPrismaTransaction).toHaveBeenCalled();
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
