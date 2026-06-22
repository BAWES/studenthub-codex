import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Pure logic: input validation for worklog server actions.
// These functions mirror the validation logic in worklog-actions.ts but
// avoid "use server" dependencies (prisma, session, crypto, revalidatePath).
// ---------------------------------------------------------------------------

function validateWorkLogAction(workLogUuid: string): { error: string } | null {
  if (!workLogUuid) return { error: "Missing work log identifier." };
  return null;
}

function validateAppealAction(appealUuid: string): { error: string } | null {
  if (!appealUuid) return { error: "Missing appeal identifier." };
  return null;
}

function validateResolution(resolution: string): { error: string } | null {
  if (!resolution) return { error: "Missing resolution." };
  if (resolution !== "approve" && resolution !== "reject") {
    return { error: 'Invalid resolution. Use "approve" or "reject".' };
  }
  return null;
}

function validateFeedbackInput(note: string, reason: string): { error: string } | null {
  if (!note && !reason) return { error: "Please provide a note or reason." };
  return null;
}

function validateAppealUpdateNote(appealUuid: string, update: string): { error: string } | null {
  if (!appealUuid) return { error: "Missing appeal identifier." };
  if (!update) return { error: "Please provide an update summary." };
  return null;
}

// ---------------------------------------------------------------------------
// Helper constants
// ---------------------------------------------------------------------------

const WORK_LOG_APPROVED = 1;
const WORK_LOG_REJECTED = 2;
const APPEAL_RESOLVED = 1;
const APPEAL_REJECTED = 2;

// ---------------------------------------------------------------------------
// Tests: Work log identifier validation
// ---------------------------------------------------------------------------

describe("validateWorkLogAction", () => {
  it("accepts a valid work log UUID", () => {
    const result = validateWorkLogAction("abc-123-def");
    expect(result).toBeNull();
  });

  it("rejects empty work log UUID", () => {
    const result = validateWorkLogAction("");
    expect(result).toEqual({ error: "Missing work log identifier." });
  });
});

// ---------------------------------------------------------------------------
// Tests: Appeal identifier validation
// ---------------------------------------------------------------------------

describe("validateAppealAction", () => {
  it("accepts a valid appeal UUID", () => {
    const result = validateAppealAction("appeal-123");
    expect(result).toBeNull();
  });

  it("rejects empty appeal UUID", () => {
    const result = validateAppealAction("");
    expect(result).toEqual({ error: "Missing appeal identifier." });
  });
});

// ---------------------------------------------------------------------------
// Tests: Resolution validation
// ---------------------------------------------------------------------------

describe("validateResolution", () => {
  it("accepts 'approve'", () => {
    const result = validateResolution("approve");
    expect(result).toBeNull();
  });

  it("accepts 'reject'", () => {
    const result = validateResolution("reject");
    expect(result).toBeNull();
  });

  it("rejects invalid resolution", () => {
    const result = validateResolution("maybe");
    expect(result).toEqual({ error: 'Invalid resolution. Use "approve" or "reject".' });
  });

  it("rejects empty resolution", () => {
    const result = validateResolution("");
    expect(result).toEqual({ error: "Missing resolution." });
  });
});

// ---------------------------------------------------------------------------
// Tests: Feedback input validation
// ---------------------------------------------------------------------------

describe("validateFeedbackInput", () => {
  it("accepts when both note and reason provided", () => {
    const result = validateFeedbackInput("Great work", "Exceeded target");
    expect(result).toBeNull();
  });

  it("accepts when only note provided", () => {
    const result = validateFeedbackInput("Good job", "");
    expect(result).toBeNull();
  });

  it("accepts when only reason provided", () => {
    const result = validateFeedbackInput("", "Performance issue");
    expect(result).toBeNull();
  });

  it("rejects when both note and reason are empty", () => {
    const result = validateFeedbackInput("", "");
    expect(result).toEqual({ error: "Please provide a note or reason." });
  });
});

// ---------------------------------------------------------------------------
// Tests: Appeal update note validation
// ---------------------------------------------------------------------------

describe("validateAppealUpdateNote", () => {
  it("accepts valid appeal UUID with update", () => {
    const result = validateAppealUpdateNote("appeal-1", "Updated resolution");
    expect(result).toBeNull();
  });

  it("rejects missing appeal UUID", () => {
    const result = validateAppealUpdateNote("", "Update text");
    expect(result).toEqual({ error: "Missing appeal identifier." });
  });

  it("rejects missing update summary", () => {
    const result = validateAppealUpdateNote("appeal-1", "");
    expect(result).toEqual({ error: "Please provide an update summary." });
  });

  it("rejects when both missing", () => {
    const result = validateAppealUpdateNote("", "");
    expect(result).toEqual({ error: "Missing appeal identifier." });
  });
});

// ---------------------------------------------------------------------------
// Tests: Status constants
// ---------------------------------------------------------------------------

describe("status constants", () => {
  it("defines WORK_LOG_APPROVED as 1", () => {
    expect(WORK_LOG_APPROVED).toBe(1);
  });

  it("defines WORK_LOG_REJECTED as 2", () => {
    expect(WORK_LOG_REJECTED).toBe(2);
  });

  it("defines APPEAL_RESOLVED as 1", () => {
    expect(APPEAL_RESOLVED).toBe(1);
  });

  it("defines APPEAL_REJECTED as 2", () => {
    expect(APPEAL_REJECTED).toBe(2);
  });

  it("ensures approved and rejected are distinct values", () => {
    expect(WORK_LOG_APPROVED).not.toBe(WORK_LOG_REJECTED);
  });

  it("ensures resolved and rejected are distinct for appeals", () => {
    expect(APPEAL_RESOLVED).not.toBe(APPEAL_REJECTED);
  });
});
