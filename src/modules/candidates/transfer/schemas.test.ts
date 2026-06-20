import { describe, it, expect } from "vitest";
import {
  transferCandidateItemSchema,
  listTransferCandidatesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date();

const validTransferCandidateItem = {
  tc_id: 1,
  transfer_id: 10,
  candidate_id: 100,
  prev_candidate_id: 99,
  store_id: 5,
  store_name: "Main Store",
  company_id: 2,
  company_name: "Acme Corp",
  company_email: "payroll@acme.com",
  bank_id: 7,
  transfer_confirmation_id: "CONF-2024-001",
  transfer_file_id: 42,
  transfer_benef_name: "John Doe",
  transfer_benef_iban: "SA1234567890",
  candidate_hourly_rate: 25.5,
  company_hourly_rate: 35.0,
  hours: 40,
  minutes: 30,
  seconds: 15,
  bonus: 100.0,
  bonus_commission: 10.0,
  transfer_cost: 1500.0,
  candidate_total: 1120.0,
  company_total: 1500.0,
  deleted: 0,
  paid: 0,
  is_candidate_notified: false,
  currency_code: "SAR",
  contract_uuid: "uuid-abc-123",
  tc_created_at: now,
  tc_updated_at: now,
  candidate: {
    candidate_id: 100,
    candidate_name: "John Doe",
    candidate_name_ar: "جون دو",
  },
  transfer: {
    transfer_id: 10,
    transfer_status: 1,
  },
};

// ---------------------------------------------------------------------------
// transferCandidateItemSchema
// ---------------------------------------------------------------------------
describe("transferCandidateItemSchema", () => {
  it("accepts a fully populated valid item", () => {
    expect(transferCandidateItemSchema.safeParse(validTransferCandidateItem).success).toBe(true);
  });

  it("accepts a valid item with minimal required fields only", () => {
    const minimal = {
      tc_id: 1,
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
      deleted: 0,
      paid: 0,
      is_candidate_notified: null,
      currency_code: null,
      contract_uuid: null,
      tc_created_at: now,
      tc_updated_at: now,
      candidate: null,
      transfer: null,
    };
    expect(transferCandidateItemSchema.safeParse(minimal).success).toBe(true);
  });

  // --- Nullable fields ---

  it("accepts null for nullable string fields", () => {
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        store_name: null,
        company_name: null,
        company_email: null,
        transfer_confirmation_id: null,
        transfer_benef_name: null,
        transfer_benef_iban: null,
        currency_code: null,
        contract_uuid: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null for nullable number fields", () => {
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        transfer_id: null,
        candidate_id: null,
        prev_candidate_id: null,
        store_id: null,
        company_id: null,
        bank_id: null,
        transfer_file_id: null,
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
      }).success,
    ).toBe(true);
  });

  it("accepts null for nullable boolean field", () => {
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        is_candidate_notified: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null for nullable object fields (candidate, transfer)", () => {
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        candidate: null,
        transfer: null,
      }).success,
    ).toBe(true);
  });

  // --- Required fields ---

  it("rejects missing tc_id", () => {
    const { tc_id: _, ...rest } = validTransferCandidateItem;
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing deleted", () => {
    const { deleted: _, ...rest } = validTransferCandidateItem;
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing paid", () => {
    const { paid: _, ...rest } = validTransferCandidateItem;
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing tc_created_at", () => {
    const { tc_created_at: _, ...rest } = validTransferCandidateItem;
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing tc_updated_at", () => {
    const { tc_updated_at: _, ...rest } = validTransferCandidateItem;
    expect(transferCandidateItemSchema.safeParse(rest).success).toBe(false);
  });

  // --- Invalid types ---

  it("rejects string for tc_id", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, tc_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects float for tc_id", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, tc_id: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects string for deleted", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, deleted: "0" }).success,
    ).toBe(false);
  });

  it("rejects string for paid", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, paid: "0" }).success,
    ).toBe(false);
  });

  it("rejects string for tc_created_at", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, tc_created_at: "2024-01-01" })
        .success,
    ).toBe(false);
  });

  it("rejects string for tc_updated_at", () => {
    expect(
      transferCandidateItemSchema.safeParse({ ...validTransferCandidateItem, tc_updated_at: "2024-01-01" })
        .success,
    ).toBe(false);
  });

  // --- Candidate sub-object ---

  it("rejects missing candidate_id in nested candidate object", () => {
    const { candidate_id: _, ...candidateNoId } = validTransferCandidateItem.candidate!;
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        candidate: candidateNoId,
      }).success,
    ).toBe(false);
  });

  it("accepts null candidate_name in nested candidate object", () => {
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        candidate: { ...validTransferCandidateItem.candidate!, candidate_name: null, candidate_name_ar: null },
      }).success,
    ).toBe(true);
  });

  // --- Transfer sub-object ---

  it("rejects missing transfer_id in nested transfer object", () => {
    const { transfer_id: _, ...transferNoId } = validTransferCandidateItem.transfer!;
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        transfer: transferNoId,
      }).success,
    ).toBe(false);
  });

  it("rejects missing transfer_status in nested transfer object", () => {
    const { transfer_status: _, ...transferNoStatus } = validTransferCandidateItem.transfer!;
    expect(
      transferCandidateItemSchema.safeParse({
        ...validTransferCandidateItem,
        transfer: transferNoStatus,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTransferCandidatesResultSchema
// ---------------------------------------------------------------------------
describe("listTransferCandidatesResultSchema", () => {
  const validResult = {
    items: [validTransferCandidateItem],
    total: 1,
  };

  it("accepts a valid result with one item", () => {
    expect(listTransferCandidatesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts a valid result with multiple items", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({
        items: [validTransferCandidateItem, validTransferCandidateItem],
        total: 2,
      }).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ items: [], total: 0 }).success,
    ).toBe(true);
  });

  it("accepts total of zero", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ items: [], total: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listTransferCandidatesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listTransferCandidatesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects items that is not an array", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ ...validResult, items: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects float total", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ ...validResult, total: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects string total", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({ ...validResult, total: "1" }).success,
    ).toBe(false);
  });

  it("rejects invalid item inside items array", () => {
    expect(
      listTransferCandidatesResultSchema.safeParse({
        items: [{ tc_id: "not-a-number" }],
        total: 1,
      }).success,
    ).toBe(false);
  });
});
