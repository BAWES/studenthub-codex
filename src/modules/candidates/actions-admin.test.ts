import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for candidate admin server actions
// These schemas will be used by the server actions in a separate file.
// Testing them separately avoids mocking "use server" deps (prisma, session).
// ---------------------------------------------------------------------------

const listCandidatesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
  status: z.number().int().optional(),
  approved: z.number().int().optional(),
  countryId: z.number().int().positive().optional(),
});

const getCandidateSchema = z.object({
  id: z.number().int().positive(),
});

const createCandidateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  nameAr: z.string().max(255).optional().default(""),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().max(20).optional().default(""),
  countryId: z.number().int().positive().optional(),
  universityId: z.number().int().positive().optional(),
  bankId: z.number().int().positive().optional(),
  bankAccountName: z.string().max(100).optional().default(""),
  iban: z.string().max(100).optional().default(""),
  civilId: z.string().max(255).optional().default(""),
  objective: z.string().max(255).optional().default(""),
  intro: z.string().optional().default(""),
  address: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  gender: z.number().int().min(0).max(2).optional(),
  hourlyRate: z.number().positive().optional(),
});

const updateCandidateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  nameAr: z.string().max(255).optional(),
  email: z.string().email("Invalid email").max(255).optional(),
  phone: z.string().max(20).optional(),
  countryId: z.number().int().positive().optional().nullable(),
  universityId: z.number().int().positive().optional().nullable(),
  bankId: z.number().int().positive().optional().nullable(),
  bankAccountName: z.string().max(100).optional(),
  iban: z.string().max(100).optional(),
  civilId: z.string().max(255).optional(),
  objective: z.string().max(255).optional(),
  intro: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.number().int().min(0).max(2).optional(),
  hourlyRate: z.number().positive().optional(),
  status: z.number().int().optional(),
});

const deleteCandidateSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listCandidatesSchema tests
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts empty params (no pagination)", () => {
    const result = listCandidatesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listCandidatesSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts search param", () => {
    const result = listCandidatesSchema.safeParse({ search: "ahmed" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("ahmed");
    }
  });

  it("accepts filter params (status, approved, countryId)", () => {
    const result = listCandidatesSchema.safeParse({
      status: 10,
      approved: 1,
      countryId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listCandidatesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listCandidatesSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects search over 255 chars", () => {
    const result = listCandidatesSchema.safeParse({ search: "x".repeat(256) });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateSchema tests
// ---------------------------------------------------------------------------

describe("getCandidateSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getCandidateSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getCandidateSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getCandidateSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getCandidateSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCandidateSchema tests
// ---------------------------------------------------------------------------

describe("createCandidateSchema", () => {
  it("accepts valid minimum candidate data", () => {
    const result = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full candidate data with all fields", () => {
    const result = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      nameAr: "أحمد علي",
      email: "ahmed@example.com",
      phone: "99887766",
      countryId: 1,
      universityId: 5,
      bankId: 3,
      bankAccountName: "Ahmed Ali",
      iban: "KW00BANK0000000000",
      civilId: "1234567890",
      objective: "Looking for a job",
      intro: "Experienced professional",
      address: "Kuwait City",
      birthDate: "1990-01-15",
      gender: 1,
      hourlyRate: 5.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCandidateSchema.safeParse({
      name: "",
      email: "ahmed@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createCandidateSchema.safeParse({
      name: "Ahmed Ali",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createCandidateSchema.safeParse({ email: "ahmed@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = createCandidateSchema.safeParse({ name: "Ahmed Ali" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateSchema tests
// ---------------------------------------------------------------------------

describe("updateCandidateSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateCandidateSchema.safeParse({
      id: 1,
      name: "Ahmed Ali Updated",
      email: "ahmed.new@example.com",
      hourlyRate: 6.0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = updateCandidateSchema.safeParse({ name: "No ID" });
    expect(result.success).toBe(false);
  });

  it("rejects zero id", () => {
    const result = updateCandidateSchema.safeParse({ id: 0, name: "Test" });
    expect(result.success).toBe(false);
  });

  it("accepts a partial update with only id and one field", () => {
    const result = updateCandidateSchema.safeParse({ id: 1, name: "New Name" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateSchema tests
// ---------------------------------------------------------------------------

describe("deleteCandidateSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = deleteCandidateSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = deleteCandidateSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = deleteCandidateSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape tests
// ---------------------------------------------------------------------------

type CandidateListItem = {
  candidate_id: number;
  candidate_name: string;
  candidate_name_ar: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_status: number;
  approved: number;
  candidate_created_at: string;
};

type CandidateDetail = CandidateListItem & {
  candidate_objective: string | null;
  candidate_intro: string | null;
  candidate_birth_date: string | null;
  candidate_civil_id: string | null;
  candidate_address_line1: string | null;
  country_id: number | null;
  university_id: number | null;
  bank_id: number | null;
  bank_account_name: string | null;
  candidate_iban: string | null;
  candidate_gender: number | null;
  candidate_hourly_rate: number | null;
  candidate_updated_at: string;
  profile_url: string | null;
};

type ListCandidatesResult = {
  candidates: CandidateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("CandidateListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CandidateListItem = {
      candidate_id: 1,
      candidate_name: "Ahmed Ali",
      candidate_name_ar: "أحمد علي",
      candidate_email: "ahmed@example.com",
      candidate_phone: "99887766",
      candidate_status: 10,
      approved: 1,
      candidate_created_at: "2024-01-01T00:00:00.000Z",
    };
    expect(mock.candidate_id).toBe(1);
    expect(mock.candidate_name).toBe("Ahmed Ali");
    expect(mock.candidate_email).toBe("ahmed@example.com");
    expect(mock.candidate_status).toBe(10);
  });
});

describe("CandidateDetail shape", () => {
  it("defines the expected fields", () => {
    const mock: CandidateDetail = {
      candidate_id: 1,
      candidate_name: "Ahmed Ali",
      candidate_name_ar: "أحمد علي",
      candidate_email: "ahmed@example.com",
      candidate_phone: "99887766",
      candidate_status: 10,
      approved: 1,
      candidate_created_at: "2024-01-01T00:00:00.000Z",
      candidate_updated_at: "2024-01-02T00:00:00.000Z",
      candidate_objective: "Looking for a job",
      candidate_intro: "Experienced",
      candidate_birth_date: "1990-01-15",
      candidate_civil_id: "1234567890",
      candidate_address_line1: "Kuwait City",
      country_id: 1,
      university_id: 5,
      bank_id: 3,
      bank_account_name: "Ahmed Ali",
      candidate_iban: "KW00BANK0000000000",
      candidate_gender: 1,
      candidate_hourly_rate: 5.5,
      profile_url: null,
    };
    expect(mock.candidate_id).toBe(1);
    expect(mock.candidate_objective).toBe("Looking for a job");
  });
});

describe("ListCandidatesResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListCandidatesResult = {
      candidates: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.candidates).toHaveLength(0);
  });
});
