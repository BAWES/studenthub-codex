import { describe, it, expect } from "vitest";
import {
  idCardItemSchema,
  listIdCardsResultSchema,
  idCardActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validIdCardItem = () => ({
  id: 1,
  candidate_id: 42,
  expiry_date: new Date("2027-06-01"),
  deleted: 0,
  created_at: new Date("2026-01-15T10:00:00Z"),
  updated_at: new Date("2026-01-15T10:00:00Z"),
});

const nullableIdCardItem = () => ({
  id: 2,
  candidate_id: null,
  expiry_date: null,
  deleted: 0,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// idCardItemSchema (output)
// ---------------------------------------------------------------------------

describe("idCardItemSchema", () => {
  it("accepts a full id card item with all fields populated", () => {
    const r = idCardItemSchema.safeParse(validIdCardItem());
    expect(r.success).toBe(true);
  });

  it("accepts an id card item with nullable fields set to null", () => {
    const r = idCardItemSchema.safeParse(nullableIdCardItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'id'", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'deleted'", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      deleted: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number id", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      candidate_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date expiry_date", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      expiry_date: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number deleted", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      deleted: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      created_at: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date updated_at", () => {
    const r = idCardItemSchema.safeParse({
      ...validIdCardItem(),
      updated_at: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    const r = idCardItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listIdCardsResultSchema (output)
// ---------------------------------------------------------------------------

describe("listIdCardsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [validIdCardItem(), nullableIdCardItem()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty idCards array", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listIdCardsResultSchema.safeParse({ idCards: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-array idCards", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listIdCardsResultSchema.safeParse({
      idCards: [],
      total: 0,
      page: 1.5,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idCardActionResultSchema (output)
// ---------------------------------------------------------------------------

describe("idCardActionResultSchema", () => {
  it("accepts a valid action result", () => {
    const r = idCardActionResultSchema.safeParse({
      operation: "create",
      message: "ID card created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const r = idCardActionResultSchema.safeParse({
      message: "something happened",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const r = idCardActionResultSchema.safeParse({
      operation: "create",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const r = idCardActionResultSchema.safeParse({
      operation: 123,
      message: "something happened",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const r = idCardActionResultSchema.safeParse({
      operation: "create",
      message: 456,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty object", () => {
    const r = idCardActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
