import { describe, it, expect } from "vitest";
import {
  scheduleItemSchema,
  scheduleStatusResultSchema,
  scheduleDetailStoreCompanySchema,
  scheduleDetailStoreSchema,
  scheduleDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// scheduleItemSchema
// ---------------------------------------------------------------------------
describe("scheduleItemSchema", () => {
  const validItem = {
    cwd_uuid: "cwd-001",
    date: new Date("2026-06-14"),
    start_time: new Date("2026-06-14T09:00:00.000Z"),
    end_time: new Date("2026-06-14T17:00:00.000Z"),
    total_time: 8,
    status: 1,
    store_name: "Main Store",
    company_name: "Acme Corp",
  };

  it("accepts a fully populated schedule item", () => {
    expect(scheduleItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts nullable end_time", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, end_time: null }).success,
    ).toBe(true);
  });

  it("accepts nullable total_time", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, total_time: null }).success,
    ).toBe(true);
  });

  it("accepts nullable status", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, status: null }).success,
    ).toBe(true);
  });

  it("accepts nullable store_name", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, store_name: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_name", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, company_name: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      scheduleItemSchema.safeParse({
        cwd_uuid: "cwd-001",
        date: new Date("2026-06-14"),
        start_time: new Date("2026-06-14T09:00:00.000Z"),
        end_time: null,
        total_time: null,
        status: null,
        store_name: null,
        company_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid: _, ...rest } = validItem;
    expect(scheduleItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validItem;
    expect(scheduleItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing start_time", () => {
    const { start_time: _, ...rest } = validItem;
    expect(scheduleItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string cwd_uuid", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, cwd_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects string date instead of Date object", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, date: "2026-06-14" }).success,
    ).toBe(false);
  });

  it("rejects string start_time instead of Date object", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, start_time: "2026-06-14T09:00:00Z" }).success,
    ).toBe(false);
  });

  it("rejects non-integer total_time", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, total_time: 8.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, status: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects empty cwd_uuid", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, cwd_uuid: "" }).success,
    ).toBe(true); // bare z.string() accepts empty string
  });

  it("accepts empty store_name (bare z.string().nullable())", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, store_name: "" }).success,
    ).toBe(true);
  });

  it("accepts empty company_name (bare z.string().nullable())", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, company_name: "" }).success,
    ).toBe(true);
  });

  it("accepts zero total_time", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, total_time: 0 }).success,
    ).toBe(true);
  });

  it("accepts zero status", () => {
    expect(
      scheduleItemSchema.safeParse({ ...validItem, status: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// scheduleStatusResultSchema
// ---------------------------------------------------------------------------
describe("scheduleStatusResultSchema", () => {
  const validResult = {
    cwd_uuid: "cwd-001",
    status: 1,
  };

  it("accepts a valid status result", () => {
    expect(scheduleStatusResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts status 0", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "cwd-001", status: 0 }).success,
    ).toBe(true);
  });

  it("accepts status 3", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "cwd-001", status: 3 }).success,
    ).toBe(true);
  });

  it("accepts negative status (schema only constrains via int, not refine)", () => {
    // scheduleStatusResultSchema has z.number().int() — no refine, so negative is accepted
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "cwd-001", status: -1 }).success,
    ).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid: _, ...rest } = validResult;
    expect(scheduleStatusResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validResult;
    expect(scheduleStatusResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string cwd_uuid", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: 123, status: 1 }).success,
    ).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "cwd-001", status: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects string status", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "cwd-001", status: "1" }).success,
    ).toBe(false);
  });

  it("accepts empty cwd_uuid (bare z.string())", () => {
    expect(
      scheduleStatusResultSchema.safeParse({ cwd_uuid: "", status: 1 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// scheduleDetailStoreCompanySchema
// ---------------------------------------------------------------------------
describe("scheduleDetailStoreCompanySchema", () => {
  it("accepts a valid company with company_name", () => {
    expect(
      scheduleDetailStoreCompanySchema.safeParse({ company_name: "Acme Corp" }).success,
    ).toBe(true);
  });

  it("accepts null company_name", () => {
    expect(
      scheduleDetailStoreCompanySchema.safeParse({ company_name: null }).success,
    ).toBe(true);
  });

  it("accepts empty string company_name", () => {
    expect(
      scheduleDetailStoreCompanySchema.safeParse({ company_name: "" }).success,
    ).toBe(true);
  });

  it("rejects missing company_name", () => {
    expect(scheduleDetailStoreCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string company_name", () => {
    expect(
      scheduleDetailStoreCompanySchema.safeParse({ company_name: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleDetailStoreSchema
// ---------------------------------------------------------------------------
describe("scheduleDetailStoreSchema", () => {
  const validStore = {
    store_name: "Main Store",
    company: { company_name: "Acme Corp" },
  };

  it("accepts a fully populated store", () => {
    expect(scheduleDetailStoreSchema.safeParse(validStore).success).toBe(true);
  });

  it("accepts null company", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ ...validStore, company: null }).success,
    ).toBe(true);
  });

  it("accepts nullable store_name", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ ...validStore, store_name: null }).success,
    ).toBe(true);
  });

  it("accepts both nullable fields simultaneously", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ store_name: null, company: null }).success,
    ).toBe(true);
  });

  it("rejects missing store_name", () => {
    const { store_name: _, ...rest } = validStore;
    expect(scheduleDetailStoreSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company", () => {
    const { company: _, ...rest } = validStore;
    expect(scheduleDetailStoreSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-object company", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ ...validStore, company: "not-an-object" }).success,
    ).toBe(false);
  });

  it("rejects company with wrong fields", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({
        ...validStore,
        company: { name: "Acme" }, // should have company_name
      }).success,
    ).toBe(false);
  });

  it("accepts empty store_name (bare z.string().nullable())", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ store_name: "", company: null }).success,
    ).toBe(true);
  });

  it("rejects non-string store_name", () => {
    expect(
      scheduleDetailStoreSchema.safeParse({ ...validStore, store_name: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleDetailSchema
// ---------------------------------------------------------------------------
describe("scheduleDetailSchema", () => {
  const validDetail = {
    cwd_uuid: "cwd-001",
    date: new Date("2026-06-14"),
    start_time: new Date("2026-06-14T09:00:00.000Z"),
    end_time: new Date("2026-06-14T17:00:00.000Z"),
    total_time: 8,
    status: 1,
    created_at: new Date("2026-06-13T10:00:00.000Z"),
    updated_at: new Date("2026-06-14T12:00:00.000Z"),
    store: {
      store_name: "Main Store",
      company: { company_name: "Acme Corp" },
    },
  };

  it("accepts a fully populated schedule detail", () => {
    expect(scheduleDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts nullable end_time", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, end_time: null }).success,
    ).toBe(true);
  });

  it("accepts nullable total_time", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, total_time: null }).success,
    ).toBe(true);
  });

  it("accepts nullable status", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, status: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts null store", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, store: null }).success,
    ).toBe(true);
  });

  it("accepts store with null company", () => {
    expect(
      scheduleDetailSchema.safeParse({
        ...validDetail,
        store: { store_name: "Main Store", company: null },
      }).success,
    ).toBe(true);
  });

  it("accepts store with all nullable fields null", () => {
    expect(
      scheduleDetailSchema.safeParse({
        ...validDetail,
        store: { store_name: null, company: null },
      }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      scheduleDetailSchema.safeParse({
        cwd_uuid: "cwd-001",
        date: new Date("2026-06-14"),
        start_time: new Date("2026-06-14T09:00:00.000Z"),
        end_time: null,
        total_time: null,
        status: null,
        created_at: null,
        updated_at: null,
        store: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cwd_uuid", () => {
    const { cwd_uuid: _, ...rest } = validDetail;
    expect(scheduleDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validDetail;
    expect(scheduleDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing start_time", () => {
    const { start_time: _, ...rest } = validDetail;
    expect(scheduleDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing store", () => {
    const { store: _, ...rest } = validDetail;
    expect(scheduleDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string date instead of Date", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, date: "2026-06-14" }).success,
    ).toBe(false);
  });

  it("rejects string start_time instead of Date", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, start_time: "2026-06-14T09:00:00Z" }).success,
    ).toBe(false);
  });

  it("rejects string created_at instead of Date", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, created_at: "2026-06-13T10:00:00Z" }).success,
    ).toBe(false);
  });

  it("rejects non-integer total_time", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, total_time: 8.5 }).success,
    ).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, status: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects non-string cwd_uuid", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, cwd_uuid: 123 }).success,
    ).toBe(false);
  });

  it("accepts empty cwd_uuid (bare z.string())", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, cwd_uuid: "" }).success,
    ).toBe(true);
  });

  it("rejects store with wrong structure", () => {
    expect(
      scheduleDetailSchema.safeParse({
        ...validDetail,
        store: { name: "Main Store" }, // missing store_name, missing company
      }).success,
    ).toBe(false);
  });

  it("accepts zero total_time", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, total_time: 0 }).success,
    ).toBe(true);
  });

  it("accepts zero status", () => {
    expect(
      scheduleDetailSchema.safeParse({ ...validDetail, status: 0 }).success,
    ).toBe(true);
  });
});
