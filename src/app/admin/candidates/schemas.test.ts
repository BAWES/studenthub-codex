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
  candidateDetailObjectOutputSchema,
  candidateDetailOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidatesSchema
// ---------------------------------------------------------------------------
describe("listCandidatesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listCandidatesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listCandidatesSchema.safeParse({ page: 2, limit: 50, q: "john", status: 1, storeId: 5 }).success,
    ).toBe(true);
  });

  it("accepts input without optional filters", () => {
    expect(listCandidatesSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listCandidatesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCandidatesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCandidatesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(listCandidatesSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateSchema
// ---------------------------------------------------------------------------
describe("getCandidateSchema", () => {
  it("accepts valid input", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 42 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(getCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// searchCandidatesSchema
// ---------------------------------------------------------------------------
describe("searchCandidatesSchema", () => {
  it("accepts valid input", () => {
    expect(searchCandidatesSchema.safeParse({ q: "john" }).success).toBe(true);
  });

  it("accepts input with page and limit", () => {
    expect(searchCandidatesSchema.safeParse({ q: "alice", page: 2, limit: 10 }).success).toBe(true);
  });

  it("rejects missing q", () => {
    expect(searchCandidatesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty q", () => {
    expect(searchCandidatesSchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects q exceeding 100 chars", () => {
    expect(searchCandidatesSchema.safeParse({ q: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", page: 0 }).success).toBe(false);
  });

  it("trims whitespace from q", () => {
    expect(searchCandidatesSchema.safeParse({ q: "  test  " }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createCandidateSchema
// ---------------------------------------------------------------------------
describe("createCandidateSchema", () => {
  const validCreate = {
    name: "John Doe",
    email: "john@example.com",
  };

  it("accepts minimal valid input", () => {
    expect(createCandidateSchema.safeParse(validCreate).success).toBe(true);
  });

  it("accepts full valid input", () => {
    expect(
      createCandidateSchema.safeParse({
        ...validCreate,
        nameAr: "جون دو",
        phone: "+96512345678",
        countryId: 1,
        universityId: 2,
        bankId: 3,
        bankAccountName: "John",
        iban: "KU1234567890",
        civilId: "123456789",
        objective: "Looking for a job",
        intro: "Experienced developer",
        address: "Kuwait City",
        birthDate: "1990-01-01",
        gender: 1,
        hourlyRate: 15.5,
      }).success,
    ).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validCreate;
    expect(createCandidateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, name: "" }).success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, name: "x".repeat(256) }).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validCreate;
    expect(createCandidateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects empty email", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, email: "" }).success).toBe(false);
  });

  it("rejects gender below 0", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, gender: -1 }).success).toBe(false);
  });

  it("rejects gender above 2", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, gender: 3 }).success).toBe(false);
  });

  it("rejects zero hourlyRate", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, hourlyRate: 0 }).success).toBe(false);
  });

  it("rejects negative hourlyRate", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, hourlyRate: -5 }).success).toBe(false);
  });

  it("rejects zero countryId", () => {
    expect(createCandidateSchema.safeParse({ ...validCreate, countryId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateSchema
// ---------------------------------------------------------------------------
describe("updateCandidateSchema", () => {
  it("accepts minimal input (candidateId only)", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: 1,
        name: "John Updated",
        nameAr: "جون",
        email: "john@new.com",
        phone: "+96599999999",
        countryId: 2,
        universityId: 3,
        bankId: 4,
        bankAccountName: "John U",
        iban: "KU9999999999",
        civilId: "987654321",
        objective: "New objective",
        intro: "New intro",
        address: "New address",
        birthDate: "1991-02-02",
        gender: 2,
        hourlyRate: 20,
        status: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      updateCandidateSchema.safeParse({
        candidateId: 1,
        phone: null,
        countryId: null,
        universityId: null,
        bankId: null,
        bankAccountName: null,
        iban: null,
        civilId: null,
        objective: null,
        intro: null,
        address: null,
        birthDate: null,
        gender: null,
        hourlyRate: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(updateCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 1, name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(updateCandidateSchema.safeParse({ candidateId: 1, email: "bad" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateSchema
// ---------------------------------------------------------------------------
describe("deleteCandidateSchema", () => {
  it("accepts valid input", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 42 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(deleteCandidateSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(deleteCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateRowOutputSchema
// ---------------------------------------------------------------------------
describe("candidateRowOutputSchema", () => {
  const validRow = {
    candidate_id: 1,
    name: "John Doe",
    name_ar: "جون دو",
    email: "john@example.com",
    phone: "+96512345678",
    status: 1,
    store_name: "Main Store",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(candidateRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        phone: null,
        store_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for name", () => {
    expect(candidateRowOutputSchema.safeParse({ ...validRow, name: false }).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow, candidate_id: "not-a-number" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateListOutputSchema
// ---------------------------------------------------------------------------
describe("candidateListOutputSchema", () => {
  const validList = {
    items: [
      {
        candidate_id: 1,
        name: "John",
        name_ar: "جون",
        email: "john@test.com",
        phone: null,
        status: 1,
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

  it("accepts a valid list", () => {
    expect(candidateListOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...validList, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(candidateListOutputSchema.safeParse({ ...validList, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(candidateListOutputSchema.safeParse({ ...validList, page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailObjectOutputSchema
// ---------------------------------------------------------------------------
describe("candidateDetailObjectOutputSchema", () => {
  const validDetailObj = {
    candidate_id: 1,
    candidate_name: "John Doe",
    candidate_name_ar: "جون دو",
    candidate_email: "john@example.com",
    candidate_phone: "+96512345678",
    candidate_status: 1,
    candidate_gender: 1,
    candidate_birth_date: "1990-01-01",
    candidate_hourly_rate: 15.5,
    currency_code: "KWD",
    candidate_created_at: "2024-01-01T00:00:00Z",
    candidate_updated_at: "2024-06-01T00:00:00Z",
    store: { store_name: "Main Store" },
    country: { country_name_en: "Kuwait" },
  };

  it("accepts a valid detail object", () => {
    expect(candidateDetailObjectOutputSchema.safeParse(validDetailObj).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidateDetailObjectOutputSchema.safeParse({
        ...validDetailObj,
        candidate_phone: null,
        candidate_gender: null,
        candidate_birth_date: null,
        candidate_hourly_rate: null,
        currency_code: null,
        candidate_created_at: null,
        candidate_updated_at: null,
        store: null,
        country: null,
      }).success,
    ).toBe(true);
  });

  it("accepts store without country and vice versa", () => {
    expect(
      candidateDetailObjectOutputSchema.safeParse({ ...validDetailObj, country: null }).success,
    ).toBe(true);
    expect(
      candidateDetailObjectOutputSchema.safeParse({ ...validDetailObj, store: null }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validDetailObj;
    expect(candidateDetailObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_name", () => {
    const { candidate_name: _, ...rest } = validDetailObj;
    expect(candidateDetailObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_name", () => {
    expect(
      candidateDetailObjectOutputSchema.safeParse({ ...validDetailObj, candidate_name: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailOutputSchema
// ---------------------------------------------------------------------------
describe("candidateDetailOutputSchema", () => {
  const validDetail = {
    candidate: {
      candidate_id: 1,
      candidate_name: "John",
      candidate_name_ar: "جون",
      candidate_email: "john@test.com",
      candidate_phone: null,
      candidate_status: 1,
      candidate_gender: null,
      candidate_birth_date: null,
      candidate_hourly_rate: null,
      currency_code: null,
      candidate_created_at: null,
      candidate_updated_at: null,
      store: null,
      country: null,
    },
    metrics: [{ label: "Requests", value: 5, note: "Total requests" }],
  };

  it("accepts a valid detail", () => {
    expect(candidateDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null candidate", () => {
    expect(candidateDetailOutputSchema.safeParse({ ...validDetail, candidate: null }).success).toBe(true);
  });

  it("accepts metrics with number value", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "Count", value: 42, note: "Numeric" }],
      }).success,
    ).toBe(true);
  });

  it("accepts metrics with string value", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "Label", value: "some value", note: "String" }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate", () => {
    const { candidate: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for metrics label", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: false, value: 5, note: "test" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateActionResultOutputSchema
// ---------------------------------------------------------------------------
describe("candidateActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: true as const, candidateId: 42 }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: false as const, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(candidateActionResultOutputSchema.safeParse({ candidateId: 42 }).success).toBe(false);
  });

  it("rejects success with error field", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: true as const, error: "Should not have error" })
        .success,
    ).toBe(false);
  });

  it("rejects error with candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: false as const, candidateId: 42 })
        .success,
    ).toBe(false);
  });

  it("rejects success with error string", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({ success: true as const, error: "should not happen" }).success,
    ).toBe(false);
  });
});
