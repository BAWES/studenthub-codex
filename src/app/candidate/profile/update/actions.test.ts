import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import type { ProfileActionResult } from "./actions";

// ---------------------------------------------------------------------------
// Mocks — module-level actions instead of Prisma directly
// ---------------------------------------------------------------------------

const mockGetProfileData = vi.fn();
const mockUpdateProfileData = vi.fn();

vi.mock("@/modules/candidates/profile/actions", () => ({
  getCandidateProfileData: mockGetProfileData,
  updateCandidateProfileData: mockUpdateProfileData,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");
const actions = await import("./actions");

const mockUser = {
  role: "candidate" as const,
  id: "1",
  name: "Test Candidate",
  email: "test@candidate.studenthub.local",
  issuedAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------

const mockProfileData = {
  candidateId: 1,
  name: "Test User",
  nameAr: "",
  email: "test@example.com",
  phone: null,
  photoUrl: null,
  objective: null,
  intro: null,
  address: null,
  gender: null,
  birthDate: null,
  drivingLicense: null,
  civilId: null,
  hourlyRate: null,
  profileUrl: null,
  preferredTime: null,
  bankAccountName: null,
  iban: null,
  countryId: null,
  universityId: null,
  bankId: null,
};

// ---------------------------------------------------------------------------
// Tests — getProfile
// ---------------------------------------------------------------------------

describe("getProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockGetProfileData.mockResolvedValue(mockProfileData);
  });

  it("succeeds when session and module return valid data", async () => {
    const result = await actions.getProfile();
    expect(result.candidateId).toBe(1);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
  });

  it("throws when candidate not found", async () => {
    mockGetProfileData.mockRejectedValue(
      new Error("Candidate profile not found"),
    );
    await expect(actions.getProfile()).rejects.toThrow(
      "Candidate profile not found",
    );
  });

  it("throws when session fails", async () => {
    vi.mocked(requireRoleCapability).mockRejectedValue(
      new Error("Unauthenticated"),
    );
    await expect(actions.getProfile()).rejects.toThrow("Unauthenticated");
    expect(mockGetProfileData).not.toHaveBeenCalled();
  });

  it("maps nullable fields correctly", async () => {
    mockGetProfileData.mockResolvedValue({
      ...mockProfileData,
      candidateId: 2,
      name: "Alice",
      nameAr: "أليس",
      phone: "+965 5123 4567",
      drivingLicense: true,
      hourlyRate: 15.5,
      countryId: 1,
      universityId: 3,
    });

    const result = await actions.getProfile();
    expect(result.candidateId).toBe(2);
    expect(result.name).toBe("Alice");
    expect(result.nameAr).toBe("أليس");
    expect(result.phone).toBe("+965 5123 4567");
    expect(result.drivingLicense).toBe(true);
    expect(result.hourlyRate).toBe(15.5);
    expect(result.countryId).toBe(1);
    expect(result.universityId).toBe(3);
  });

  it("passes the correct candidate ID to the module", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue({
      ...mockUser,
      id: "7",
    });
    await actions.getProfile();
    expect(mockGetProfileData).toHaveBeenCalledWith({ candidateId: 7 });
  });
});

// ---------------------------------------------------------------------------
// Tests — updateProfile
// ---------------------------------------------------------------------------

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser);
    mockUpdateProfileData.mockResolvedValue({ success: true });
  });

  // -------- Success cases --------

  it("returns success when input is valid", async () => {
    const result = await actions.updateProfile({ name: "Updated Name" });
    expect(result).toEqual({ success: true });
    expect(mockUpdateProfileData).toHaveBeenCalledOnce();
  });

  it("passes the correct candidate ID to the module", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue({
      ...mockUser,
      id: "5",
    });
    await actions.updateProfile({ name: "Charlie" });

    expect(mockUpdateProfileData).toHaveBeenCalledWith(
      expect.objectContaining({ candidateId: 5 }),
    );
  });

  it("revalidates paths on success", async () => {
    await actions.updateProfile({ name: "Test" });
    expect(revalidatePath).toHaveBeenCalledWith("/candidate");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/edit");
    expect(revalidatePath).toHaveBeenCalledWith("/candidate/profile");
  });

  // -------- Validation failure cases --------

  it("returns error for missing name", async () => {
    const result = (await actions.updateProfile(
      {} as Parameters<typeof actions.updateProfile>[0],
    )) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdateProfileData).not.toHaveBeenCalled();
    }
  });

  it("returns error for name exceeding 255 chars", async () => {
    const result = (await actions.updateProfile({
      name: "A".repeat(256),
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdateProfileData).not.toHaveBeenCalled();
    }
  });

  it("returns error for negative hourly rate", async () => {
    const result = (await actions.updateProfile({
      name: "Test",
      hourlyRate: -5,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(mockUpdateProfileData).not.toHaveBeenCalled();
    }
  });

  it("returns error for hourly rate > 9999", async () => {
    const result = (await actions.updateProfile({
      name: "Test",
      hourlyRate: 10000,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    expect(mockUpdateProfileData).not.toHaveBeenCalled();
  });

  it("returns error for invalid gender value (outside 0-2)", async () => {
    const result = (await actions.updateProfile({
      name: "Test",
      gender: 5,
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    expect(mockUpdateProfileData).not.toHaveBeenCalled();
  });

  it("includes fieldErrors in validation failure", async () => {
    const result = (await actions.updateProfile({
      name: "",
    })) as ProfileActionResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors!.name).toBeDefined();
    }
  });

  // -------- Auth failure --------

  it("throws when session auth fails", async () => {
    vi.mocked(requireRoleCapability).mockRejectedValue(
      new Error("Unauthorized"),
    );

    await expect(
      actions.updateProfile({ name: "Test" }),
    ).rejects.toThrow("Unauthorized");

    expect(mockUpdateProfileData).not.toHaveBeenCalled();
  });

  // -------- Module failure --------

  it("propagates module update errors", async () => {
    mockUpdateProfileData.mockRejectedValue(new Error("DB connection error"));

    await expect(
      actions.updateProfile({ name: "Test" }),
    ).rejects.toThrow("DB connection error");
  });
});
