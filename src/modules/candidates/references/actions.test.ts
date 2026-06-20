import { describe, it, expect } from "vitest";
import {
  listCandidateReferencesSchema,
  getCandidateReferenceSchema,
  createCandidateReferenceSchema,
  updateCandidateReferenceSchema,
  deleteCandidateReferenceSchema,
  candidateReferenceItemSchema,
  listCandidateReferencesResultSchema,
  candidateReferenceActionResultSchema,
} from "./schemas";
import type {
  CandidateReferenceItem,
  ListCandidateReferencesResult,
  CandidateReferenceActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCandidateReferencesSchema", () => {
  it("accepts empty params (defaults)", () => {
    const result = listCandidateReferencesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateReferencesSchema.safeParse({
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCandidateReferencesSchema.safeParse({
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateReferencesSchema.safeParse({
      page: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateReferenceSchema", () => {
  it("accepts valid reference UUID", () => {
    const result = getCandidateReferenceSchema.safeParse({
      referenceUuid: "ref_abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.referenceUuid).toBe("ref_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    const result = getCandidateReferenceSchema.safeParse({
      referenceUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing referenceUuid", () => {
    const result = getCandidateReferenceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createCandidateReferenceSchema", () => {
  it("accepts valid create input (name only)", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "John Doe",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });

  it("accepts create input with all optional fields", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "Jane Smith",
      company: "Acme Corp",
      position: "Manager",
      phone: "+965 1234 5678",
      email: "jane@acme.com",
      relationship: "Former Supervisor",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("Acme Corp");
      expect(result.data.position).toBe("Manager");
      expect(result.data.phone).toBe("+965 1234 5678");
      expect(result.data.email).toBe("jane@acme.com");
      expect(result.data.relationship).toBe("Former Supervisor");
    }
  });

  it("rejects empty name", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "  John Doe  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });

  it("rejects invalid email format", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty email as default", () => {
    const result = createCandidateReferenceSchema.safeParse({
      name: "John Doe",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCandidateReferenceSchema", () => {
  it("accepts valid update input", () => {
    const result = updateCandidateReferenceSchema.safeParse({
      referenceUuid: "ref_abc-123",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.referenceUuid).toBe("ref_abc-123");
      expect(result.data.name).toBe("Updated Name");
    }
  });

  it("rejects missing referenceUuid", () => {
    const result = updateCandidateReferenceSchema.safeParse({
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = updateCandidateReferenceSchema.safeParse({
      referenceUuid: "ref_abc",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email in update", () => {
    const result = updateCandidateReferenceSchema.safeParse({
      referenceUuid: "ref_abc",
      name: "John Doe",
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCandidateReferenceSchema", () => {
  it("accepts valid delete input", () => {
    const result = deleteCandidateReferenceSchema.safeParse({
      referenceUuid: "ref_abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing referenceUuid", () => {
    const result = deleteCandidateReferenceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty referenceUuid", () => {
    const result = deleteCandidateReferenceSchema.safeParse({
      referenceUuid: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateReferenceItemSchema", () => {
  const validItem: CandidateReferenceItem = {
    reference_uuid: "ref_abc-123",
    candidate_id: 42,
    name: "John Doe",
    company: "Acme Corp",
    position: "Manager",
    phone: "+965 1234 5678",
    email: "john@acme.com",
    relationship: "Former Supervisor",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-06-01"),
  };

  it("accepts valid reference item", () => {
    const result = candidateReferenceItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts item with null optional fields", () => {
    const result = candidateReferenceItemSchema.safeParse({
      ...validItem,
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing reference_uuid", () => {
    const { reference_uuid: _, ...rest } = validItem;
    const result = candidateReferenceItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validItem;
    const result = candidateReferenceItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("listCandidateReferencesResultSchema", () => {
  it("accepts empty result", () => {
    const result: ListCandidateReferencesResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    const parsed = listCandidateReferencesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts populated result", () => {
    const result = listCandidateReferencesResultSchema.safeParse({
      items: [
        {
          reference_uuid: "ref_abc",
          candidate_id: 42,
          name: "John Doe",
          company: null,
          position: null,
          phone: null,
          email: null,
          relationship: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listCandidateReferencesResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCandidateReferencesResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });
});

describe("candidateReferenceActionResultSchema", () => {
  it("accepts success result", () => {
    const result = candidateReferenceActionResultSchema.safeParse({
      success: true,
      referenceUuid: "ref_abc-123",
    } satisfies CandidateReferenceActionResult);
    expect(result.success).toBe(true);
  });

  it("accepts error result", () => {
    const result = candidateReferenceActionResultSchema.safeParse({
      success: false,
      error: "Reference record not found or access denied",
    } satisfies CandidateReferenceActionResult);
    expect(result.success).toBe(true);
  });

  it("rejects success without referenceUuid", () => {
    const result = candidateReferenceActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects error without error message", () => {
    const result = candidateReferenceActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });
});
