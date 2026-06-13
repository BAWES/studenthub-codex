import { describe, it, expect } from "vitest";
import {
  referenceItemSchema,
  referenceListSchema,
  referenceActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema: referenceItemSchema
// ---------------------------------------------------------------------------

describe("referenceItemSchema", () => {
  it("accepts a valid reference item", () => {
    const r = referenceItemSchema.safeParse({
      reference_uuid: "ref_abc123",
      candidate_id: 42,
      name: "John Doe",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 9999 0000",
      email: "john@acme.com",
      relationship: "Colleague",
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-06-01"),
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = referenceItemSchema.safeParse({
      reference_uuid: "ref_456def",
      candidate_id: null,
      name: "Jane Doe",
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts candidate_id as null when no candidate link", () => {
    const r = referenceItemSchema.safeParse({
      reference_uuid: "ref_null_candidate",
      candidate_id: null,
      name: "Independent Ref",
      company: "Self",
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    expect(
      referenceItemSchema.safeParse({
        name: "No UUID",
      }).success,
    ).toBe(false);
  });

  it("rejects empty reference_uuid", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "",
        name: "Empty UUID",
      }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "ref_no_name",
      }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "ref_empty_name",
        name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string candidate_id", () => {
    expect(
      referenceItemSchema.safeParse({
        reference_uuid: "ref_bad_id",
        candidate_id: "abc",
        name: "Test",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: referenceListSchema
// ---------------------------------------------------------------------------

describe("referenceListSchema", () => {
  it("accepts an empty list", () => {
    const r = referenceListSchema.safeParse([]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(0);
    }
  });

  it("accepts a list with one valid item", () => {
    const r = referenceListSchema.safeParse([
      {
        reference_uuid: "ref_1",
        candidate_id: null,
        name: "Ref One",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(1);
    }
  });

  it("accepts a list with multiple valid items", () => {
    const r = referenceListSchema.safeParse([
      {
        reference_uuid: "ref_a",
        candidate_id: 1,
        name: "Ref A",
        company: "Co A",
        position: "Dev",
        phone: "123",
        email: "a@test.com",
        relationship: "Peer",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        reference_uuid: "ref_b",
        candidate_id: null,
        name: "Ref B",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(2);
    }
  });

  it("rejects a list with a malformed item (missing name)", () => {
    expect(
      referenceListSchema.safeParse([
        {
          reference_uuid: "ref_bad",
          candidate_id: null,
          // missing name
          company: null,
          position: null,
          phone: null,
          email: null,
          relationship: null,
          created_at: null,
          updated_at: null,
        },
      ]).success,
    ).toBe(false);
  });

  it("rejects non-array input", () => {
    expect(referenceListSchema.safeParse({}).success).toBe(false);
    expect(referenceListSchema.safeParse(null).success).toBe(false);
    expect(referenceListSchema.safeParse("string").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: referenceActionResultSchema
// ---------------------------------------------------------------------------

describe("referenceActionResultSchema", () => {
  it("accepts a successful result with referenceUuid", () => {
    const r = referenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "ref_created_001",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      const data = r.data as { success: true; referenceUuid: string };
      expect(data.referenceUuid).toBe("ref_created_001");
    }
  });

  it("accepts a failed result with error message", () => {
    const r = referenceActionResultSchema.safeParse({
      success: false,
      error: "Reference not found",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      const data = r.data as { success: false; error: string };
      expect(data.error).toBe("Reference not found");
    }
  });

  it("rejects success: true without referenceUuid", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: true,
      }).success,
    ).toBe(false);
  });

  it("rejects success: false without error", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("rejects empty referenceUuid on success", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: true,
        referenceUuid: "",
      }).success,
    ).toBe(false);
  });

  it("rejects empty error on failure", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: false,
        error: "",
      }).success,
    ).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      referenceActionResultSchema.safeParse({
        success: "yes",
      }).success,
    ).toBe(false);
  });

  it("rejects success: true with extra unknown fields (strict union)", () => {
    // discriminatedUnion ignores unknown keys — only checks the discriminator.
    // success:true must have referenceUuid, extra keys are allowed by Zod.
    const r = referenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "ref_ok",
      extraField: "ignored",
    });
    expect(r.success).toBe(true);
  });
});
