import { describe, it, expect } from "vitest";
import {
  getCandidateWorkLogDetailSchema,
  approveWorkLogAppealSchema,
  rejectWorkLogAppealSchema,
  updateWorkLogSchema,
  deleteWorkLogSchema,
  getWorkLogAppealsSchema,
  getWorkLogFeedbackSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateWorkLogDetailSchema
// ---------------------------------------------------------------------------

describe("getCandidateWorkLogDetailSchema", () => {
  it("accepts a valid work log UUID", () => {
    const result = getCandidateWorkLogDetailSchema.safeParse({
      workLogUuid: "wl_test-uuid-12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wl_test-uuid-12345");
    }
  });

  it("rejects empty UUID", () => {
    const result = getCandidateWorkLogDetailSchema.safeParse({
      workLogUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCandidateWorkLogDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveWorkLogAppealSchema
// ---------------------------------------------------------------------------

describe("approveWorkLogAppealSchema", () => {
  it("accepts a valid appeal UUID", () => {
    const result = approveWorkLogAppealSchema.safeParse({
      appealUuid: "appeal_uuid_12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appealUuid).toBe("appeal_uuid_12345");
    }
  });

  it("rejects empty UUID", () => {
    const result = approveWorkLogAppealSchema.safeParse({
      appealUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = approveWorkLogAppealSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rejectWorkLogAppealSchema
// ---------------------------------------------------------------------------

describe("rejectWorkLogAppealSchema", () => {
  it("accepts valid appeal UUID with reason", () => {
    const result = rejectWorkLogAppealSchema.safeParse({
      appealUuid: "appeal_uuid_12345",
      reason: "Time entry does not match store records",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appealUuid).toBe("appeal_uuid_12345");
      expect(result.data.reason).toBe("Time entry does not match store records");
    }
  });

  it("rejects empty reason", () => {
    const result = rejectWorkLogAppealSchema.safeParse({
      appealUuid: "appeal_uuid_12345",
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = rejectWorkLogAppealSchema.safeParse({
      appealUuid: "appeal_uuid_12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing appealUuid", () => {
    const result = rejectWorkLogAppealSchema.safeParse({
      reason: "Insufficient evidence",
    });
    expect(result.success).toBe(false);
  });

  it("rejects reason over 1000 characters", () => {
    const result = rejectWorkLogAppealSchema.safeParse({
      appealUuid: "appeal_uuid_12345",
      reason: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkLogSchema
// ---------------------------------------------------------------------------

describe("updateWorkLogSchema", () => {
  it("accepts valid UUID and status", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wl_abc123");
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts optional note", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "wl_abc123",
      status: 2,
      note: "Updated by candidate",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Updated by candidate");
    }
  });

  it("rejects empty UUID", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "",
      status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateWorkLogSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative status", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "wl_abc",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string status to number", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "wl_abc",
      status: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects note over 1000 chars", () => {
    const result = updateWorkLogSchema.safeParse({
      workLogUuid: "wl_abc",
      status: 1,
      note: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteWorkLogSchema
// ---------------------------------------------------------------------------

describe("deleteWorkLogSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteWorkLogSchema.safeParse({
      workLogUuid: "wl_xyz",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteWorkLogSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteWorkLogSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkLogAppealsSchema
// ---------------------------------------------------------------------------

describe("getWorkLogAppealsSchema", () => {
  it("accepts a valid work log UUID", () => {
    const result = getWorkLogAppealsSchema.safeParse({ workLogUuid: "wl_test-uuid-12345" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wl_test-uuid-12345");
    }
  });

  it("rejects empty UUID", () => {
    const result = getWorkLogAppealsSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getWorkLogAppealsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkLogFeedbackSchema
// ---------------------------------------------------------------------------

describe("getWorkLogFeedbackSchema", () => {
  it("accepts a valid work log UUID", () => {
    const result = getWorkLogFeedbackSchema.safeParse({ workLogUuid: "wl_test-uuid-12345" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wl_test-uuid-12345");
    }
  });

  it("rejects empty UUID", () => {
    const result = getWorkLogFeedbackSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getWorkLogFeedbackSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
