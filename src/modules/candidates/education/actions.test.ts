import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching actions.ts
// ---------------------------------------------------------------------------

const listCandidateEducationSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

type ListCandidateEducationInput = z.input<typeof listCandidateEducationSchema>;
type GetCandidateEducationInput = z.input<typeof getCandidateEducationSchema>;

export type CandidateEducationItem = {
  education_uuid: string;
  candidate_id: number;
  university_id: number;
  university_name_en: string | null;
  university_name_ar: string | null;
  degree_uuid: string | null;
  degree_name_en: string | null;
  degree_name_ar: string | null;
  major_uuid: string | null;
  major_name_en: string | null;
  major_name_ar: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListCandidateEducationResult = {
  items: CandidateEducationItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listCandidateEducationSchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateEducationSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 10,
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
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 1,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listCandidateEducationSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateEducationSchema", () => {
  it("accepts valid education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({
      educationUuid: "edu_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.educationUuid).toBe("edu_abc123");
    }
  });

  it("rejects empty education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({
      educationUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CandidateEducationItem shape", () => {
  it("defines expected fields", () => {
    const mock: CandidateEducationItem = {
      education_uuid: "edu_test123",
      candidate_id: 42,
      university_id: 5,
      university_name_en: "Kuwait University",
      university_name_ar: null,
      degree_uuid: "deg_001",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: null,
      major_uuid: "maj_001",
      major_name_en: "Computer Science",
      major_name_ar: null,
      graduation_year: 2024,
      is_currently_studying: false,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-01"),
    };
    expect(mock.education_uuid).toBe("edu_test123");
    expect(mock.university_name_en).toBe("Kuwait University");
    expect(mock.degree_name_en).toBe("Bachelor of Science");
    expect(mock.major_name_en).toBe("Computer Science");
    expect(mock.is_currently_studying).toBe(false);
  });
});

describe("ListCandidateEducationResult shape", () => {
  it("accepts empty result", () => {
    const r: ListCandidateEducationResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    expect(r.total).toBe(0);
    expect(r.items).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: ListCandidateEducationResult = {
      items: [
        {
          education_uuid: "edu_abc",
          candidate_id: 1,
          university_id: 5,
          university_name_en: "KU",
          university_name_ar: null,
          degree_uuid: null,
          degree_name_en: null,
          degree_name_ar: null,
          major_uuid: null,
          major_name_en: null,
          major_name_ar: null,
          graduation_year: null,
          is_currently_studying: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    expect(r.items).toHaveLength(1);
    expect(r.total).toBe(1);
  });
});
