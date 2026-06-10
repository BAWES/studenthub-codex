import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExperienceActionResult } from "../../schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRevalidatePath, mockParentUpdateExperienceEntry } = vi.hoisted(
  () => ({
    mockRevalidatePath: vi.fn(),
    mockParentUpdateExperienceEntry: vi.fn(),
  }),
);

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock parent action ──────────────────────────────────────
vi.mock("../actions", () => ({
  updateExperienceEntry: mockParentUpdateExperienceEntry,
}));

import { updateExperienceEntry } from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for candidate/experience/[experienceId]/edit actions
// (STU-3277)
//
// The edit action is a thin wrapper that delegates to the parent
// updateExperienceEntry action and re-validates the experience page
// on success.
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

describe("updateExperienceEntry \u2014 edit wrapper", () => {
  const EXPERIENCE_ID = 42;
  const EXPERIENCE = "Software Engineer";
  const EMPLOYER = "Tech Corp";
  const START_YEAR = 2020;
  const END_YEAR = 2024;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to parent updateExperienceEntry with all params", async () => {
    mockParentUpdateExperienceEntry.mockResolvedValue({
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

    expect(mockParentUpdateExperienceEntry).toHaveBeenCalledWith(
      EXPERIENCE_ID,
      EXPERIENCE,
      EMPLOYER,
      START_YEAR,
      END_YEAR,
    );
  });

  it("delegates to parent with minimal params (experienceId + experience only)", async () => {
    mockParentUpdateExperienceEntry.mockResolvedValue({
      success: true,
      experienceId: EXPERIENCE_ID,
    });

    await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(mockParentUpdateExperienceEntry).toHaveBeenCalledWith(
      EXPERIENCE_ID,
      EXPERIENCE,
      undefined,
      undefined,
      undefined,
    );
  });

  it("re-validates the experience path when update succeeds", async () => {
    mockParentUpdateExperienceEntry.mockResolvedValue({
      success: true,
      experienceId: EXPERIENCE_ID,
    });

    await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/candidate/experience/${EXPERIENCE_ID}`,
    );
  });

  it("does NOT re-validate when update fails", async () => {
    mockParentUpdateExperienceEntry.mockResolvedValue({
      success: false,
      error: "Not found",
    });

    await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns the parent result directly on success", async () => {
    const expected = { success: true, experienceId: EXPERIENCE_ID };
    mockParentUpdateExperienceEntry.mockResolvedValue(expected);

    const result = await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(result).toEqual(expected);
  });

  it("returns the parent error result on failure", async () => {
    const expected = { success: false, error: "Permission denied" };
    mockParentUpdateExperienceEntry.mockResolvedValue(expected);

    const result = await updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE);

    expect(result).toEqual(expected);
  });

  it("propagates exceptions from parent", async () => {
    mockParentUpdateExperienceEntry.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE),
    ).rejects.toThrow("Database error");
  });

  it("does not re-validate when parent throws", async () => {
    mockParentUpdateExperienceEntry.mockRejectedValue(
      new Error("Database error"),
    );

    await expect(
      updateExperienceEntry(EXPERIENCE_ID, EXPERIENCE),
    ).rejects.toThrow();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
