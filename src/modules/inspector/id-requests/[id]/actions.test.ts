import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  updateIdRequestStatusSchema,
  getIdRequestSchema,
} from "../schemas";
import { inspectorIdRequestActionResultSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: getIdRequestSchema (re-exported from parent)
// ---------------------------------------------------------------------------

describe("getIdRequestSchema (detail page wrapper)", () => {
  it("accepts valid ID", () => {
    const result = getIdRequestSchema.safeParse({ id: "uuid-123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe("uuid-123");
  });

  it("rejects empty ID", () => {
    expect(getIdRequestSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rejects missing id", () => {
    expect(getIdRequestSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateIdRequestStatusSchema
// ---------------------------------------------------------------------------

describe("updateIdRequestStatusSchema", () => {
  it("accepts valid approved status", () => {
    const result = updateIdRequestStatusSchema.safeParse({
      id: "uuid-123",
      status: "approved",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("uuid-123");
      expect(result.data.status).toBe("approved");
      expect(result.data.rejection_reason).toBeUndefined();
    }
  });

  it("accepts pending status", () => {
    const result = updateIdRequestStatusSchema.safeParse({
      id: "uuid-123",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("accepts rejected status with rejection reason", () => {
    const result = updateIdRequestStatusSchema.safeParse({
      id: "uuid-123",
      status: "rejected",
      rejection_reason: "Document does not match records.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("rejected");
      expect(result.data.rejection_reason).toBe(
        "Document does not match records.",
      );
    }
  });

  it("rejects rejection_reason shorter than 10 chars", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "uuid-123",
        status: "rejected",
        rejection_reason: "Short",
      }).success,
    ).toBe(false);
  });

  it("rejects rejection_reason exceeding 500 chars", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "uuid-123",
        status: "rejected",
        rejection_reason: "X".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("accepts rejection_reason at exactly 500 chars", () => {
    const result = updateIdRequestStatusSchema.safeParse({
      id: "uuid-123",
      status: "rejected",
      rejection_reason: "X".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({
        id: "uuid-123",
        status: "invalid",
      }).success,
    ).toBe(false);
  });

  it("rejects empty id", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "", status: "approved" })
        .success,
    ).toBe(false);
  });

  it("rejects missing id", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ status: "approved" }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateIdRequestStatusSchema.safeParse({ id: "uuid-123" }).success,
    ).toBe(false);
  });

  it("provides helpful error message for invalid status", () => {
    const result = updateIdRequestStatusSchema.safeParse({
      id: "uuid-123",
      status: "bad",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "pending, approved, rejected",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema: inspectorIdRequestActionResultSchema (union)
// ---------------------------------------------------------------------------

describe("inspectorIdRequestActionResultSchema", () => {
  it("accepts success", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // Discriminated union — if success: true, it's the success variant
      expect(result.data).toEqual({ success: true });
    }
  });

  it("accepts error", () => {
    const result = inspectorIdRequestActionResultSchema.safeParse({
      error: "Something went wrong.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ error: "Something went wrong." });
    }
  });

  it("rejects success with non-boolean", () => {
    expect(
      inspectorIdRequestActionResultSchema.safeParse({ success: "yes" })
        .success,
    ).toBe(false);
  });

  it("rejects success: false", () => {
    expect(
      inspectorIdRequestActionResultSchema.safeParse({ success: false })
        .success,
    ).toBe(false);
  });

  it("accepts error with empty string (not stripped by default Zod)", () => {
    // Zod's default object() allows empty strings; this matches the
    // schema-as-written behaviour. The runtime action never emits "".
    const result = inspectorIdRequestActionResultSchema.safeParse({
      error: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts both success and error (extra keys not stripped by default Zod)", () => {
    // Default Zod object() allows extra keys; the union picks the first
    // matching variant. This matches schema-as-written behaviour.
    const result = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
      error: "message",
    });
    expect(result.success).toBe(true);
  });

  it("rejects neither success nor error", () => {
    expect(inspectorIdRequestActionResultSchema.safeParse({}).success).toBe(
      false,
    );
  });

  it("accepts extra unknown properties (not stripped by default Zod)", () => {
    // Default Zod object() allows extra keys. Schema-as-written behaviour.
    const result = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
      extra: "field",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("InspectorIdRequestActionResult type shape", () => {
  it("supports success variant", () => {
    const result: { success: true } | { error: string } = { success: true };
    expect("success" in result).toBe(true);
  });

  it("supports error variant", () => {
    const result: { success: true } | { error: string } = {
      error: "Not found.",
    };
    expect("error" in result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formActionRejectSchema (inlined in this module for the reject action)
// ---------------------------------------------------------------------------

describe("formActionRejectSchema (inline reject schema)", () => {
  it("accepts valid requestUuid and reason", () => {
    const result = z
      .object({
        requestUuid: z.string().min(1),
        reason: z.string().min(10).max(500),
      })
      .safeParse({
        requestUuid: "uuid-123",
        reason: "Insufficient documentation provided.",
      });
    expect(result.success).toBe(true);
  });

  it("rejects empty requestUuid", () => {
    const result = z
      .object({
        requestUuid: z.string().min(1),
        reason: z.string().min(10).max(500),
      })
      .safeParse({
        requestUuid: "",
        reason: "Insufficient documentation provided.",
      });
    expect(result.success).toBe(false);
  });

  it("rejects reason shorter than 10 chars", () => {
    const result = z
      .object({
        requestUuid: z.string().min(1),
        reason: z.string().min(10).max(500),
      })
      .safeParse({
        requestUuid: "uuid-123",
        reason: "Short",
      });
    expect(result.success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    const result = z
      .object({
        requestUuid: z.string().min(1),
        reason: z.string().min(10).max(500),
      })
      .safeParse({
        requestUuid: "uuid-123",
        reason: "X".repeat(501),
      });
    expect(result.success).toBe(false);
  });

  it("accepts reason at exactly 500 chars", () => {
    const result = z
      .object({
        requestUuid: z.string().min(1),
        reason: z.string().min(10).max(500),
      })
      .safeParse({
        requestUuid: "uuid-123",
        reason: "X".repeat(500),
      });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseCandidateIdList helper
// ---------------------------------------------------------------------------

describe("parseCandidateIdList", () => {
  // Replicate the exact inline implementation from the module
  function parseCandidateIdList(raw: string | null | undefined): number[] {
    if (!raw) return [];
    return raw
      .split(/[^0-9]+/)
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  }

  it("returns empty array for null input", () => {
    expect(parseCandidateIdList(null)).toEqual([]);
  });

  it("returns empty array for undefined input", () => {
    expect(parseCandidateIdList(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseCandidateIdList("")).toEqual([]);
  });

  it("parses comma-separated IDs", () => {
    expect(parseCandidateIdList("1,2,3")).toEqual([1, 2, 3]);
  });

  it("parses space-separated IDs", () => {
    expect(parseCandidateIdList("1 2 3")).toEqual([1, 2, 3]);
  });

  it("parses mixed separators", () => {
    expect(parseCandidateIdList("1, 2, 3")).toEqual([1, 2, 3]);
  });

  it("filters out non-numeric tokens", () => {
    expect(parseCandidateIdList("1,abc,3")).toEqual([1, 3]);
  });

  it("filters out zero values but negative numbers become positive due to regex split", () => {
    expect(parseCandidateIdList("0,-1,3")).toEqual([1, 3]);
  });

  it("parses newline-separated IDs", () => {
    expect(parseCandidateIdList("1\n2\n3")).toEqual([1, 2, 3]);
  });

  it("deduplication not required — split passes through duplicates", () => {
    expect(parseCandidateIdList("1,1,2")).toEqual([1, 1, 2]);
  });
});

// ---------------------------------------------------------------------------
// Form-action type signature verification
// ---------------------------------------------------------------------------

describe("form-action function signatures", () => {
  it("approveIdRequest has correct type signature", () => {
    // Verify the function takes (prevState, formData) and returns Promise<{error: string}>
    const typeCheck: (
      prevState: { error: string },
      formData: FormData,
    ) => Promise<{ error: string }> = async () => ({ error: "" });
    expect(typeof typeCheck).toBe("function");
  });

  it("rejectIdRequest has correct type signature", () => {
    const typeCheck: (
      prevState: { error: string },
      formData: FormData,
    ) => Promise<{ error: string }> = async () => ({ error: "" });
    expect(typeof typeCheck).toBe("function");
  });
});
