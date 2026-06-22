import { describe, it, expect } from "vitest";
import {
  transferListItemSchema,
  listTransfersResultSchema,
} from "./schemas";

const validTransferItem = () => ({
  transfer_id: 1,
  company_id: 42,
  contract_uuid: "abc-def-ghi",
  contract_type: "hourly",
  total: "1250.00",
  company_total: "1500.00",
  transfer_status: 1,
  currency_code: "KWD",
  start_date: "2024-01-01",
  end_date: "2024-06-30",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-06-20T14:00:00Z",
});

const validTransferItemNullables = () => ({
  transfer_id: 2,
  company_id: null,
  contract_uuid: null,
  contract_type: null,
  total: null,
  company_total: null,
  transfer_status: 0,
  currency_code: null,
  start_date: null,
  end_date: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// transferListItemSchema
// ---------------------------------------------------------------------------

describe("transferListItemSchema", () => {
  it("accepts a full transfer item with all fields", () => {
    const r = transferListItemSchema.safeParse(validTransferItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields all set to null", () => {
    const r = transferListItemSchema.safeParse(validTransferItemNullables());
    expect(r.success).toBe(true);
  });

  it("rejects missing all required fields (empty object)", () => {
    const r = transferListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for transfer_id (string instead of number)", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      transfer_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for transfer_status (string instead of number)", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      transfer_status: "active",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for contract_uuid (number instead of string)", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      contract_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for total (number instead of string)", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      total: 999,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable transfer_id", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      transfer_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable transfer_status", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      transfer_status: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty string for contract_uuid (nullable string)", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      contract_uuid: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero for transfer_status", () => {
    const r = transferListItemSchema.safeParse({
      ...validTransferItem(),
      transfer_status: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listTransfersResultSchema
// ---------------------------------------------------------------------------

describe("listTransfersResultSchema", () => {
  it("accepts a full paginated result with transfer items", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [validTransferItem(), validTransferItemNullables()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty transfers array", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit exceeding max (100)", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields (empty object)", () => {
    const r = listTransfersResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("validates nested transfer items within paginated result", () => {
    const r = listTransfersResultSchema.safeParse({
      transfers: [{ ...validTransferItem(), transfer_id: "not-a-number" }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});
