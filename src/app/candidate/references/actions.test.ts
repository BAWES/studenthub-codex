import { describe, it, expect } from "vitest";
import {
  listReferenceSchema,
  getReferenceSchema,
  createReferenceSchema,
  updateReferenceSchema,
  deleteReferenceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/references actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listReferenceSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listReferenceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listReferenceSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listReferenceSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listReferenceSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getReferenceSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getReferenceSchema.safeParse({ referenceUuid: "ref_abc123" }).success,
    ).toBe(true);
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
  it("accepts valid create params (name only)", () => {
    const r = createReferenceSchema.safeParse({
      name: "John Doe",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
    }
  });

  it("accepts all optional fields", () => {
    const r = createReferenceSchema.safeParse({
      name: "Jane Smith",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 1234 5678",
      email: "jane@example.com",
      relationship: "Former Manager",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Jane Smith");
      expect(r.data.company).toBe("Acme Corp");
      expect(r.data.email).toBe("jane@example.com");
    }
  });

  it("rejects empty name", () => {
    expect(createReferenceSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    expect(createReferenceSchema.safeParse({}).success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const r = createReferenceSchema.safeParse({ name: "  Bob Jones  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Bob Jones");
    }
  });

  it("rejects invalid email", () => {
    expect(
      createReferenceSchema.safeParse({
        name: "Test",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });
});

describe("updateReferenceSchema", () => {
  it("accepts valid update params", () => {
    const r = updateReferenceSchema.safeParse({
      referenceUuid: "ref_abc",
      name: "John Updated",
      company: "New Corp",
      position: "Director",
      phone: "+965 9999 9999",
      email: "john@newcorp.com",
      relationship: "Colleague",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.referenceUuid).toBe("ref_abc");
      expect(r.data.name).toBe("John Updated");
    }
  });

  it("rejects missing referenceUuid", () => {
    expect(
      updateReferenceSchema.safeParse({ name: "No UUID" }).success,
    ).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    expect(
      updateReferenceSchema.safeParse({
        referenceUuid: "",
        name: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      updateReferenceSchema.safeParse({ referenceUuid: "ref_abc" }).success,
    ).toBe(false);
  });
});

describe("deleteReferenceSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteReferenceSchema.safeParse({ referenceUuid: "ref_xyz" }).success,
    ).toBe(true);
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
