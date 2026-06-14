import { describe, it, expect } from "vitest";
import {
  candidateWorkHistoryItemSchema,
  listCandidateWorkHistoryResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateWorkHistoryItemSchema
// ---------------------------------------------------------------------------

describe("candidateWorkHistoryItemSchema", () => {
  const validItem = () => ({
    id: 1,
    candidate_id: 123,
    contract_uuid: "ct-001",
    store_id: 5,
    company_id: 3,
    parent_company_id: null,
    staff_id: 999,
    start_date: "2026-01-01",
    end_date: "2026-06-01",
    candidate_hourly_rate: 10.50,
    company_hourly_rate: 12.00,
    transfer_cost: 300.00,
    deleted: false,
  });

  it("accepts a valid work history item", () => {
    const r = candidateWorkHistoryItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateWorkHistoryItemSchema.safeParse({
      ...validItem(),
      candidate_id: null,
      contract_uuid: null,
      store_id: null,
      company_id: null,
      parent_company_id: null,
      staff_id: null,
      start_date: null,
      end_date: null,
      candidate_hourly_rate: null,
      company_hourly_rate: null,
      transfer_cost: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem();
    expect(candidateWorkHistoryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean deleted", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({ ...validItem(), deleted: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateWorkHistoryResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateWorkHistoryResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listCandidateWorkHistoryResultSchema.safeParse({
      items: [{
        id: 1, candidate_id: null, contract_uuid: null, store_id: null,
        company_id: null, parent_company_id: null, staff_id: null,
        start_date: null, end_date: null,
        candidate_hourly_rate: null, company_hourly_rate: null,
        transfer_cost: null, deleted: false,
      }],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listCandidateWorkHistoryResultSchema.safeParse({
      items: [], total: 0, page: 0, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-positive pageSize", () => {
    const r = listCandidateWorkHistoryResultSchema.safeParse({
      items: [], total: 0, page: 0, pageSize: 0,
    });
    expect(r.success).toBe(false);
  });
});
