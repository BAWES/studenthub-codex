import { describe, it, expect } from "vitest";
import {
  getInvitationSchema,
  respondInvitationSchema,
  type RespondInvitationInput,
} from "./actions";

// ---------------------------------------------------------------------------
// getInvitationSchema
// ---------------------------------------------------------------------------

describe("getInvitationSchema ([id] route)", () => {
  it("accepts a valid invitation UUID", () => {
    const result = getInvitationSchema.safeParse({
      invitationUuid: "inv_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("inv_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    expect(getInvitationSchema.safeParse({ invitationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getInvitationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// respondInvitationSchema
// ---------------------------------------------------------------------------

describe("respondInvitationSchema ([id] route)", () => {
  it("accepts a valid invitation UUID without reason", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "inv_abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("inv_abc-123");
      expect(result.data.reason).toBeUndefined();
    }
  });

  it("accepts a valid invitation UUID with reason", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "inv_abc-123",
      reason: "Found a better opportunity",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("Found a better opportunity");
    }
  });

  it("rejects empty invitation UUID", () => {
    expect(
      respondInvitationSchema.safeParse({
        invitationUuid: "",
        reason: "Some reason",
      }).success,
    ).toBe(false);
  });

  it("rejects missing invitation UUID", () => {
    expect(respondInvitationSchema.safeParse({ reason: "Reason" }).success).toBe(false);
  });

  it("accepts empty string reason (optional string allows empty)", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "inv_abc-123",
      reason: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("");
    }
  });

  it("rejects reason over 1000 characters", () => {
    expect(
      respondInvitationSchema.safeParse({
        invitationUuid: "inv_abc-123",
        reason: "x".repeat(1001),
      }).success,
    ).toBe(false);
  });

  it("accepts reason at exactly 1000 characters", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "inv_abc-123",
      reason: "x".repeat(1000),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("RespondInvitationInput shape", () => {
  it("accepts minimal input (UUID only)", () => {
    const input: RespondInvitationInput = {
      invitationUuid: "inv_abc-123",
    };
    expect(input.invitationUuid).toBe("inv_abc-123");
  });

  it("accepts full input with reason", () => {
    const input: RespondInvitationInput = {
      invitationUuid: "inv_abc-123",
      reason: "Not interested at this time",
    };
    expect(input.reason).toBe("Not interested at this time");
  });
});
