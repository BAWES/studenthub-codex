import { describe, it, expect } from "vitest";
import {
  listTransferCandidatesSchema,
  getTransferCandidateSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema validation tests for TransferCandidate server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listTransferCandidatesSchema tests
// ---------------------------------------------------------------------------

describe("listTransferCandidatesSchema", () => {
  it("accepts empty params (all optional)", () => {
    const result = listTransferCandidatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBeUndefined();
      expect(result.data.transferConfirmationId).toBeUndefined();
      expect(result.data.candidateId).toBeUndefined();
      expect(result.data.transferId).toBeUndefined();
      expect(result.data.transferFileId).toBeUndefined();
    }
  });

  it("accepts tcId as string", () => {
    const result = listTransferCandidatesSchema.safeParse({ tcId: "1,2,3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe("1,2,3");
    }
  });

  it("accepts transferConfirmationId as string", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferConfirmationId: "CNF-12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferConfirmationId).toBe("CNF-12345");
    }
  });

  it("accepts candidateId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts transferId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: 7,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferId).toBe(7);
    }
  });

  it("accepts transferFileId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: 99,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferFileId).toBe(99);
    }
  });

  it("coerces candidateId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("coerces transferId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: "7",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferId).toBe(7);
    }
  });

  it("coerces transferFileId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferFileId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero transferId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative transferId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero transferFileId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative transferFileId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: -3,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all params together", () => {
    const result = listTransferCandidatesSchema.safeParse({
      tcId: "10,20",
      transferConfirmationId: "CNF-ABC",
      candidateId: 5,
      transferId: 3,
      transferFileId: 8,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe("10,20");
      expect(result.data.transferConfirmationId).toBe("CNF-ABC");
      expect(result.data.candidateId).toBe(5);
      expect(result.data.transferId).toBe(3);
      expect(result.data.transferFileId).toBe(8);
    }
  });
});

// ---------------------------------------------------------------------------
// getTransferCandidateSchema tests
// ---------------------------------------------------------------------------

describe("getTransferCandidateSchema", () => {
  it("accepts a valid positive tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(1);
    }
  });

  it("rejects zero tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing tcId", () => {
    const result = getTransferCandidateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string tcId to number", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(7);
    }
  });

  it("rejects non-numeric string tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects decimal tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 3.14 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

import type {
  TransferCandidateItem,
  TransferCandidateDetail,
  ListTransferCandidatesResult,
} from "./actions";

describe("TransferCandidateItem shape", () => {
  it("defines expected fields", () => {
    const mock: TransferCandidateItem = {
      tc_id: 1,
      transfer_id: 42,
      candidate_id: 100,
      prev_candidate_id: null,
      store_id: 5,
      store_name: "Main Branch",
      company_id: 3,
      company_name: "Acme Corp",
      company_email: "hr@acme.com",
      bank_id: 10,
      transfer_confirmation_id: "CNF-001",
      transfer_file_id: null,
      transfer_benef_name: "John Doe",
      transfer_benef_iban: "KW1234567890",
      candidate_hourly_rate: 10.5,
      company_hourly_rate: 15.0,
      hours: 8,
      minutes: 30,
      seconds: 0,
      bonus: 100,
      bonus_commission: 20,
      transfer_cost: 200,
      candidate_total: 84,
      company_total: 120,
      deleted: 0,
      paid: 1,
      is_candidate_notified: true,
      currency_code: "KWD",
      contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
      tc_created_at: new Date("2026-01-01"),
      tc_updated_at: new Date("2026-01-15"),
      candidate: {
        candidate_id: 100,
        candidate_name: "John Doe",
        candidate_name_ar: "جون دو",
      },
      transfer: {
        transfer_id: 42,
        transfer_status: 1,
      },
    };
    expect(mock.tc_id).toBe(1);
    expect(mock.transfer_id).toBe(42);
    expect(mock.candidate_id).toBe(100);
    expect(mock.store_name).toBe("Main Branch");
    expect(mock.company_name).toBe("Acme Corp");
    expect(mock.deleted).toBe(0);
    expect(mock.paid).toBe(1);
    expect(mock.is_candidate_notified).toBe(true);
    expect(mock.currency_code).toBe("KWD");
    expect(mock.contract_uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(mock.tc_created_at).toBeInstanceOf(Date);
    expect(mock.tc_updated_at).toBeInstanceOf(Date);
    expect(mock.candidate?.candidate_name).toBe("John Doe");
    expect(mock.transfer?.transfer_status).toBe(1);
  });

  it("allows null relations", () => {
    const mock: TransferCandidateItem = {
      tc_id: 2,
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
      tc_created_at: new Date(),
      tc_updated_at: new Date(),
      candidate: null,
      transfer: null,
    };
    expect(mock.tc_id).toBe(2);
    expect(mock.candidate).toBeNull();
    expect(mock.transfer).toBeNull();
  });
});

describe("TransferCandidateDetail shape", () => {
  it("accepts null (not found)", () => {
    const detail: TransferCandidateDetail = null;
    expect(detail).toBeNull();
  });
});

describe("ListTransferCandidatesResult shape", () => {
  it("holds items array and total count", () => {
    const result: ListTransferCandidatesResult = {
      items: [],
      total: 0,
    };
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
