import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
  deleteCandidateSchema,
} from "./actions";

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
