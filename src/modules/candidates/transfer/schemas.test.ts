import { describe, it, expect } from "vitest";
import {
  transferCandidateItemSchema,
  listTransferCandidatesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// transferCandidateItemSchema
// ---------------------------------------------------------------------------

describe("transferCandidateItemSchema", () => {
  const validItem = () => ({
    tc_id: 1,
    transfer_id: 10,
    candidate_id: 123,
    prev_candidate_id: null,
    store_id: 5,
    store_name: "Main Branch",
    company_id: 3,
    company_name: "Acme Corp",
    company_email: "hr@acme.com",
    bank_id: 2,
    transfer_confirmation_id: "TC-001",
    transfer_file_id: 100,
    transfer_benef_name: "John Doe",
    transfer_benef_iban: "KW12...",
    candidate_hourly_rate: 10.50,
    company_hourly_rate: 12.00,
    hours: 120,
    minutes: 30,
    seconds: 15,
    bonus: 50.00,
    bonus_commission: 5.00,
    transfer_cost: 300.00,
    candidate_total: 1200.00,
    company_total: 1500.00,
    deleted: 0,
    paid: 1200,
    is_candidate_notified: true,
    currency_code: "KWD",
    contract_uuid: "ct-001",
    tc_created_at: new Date("2026-01-01"),
    tc_updated_at: new Date("2026-06-01"),
    candidate: { candidate_id: 123, candidate_name: "John", candidate_name_ar: null },
    transfer: { transfer_id: 10, transfer_status: 1 },
  });

  it("accepts a valid transfer candidate item", () => {
    const r = transferCandidateItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = transferCandidateItemSchema.safeParse({
      ...validItem(),
      transfer_id: null,
      candidate_id: null,
      prev_candidate_id: null,
      store_id: null,
      store_name: null,
      company_id: null,
      company_name: null,
      company_email: null,
      bank_id: null,
      transfer_confirmation_id: null,
      transfer_file_id: null,
      transfer_benef_name: null,
      transfer_benef_iban: null,
      candidate_hourly_rate: null,
      company_hourly_rate: null,
      hours: null,
      minutes: null,
      seconds: null,
      bonus: null,
      bonus_commission: null,
      transfer_cost: null,
      candidate_total: null,
      company_total: null,
      is_candidate_notified: null,
      currency_code: null,
      contract_uuid: null,
      candidate: null,
      transfer: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing tc_id", () => {
    const { tc_id: _, ...rest } = validItem();
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTransferCandidatesResultSchema
// ---------------------------------------------------------------------------

describe("listTransferCandidatesResultSchema", () => {
  it("accepts valid paginated result", () => {
    const r = listTransferCandidatesResultSchema.safeParse({
      items: [{
        tc_id: 1, transfer_id: null, candidate_id: null, prev_candidate_id: null,
        store_id: null, store_name: null, company_id: null, company_name: null,
        company_email: null, bank_id: null, transfer_confirmation_id: null,
        transfer_file_id: null, transfer_benef_name: null, transfer_benef_iban: null,
        candidate_hourly_rate: null, company_hourly_rate: null, hours: null,
        minutes: null, seconds: null, bonus: null, bonus_commission: null,
        transfer_cost: null, candidate_total: null, company_total: null,
        deleted: 0, paid: 0, is_candidate_notified: null,
        currency_code: null, contract_uuid: null,
        tc_created_at: new Date(), tc_updated_at: new Date(),
        candidate: null, transfer: null,
      }],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listTransferCandidatesResultSchema.safeParse({ items: [], total: 0 });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listTransferCandidatesResultSchema.safeParse({ items: [], total: -1 });
    expect(r.success).toBe(false);
  });
});
