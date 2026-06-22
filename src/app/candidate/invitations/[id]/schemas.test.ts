import { describe, it, expect } from "vitest";
import {
  getInvitationSchema,
  acceptInvitationSchema,
  declineInvitationSchema,
  invitationExistenceSchema,
  invitationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInvitationSchema — input validation
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
// acceptInvitationSchema — input validation
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
// declineInvitationSchema — input validation
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

// ---------------------------------------------------------------------------
// invitationExistenceSchema — output validation
// ---------------------------------------------------------------------------

describe("invitationExistenceSchema", () => {
  it("accepts a valid invitation object", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_uuid: "abc-123-def-456",
      invitation_status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.invitation_uuid).toBe("abc-123-def-456");
      expect(result.data.invitation_status).toBe(1);
    }
  });

  it("accepts null (not found)", () => {
    const result = invitationExistenceSchema.safeParse(null);
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it("rejects missing invitation_uuid", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing invitation_status", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_uuid: "abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty invitation_uuid", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_uuid: "",
      invitation_status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer invitation_status", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_uuid: "abc-123-def-456",
      invitation_status: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string invitation_status", () => {
    const result = invitationExistenceSchema.safeParse({
      invitation_uuid: "abc-123-def-456",
      invitation_status: "accepted",
    });
    expect(result.success).toBe(false);
  });

  it("rejects undefined", () => {
    const result = invitationExistenceSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationActionResultSchema — output validation
// ---------------------------------------------------------------------------

describe("invitationActionResultSchema", () => {
  it("accepts a successful result", () => {
    const result = invitationActionResultSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.success).toBe(true);
    }
  });

  it("accepts a failed result with error", () => {
    const result = invitationActionResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success: false without error", () => {
    const result = invitationActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts success: true with extra error field (stripped)", () => {
    const result = invitationActionResultSchema.safeParse({
      success: true,
      error: "Should not have error",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.success).toBe(true);
      // error field is stripped by z.object() default behavior
      expect("error" in result.data).toBe(false);
    }
  });

  it("rejects invalid success value", () => {
    const result = invitationActionResultSchema.safeParse({
      success: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing success field", () => {
    const result = invitationActionResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts extra fields on success branch", () => {
    const result = invitationActionResultSchema.safeParse({
      success: true,
      extraField: "ignored",
    });
    expect(result.success).toBe(true);
  });

  it("accepts extra fields on error branch", () => {
    const result = invitationActionResultSchema.safeParse({
      success: false,
      error: "err",
      extraField: 42,
    });
    expect(result.success).toBe(true);
  });
});
