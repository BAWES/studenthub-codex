import { describe, it, expect } from "vitest";
import {
  getInvitationSchema,
  acceptInvitationSchema,
  declineInvitationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInvitationSchema
// ---------------------------------------------------------------------------

describe("getInvitationSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getInvitationSchema.safeParse({ invitationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getInvitationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// acceptInvitationSchema
// ---------------------------------------------------------------------------

describe("acceptInvitationSchema", () => {
  it("accepts a valid UUID", () => {
    const result = acceptInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = acceptInvitationSchema.safeParse({ invitationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = acceptInvitationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// declineInvitationSchema
// ---------------------------------------------------------------------------

describe("declineInvitationSchema", () => {
  it("accepts a valid UUID without reason", () => {
    const result = declineInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("abc-123-def-456");
      expect(result.data.reason).toBe(""); // defaults to empty
    }
  });

  it("accepts a valid UUID with reason", () => {
    const result = declineInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
      reason: "Already accepted another position",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("Already accepted another position");
    }
  });

  it("rejects empty UUID", () => {
    const result = declineInvitationSchema.safeParse({ invitationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects reason over 500 characters", () => {
    const result = declineInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
      reason: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts reason at 500 character boundary", () => {
    const result = declineInvitationSchema.safeParse({
      invitationUuid: "abc-123-def-456",
      reason: "x".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});
