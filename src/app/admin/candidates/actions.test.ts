import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailObjectOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listCandidatesSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCandidatesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listCandidatesSchema.safeParse({ page: "2", limit: "15" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
    }
  });
});

describe("getCandidateSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });
});

describe("searchCandidatesSchema", () => {
  it("accepts a search query", () => {
    const r = searchCandidatesSchema.safeParse({ q: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Ahmed");
    }
  });

  it("accepts a search query with pagination", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test", page: 1, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("test");
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts an email search", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test@example.com" });
    expect(r.success).toBe(true);
  });

  it("rejects empty query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects whitespace-only query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "   " }).success).toBe(false);
  });

  it("rejects query over 100 chars", () => {
    expect(searchCandidatesSchema.safeParse({ q: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects missing query", () => {
    expect(searchCandidatesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", limit: 200 }).success).toBe(false);
  });
});

describe("createCandidateSchema", () => {
  it("accepts valid candidate creation data", () => {
    const r = createCandidateSchema.safeParse({ name: "Ahmed", email: "ahmed@example.com" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed");
      expect(r.data.email).toBe("ahmed@example.com");
      expect(r.data.nameAr).toBe("");
      expect(r.data.phone).toBe("");
    }
  });

  it("rejects missing name", () => {
    expect(createCandidateSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createCandidateSchema.safeParse({ name: "", email: "a@b.com" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createCandidateSchema.safeParse({ name: "Test", email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing email", () => {
    expect(createCandidateSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(createCandidateSchema.safeParse({ name: "x".repeat(256), email: "a@b.com" }).success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const r = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      nameAr: "أحمد علي",
      email: "ahmed@example.com",
      phone: "+96512345678",
      countryId: 1,
      universityId: 5,
      bankId: 3,
      bankAccountName: "Ahmed",
      iban: "KW123456",
      civilId: "123456789012",
      objective: "Looking for work",
      intro: "Experienced dev",
      address: "Kuwait City",
      birthDate: "1990-01-15",
      gender: 1,
      hourlyRate: 2.5,
    });
    expect(r.success).toBe(true);
  });

  it("accepts coerce string numbers", () => {
    const r = createCandidateSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      countryId: "2",
      hourlyRate: "3.5",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.countryId).toBe(2);
      expect(r.data.hourlyRate).toBe(3.5);
    }
  });

  it("rejects gender out of range", () => {
    expect(
      createCandidateSchema.safeParse({ name: "T", email: "a@b.com", gender: 5 }).success,
    ).toBe(false);
  });
});

describe("updateCandidateSchema", () => {
  it("accepts a valid update with candidateId only", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("accepts partial field updates", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      name: "New Name",
      email: "new@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("accepts status update", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: 1, status: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(20);
    }
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("accepts nullable fields", () => {
    const r = updateCandidateSchema.safeParse({
      candidateId: 1,
      phone: null,
      countryId: null,
      bankId: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email in update", () => {
    expect(
      updateCandidateSchema.safeParse({ candidateId: 1, email: "bad" }).success,
    ).toBe(false);
  });

  it("coerces candidateId from string", () => {
    const r = updateCandidateSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });
});

describe("deleteCandidateSchema", () => {
  it("accepts a valid candidate ID", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("rejects zero candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("coerces candidateId from string", () => {
    const r = deleteCandidateSchema.safeParse({ candidateId: "77" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(77);
    }
  });

  it("rejects non-numeric candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  const validRow = {
    candidate_id: 1,
    name: "Ahmed Ali",
    name_ar: "أحمد علي",
    email: "ahmed@example.com",
    phone: "+965 1234 5678",
    status: 10,
    store_name: "Main Store",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-06-01T00:00:00.000Z",
  };

  it("accepts a valid candidate row", () => {
    expect(candidateRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        phone: null,
        store_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow, status: "active" }).success,
    ).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  const valid = {
    items: [
      {
        candidate_id: 1,
        name: "Ahmed",
        name_ar: "",
        email: "a@b.com",
        phone: null,
        status: 10,
        store_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list response", () => {
    expect(candidateListOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...valid, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing items", () => {
    const { items, ...rest } = valid;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  const validDetail = {
    candidate: {
      candidate_id: 1,
      candidate_name: "Ahmed Ali",
      candidate_name_ar: "أحمد علي",
      candidate_email: "ahmed@example.com",
      candidate_phone: "+965 1234 5678",
      candidate_status: 10,
      candidate_gender: 1,
      candidate_birth_date: "1990-01-15T00:00:00.000Z",
      candidate_hourly_rate: 2.5,
      currency_code: "KWD",
      candidate_created_at: "2024-01-01T00:00:00.000Z",
      candidate_updated_at: "2024-06-01T00:00:00.000Z",
      store: { store_name: "Main Store" },
      country: { country_name_en: "Kuwait" },
    },
    metrics: [
      { label: "Status", value: 10, note: "Active" },
    ],
  };

  it("accepts a valid candidate detail", () => {
    expect(candidateDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null candidate (not found)", () => {
    expect(
      candidateDetailOutputSchema.safeParse({ candidate: null, metrics: [] }).success,
    ).toBe(true);
  });

  it("rejects missing candidate object", () => {
    expect(candidateDetailOutputSchema.safeParse({ metrics: [] }).success).toBe(false);
  });

  it("rejects wrong metric shape", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        candidate: null,
        metrics: [{ bad: "field" }],
      }).success,
    ).toBe(false);
  });
});

describe("candidateActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: true as const,
        candidateId: 42,
      }).success,
    ).toBe(true);
  });

  it("accepts failure result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: false as const,
        error: "Candidate not found",
      }).success,
    ).toBe(true);
  });

  it("rejects success without candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects failure without error", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: true,
        candidateId: "abc",
      }).success,
    ).toBe(false);
  });
});
