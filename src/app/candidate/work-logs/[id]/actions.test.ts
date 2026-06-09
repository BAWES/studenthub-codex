import { describe, it, expect } from "vitest";
import {
  getCandidateWorkLogDetailSchema,
  approveWorkLogAppealSchema,
  rejectWorkLogAppealSchema,
} from "./actions";

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
