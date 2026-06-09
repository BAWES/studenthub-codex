import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching actions.ts  (test-time copy for unit isolation)
// ---------------------------------------------------------------------------

const listCandidateWorkHistorySchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCandidateWorkHistorySchema = z.object({
  id: z.coerce.number().int().positive("Work history ID is required"),
});

type ListCandidateWorkHistoryInput = z.input<
  typeof listCandidateWorkHistorySchema
>;
type GetCandidateWorkHistoryInput = z.input<
  typeof getCandidateWorkHistorySchema
>;

export type CandidateWorkHistoryItem = {
  id: number;
  candidate_id: number | null;
  contract_uuid: string | null;
  store_id: number | null;
  company_id: number | null;
  parent_company_id: number | null;
  staff_id: number | null;
  start_date: string | null;
  end_date: string | null;
  candidate_hourly_rate: number | null;
  company_hourly_rate: number | null;
  transfer_cost: number | null;
  deleted: boolean;
};

type ListCandidateWorkHistoryResult = {
  items: CandidateWorkHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listCandidateWorkHistorySchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateWorkHistorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateWorkHistorySchema.safeParse({
      candidateId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateWorkHistorySchema.safeParse({
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
    const result = listCandidateWorkHistorySchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateWorkHistorySchema.safeParse({
      candidateId: 1,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateWorkHistorySchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listCandidateWorkHistorySchema.safeParse({
      candidateId: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateWorkHistorySchema", () => {
  it("accepts valid work history ID", () => {
    const result = getCandidateWorkHistorySchema.safeParse({ id: 123 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(123);
    }
  });

  it("rejects zero ID", () => {
    const result = getCandidateWorkHistorySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = getCandidateWorkHistorySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing ID", () => {
    const result = getCandidateWorkHistorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string ID to number", () => {
    const result = getCandidateWorkHistorySchema.safeParse({ id: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(99);
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("CandidateWorkHistoryItem shape", () => {
  it("defines expected fields with nullables", () => {
    const mock: CandidateWorkHistoryItem = {
      id: 1,
      candidate_id: 42,
      contract_uuid: "contract_abc123",
      store_id: 5,
      company_id: 10,
      parent_company_id: null,
      staff_id: null,
      start_date: "2024-01-15",
      end_date: null,
      candidate_hourly_rate: 25.5,
      company_hourly_rate: 40.0,
      transfer_cost: null,
      deleted: false,
    };
    expect(mock.id).toBe(1);
    expect(mock.candidate_id).toBe(42);
    expect(mock.contract_uuid).toBe("contract_abc123");
    expect(mock.store_id).toBe(5);
    expect(mock.candidate_hourly_rate).toBe(25.5);
    expect(mock.deleted).toBe(false);
  });
});

describe("ListCandidateWorkHistoryResult shape", () => {
  it("accepts empty result", () => {
    const r: ListCandidateWorkHistoryResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    expect(r.total).toBe(0);
    expect(r.items).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: ListCandidateWorkHistoryResult = {
      items: [
        {
          id: 1,
          candidate_id: 1,
          contract_uuid: null,
          store_id: null,
          company_id: null,
          parent_company_id: null,
          staff_id: null,
          start_date: "2023-06-01",
          end_date: null,
          candidate_hourly_rate: null,
          company_hourly_rate: null,
          transfer_cost: null,
          deleted: false,
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
