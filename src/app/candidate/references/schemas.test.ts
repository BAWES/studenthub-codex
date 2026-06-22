import { describe, it, expect } from "vitest";
import {
  listReferenceSchema,
  getReferenceSchema,
  createReferenceSchema,
  updateReferenceSchema,
  deleteReferenceSchema,
  referenceItemOutputSchema,
  referenceListOutputSchema,
  referenceActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listReferenceSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listReferenceSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listReferenceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listReferenceSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listReferenceSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("coerces string page and limit to number", () => {
    const r = listReferenceSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getReferenceSchema", () => {
  it("accepts valid reference UUID", () => {
    const r = getReferenceSchema.safeParse({
      referenceUuid: "ref_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.referenceUuid).toBe("ref_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    expect(getReferenceSchema.safeParse({ referenceUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(getReferenceSchema.safeParse({}).success).toBe(false);
  });
});

describe("createReferenceSchema", () => {
  const validData = {
    name: "Jane Doe",
    company: "Acme Corp",
    position: "Manager",
    phone: "+965 5555 1234",
    email: "jane@acme.com",
    relationship: "Former supervisor",
  };

  it("accepts valid input with all fields", () => {
    expect(createReferenceSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts input with only required name", () => {
    const r = createReferenceSchema.safeParse({ name: "Jane Doe" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Jane Doe");
      expect(r.data.company).toBe("");
      expect(r.data.phone).toBe("");
    }
  });

  it("trims whitespace from name", () => {
    const r = createReferenceSchema.safeParse({ name: "  Jane Doe  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Jane Doe");
    }
  });

  it("rejects empty name", () => {
    expect(createReferenceSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects name > 255 chars", () => {
    expect(
      createReferenceSchema.safeParse({ name: "A".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createReferenceSchema.safeParse({
        name: "Jane",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("accepts empty email", () => {
    const r = createReferenceSchema.safeParse({ name: "Jane", email: "" });
    expect(r.success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(createReferenceSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateReferenceSchema", () => {
  const validUpdate = {
    referenceUuid: "ref_abc-123",
    name: "Jane Doe Updated",
    company: "Acme Corp",
    position: "Senior Manager",
    phone: "+965 5555 5678",
    email: "jane.updated@acme.com",
    relationship: "Former supervisor",
  };

  it("accepts valid update input", () => {
    expect(updateReferenceSchema.safeParse(validUpdate).success).toBe(true);
  });

  it("rejects missing UUID", () => {
    const { referenceUuid: _, ...rest } = validUpdate;
    expect(updateReferenceSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateReferenceSchema.safeParse({ ...validUpdate, name: "" }).success,
    ).toBe(false);
  });
});

describe("deleteReferenceSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteReferenceSchema.safeParse({ referenceUuid: "ref_1" }).success)
      .toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteReferenceSchema.safeParse({ referenceUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(deleteReferenceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("referenceItemOutputSchema", () => {
  const validItem = {
    reference_uuid: "ref_abc-123",
    candidate_id: 42,
    name: "Jane Doe",
    company: "Acme Corp",
    position: "Manager",
    phone: "+965 5555 1234",
    email: "jane@acme.com",
    relationship: "Former supervisor",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-10"),
  };

  it("accepts a valid reference item with all fields", () => {
    expect(referenceItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null candidate_id", () => {
    expect(
      referenceItemOutputSchema.safeParse({
        ...validItem,
        candidate_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null optional fields", () => {
    expect(
      referenceItemOutputSchema.safeParse({
        ...validItem,
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null timestamps", () => {
    expect(
      referenceItemOutputSchema.safeParse({
        ...validItem,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    const { reference_uuid: _, ...rest } = validItem;
    expect(referenceItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validItem;
    expect(referenceItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      referenceItemOutputSchema.safeParse({ ...validItem, name: "" }).success,
    ).toBe(false);
  });

  it("rejects non-integer candidate_id", () => {
    expect(
      referenceItemOutputSchema.safeParse({
        ...validItem,
        candidate_id: 42.5,
      }).success,
    ).toBe(false);
  });
});

describe("referenceListOutputSchema", () => {
  it("accepts an empty array", () => {
    expect(referenceListOutputSchema.safeParse([]).success).toBe(true);
  });

  it("accepts an array of valid items", () => {
    const items = [
      {
        reference_uuid: "ref_1",
        candidate_id: 42,
        name: "Jane Doe",
        company: "Acme Corp",
        position: "Manager",
        phone: "+965 5555 1234",
        email: "jane@acme.com",
        relationship: "Former supervisor",
        created_at: new Date("2026-06-01"),
        updated_at: new Date("2026-06-10"),
      },
      {
        reference_uuid: "ref_2",
        candidate_id: 42,
        name: "John Smith",
        company: null,
        position: null,
        phone: null,
        email: null,
        relationship: null,
        created_at: null,
        updated_at: null,
      },
    ];
    expect(referenceListOutputSchema.safeParse(items).success).toBe(true);
  });

  it("rejects an array with an invalid item", () => {
    expect(
      referenceListOutputSchema.safeParse([
        {
          reference_uuid: "ref_1",
          candidate_id: 42,
          name: "",
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
});

describe("referenceActionResultOutputSchema", () => {
  it("accepts a success result", () => {
    const r = referenceActionResultOutputSchema.safeParse({
      success: true,
      referenceUuid: "ref_abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result", () => {
    const r = referenceActionResultOutputSchema.safeParse({
      success: false,
      error: "Reference not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without referenceUuid", () => {
    expect(
      referenceActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects failure without error", () => {
    expect(
      referenceActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects empty error message", () => {
    expect(
      referenceActionResultOutputSchema.safeParse({
        success: false,
        error: "",
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected shape", () => {
    expect(
      referenceActionResultOutputSchema.safeParse({
        success: true,
        error: "should not have error",
      }).success,
    ).toBe(false);
  });

  it("rejects literal false instead of true for success", () => {
    expect(
      referenceActionResultOutputSchema.safeParse({
        success: false,
        referenceUuid: "ref_1",
      }).success,
    ).toBe(false);
  });
});
