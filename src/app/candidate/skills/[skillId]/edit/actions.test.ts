import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SkillActionResult } from "../actions";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRevalidatePath, mockParentUpdateSkill } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockParentUpdateSkill: vi.fn(),
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock parent action ──────────────────────────────────────
vi.mock("../actions", () => ({
  updateSkill: mockParentUpdateSkill,
}));

import { updateSkill } from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for candidate/skills/[skillId]/edit actions
// (STU-3280)
//
// The edit action is a thin wrapper that delegates to the parent updateSkill
// and re-validates the skills detail page path on success.
// This test validates:
//   - Delegation to parent action with correct params
//   - Path re-validation on success
//   - No re-validation on failure
//   - Proper result forwarding
// ---------------------------------------------------------------------------

describe("SkillActionResult shape", () => {
  it("accepts success result", () => {
    const result: SkillActionResult = {
      success: true,
      skillId: 42,
    };
    expect(result.success).toBe(true);
    expect(result.skillId).toBe(42);
  });

  it("accepts failure result", () => {
    const result: SkillActionResult = {
      success: false,
      error: "Skill name is required",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Skill name is required");
  });
});

describe("updateSkill \u2014 edit wrapper", () => {
  const SKILL_ID = 42;
  const SKILL = "TypeScript";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to parent updateSkill with all params", async () => {
    mockParentUpdateSkill.mockResolvedValue({
      success: true,
      skillId: SKILL_ID,
    });

    await updateSkill(SKILL_ID, SKILL);

    expect(mockParentUpdateSkill).toHaveBeenCalledWith(SKILL_ID, SKILL);
  });

  it("re-validates the skill path when update succeeds", async () => {
    mockParentUpdateSkill.mockResolvedValue({
      success: true,
      skillId: SKILL_ID,
    });

    await updateSkill(SKILL_ID, SKILL);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/candidate/skills/${SKILL_ID}`,
    );
  });

  it("does NOT re-validate when update fails", async () => {
    mockParentUpdateSkill.mockResolvedValue({
      success: false,
      error: "Not found",
    });

    await updateSkill(SKILL_ID, SKILL);

    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns the parent result directly on success", async () => {
    const expected = { success: true, skillId: SKILL_ID };
    mockParentUpdateSkill.mockResolvedValue(expected);

    const result = await updateSkill(SKILL_ID, SKILL);

    expect(result).toEqual(expected);
  });

  it("returns the parent error result on failure", async () => {
    const expected = { success: false, error: "Permission denied" };
    mockParentUpdateSkill.mockResolvedValue(expected);

    const result = await updateSkill(SKILL_ID, SKILL);

    expect(result).toEqual(expected);
  });

  it("propagates exceptions from parent", async () => {
    mockParentUpdateSkill.mockRejectedValue(new Error("Database error"));

    await expect(updateSkill(SKILL_ID, SKILL)).rejects.toThrow("Database error");
  });

  it("does not re-validate when parent throws", async () => {
    mockParentUpdateSkill.mockRejectedValue(new Error("Database error"));

    await expect(updateSkill(SKILL_ID, SKILL)).rejects.toThrow();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
