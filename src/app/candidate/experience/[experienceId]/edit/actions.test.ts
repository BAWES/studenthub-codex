import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExperienceActionResult } from "../../schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRevalidatePath, mockUpdateExperienceEntry } = vi.hoisted(
  () => ({
    mockRevalidatePath: vi.fn(),
    mockUpdateExperienceEntry: vi.fn(),
  }),
);

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock module-level action ────────────────────────────────
vi.mock("@/modules/candidate/experience/actions", () => ({
  updateExperienceEntry: mockUpdateExperienceEntry,
}));

import { updateExperienceEntry } from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for candidate/experience/[experienceId]/edit actions
// (STU-3277)
//
// The edit route is now a barrel re-export of the module-level
// updateExperienceEntry. These tests verify the re-export contract.
// ---------------------------------------------------------------------------

describe("ExperienceActionResult shape", () => {
  it("accepts success result", () => {
    const result: ExperienceActionResult = {
      success: true,
      experienceId: 42,
    };
    expect(result.success).toBe(true);
    expect(result.experienceId).toBe(42);
  });

  it("accepts failure result", () => {
    const result: ExperienceActionResult = {
      success: false,
      error: "Experience name is required",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Experience name is required");
  });
});

describe("updateExperienceEntry — edit route barrel", () => {
  const EXPERIENCE_ID = 42;
  const EXPERIENCE = "Software Engineer";
  const EMPLOYER = "Tech Corp";
  const START_YEAR = 2020;
  const END_YEAR = 2024;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module-level updateExperienceEntry with all params", async () => {
    mockUpdateExperienceEntry.mockResolvedValue({
      success: true,
      experienceId: EXPERIENCE_ID,
    });

    await updateExperienceEntry(
      EXPERIENCE_ID,
      EXPERIENCE,
      EMPLOYER,
      START_YEAR,
      END_YEAR,
    );

    expect(mockUpdateExperienceEntry).toHaveBeenCalledWith(
      EXPERIENCE_ID,
      EXPERIENCE,
      EMPLOYER,
      START_YEAR,
      END_YEAR,
    );
  });

  it("delegates to module-level with minimal params (experienceId + experience only)", async () => {
    mockUpdateExperienceEntry.mockResolvedValue({
      success: true,
      experienceId: EXPERIENCE_ID,
    });

    await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(mockUpdateExperienceEntry).toHaveBeenCalledWith(
      EXPERIENCE_ID,
      EXPERIENCE,
    );
  });

  it("returns the module-level result directly on success", async () => {
    const expected = { success: true, experienceId: EXPERIENCE_ID };
    mockUpdateExperienceEntry.mockResolvedValue(expected);

    const result = await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(result).toEqual(expected);
  });

  it("returns the module-level error result on failure", async () => {
    const expected = { success: false, error: "Permission denied" };
    mockUpdateExperienceEntry.mockResolvedValue(expected);

    const result = await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(result).toEqual(expected);
  });

  it("propagates exceptions from module-level", async () => {
    mockUpdateExperienceEntry.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE),
    ).rejects.toThrow("Database error");
  });
});
