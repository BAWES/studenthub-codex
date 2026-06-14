import { describe, it, expect } from "vitest";
import {
  storeItemSchema,
  listStoresResultSchema,
} from "./schemas";

const validStoreItem = () => ({
  store_id: 1,
  store_name: "Main Branch",
  store_location: "Kuwait City, Sharq",
  store_status: 1,
  store_total_candidates: 42,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-06-20T14:00:00Z",
});

const validStoreItemNullable = () => ({
  store_id: 2,
  store_name: "Secondary Branch",
  store_location: "Salmiya",
  store_status: 0,
  store_total_candidates: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// storeItemSchema
// ---------------------------------------------------------------------------

describe("storeItemSchema", () => {
  it("accepts a full store item with all fields", () => {
    const r = storeItemSchema.safeParse(validStoreItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields set to null", () => {
    const r = storeItemSchema.safeParse(validStoreItemNullable());
    expect(r.success).toBe(true);
  });

  it("rejects missing all required fields (empty object)", () => {
    const r = storeItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for store_id (string instead of number)", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for store_name (number instead of string)", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_name: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for store_location (number instead of string)", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_location: 456,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for store_status (string instead of number)", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_status: "active",
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable store_id", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined for non-nullable store_name", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_name: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts empty string for store_name", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_name: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty string for store_location", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_location: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero for store_status", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_status: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero for store_total_candidates (nullable accepts number)", () => {
    const r = storeItemSchema.safeParse({
      ...validStoreItem(),
      store_total_candidates: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listStoresResultSchema
// ---------------------------------------------------------------------------

describe("listStoresResultSchema", () => {
  it("accepts a full paginated result with store items", () => {
    const r = listStoresResultSchema.safeParse({
      stores: [validStoreItem(), validStoreItemNullable()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty stores array", () => {
    const r = listStoresResultSchema.safeParse({
      stores: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listStoresResultSchema.safeParse({ stores: [] });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for total (string instead of number)", () => {
    const r = listStoresResultSchema.safeParse({
      stores: [],
      total: "not-a-number",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for page (string instead of number)", () => {
    const r = listStoresResultSchema.safeParse({
      stores: [],
      total: 0,
      page: "first",
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates nested store items within paginated result", () => {
    const r = listStoresResultSchema.safeParse({
      stores: [{ ...validStoreItem(), store_name: 12345 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects stores as non-array type", () => {
    const r = listStoresResultSchema.safeParse({
      stores: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
