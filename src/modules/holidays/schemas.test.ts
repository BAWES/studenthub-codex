import { describe, it, expect } from "vitest";
import {
  holidayItemSchema,
  holidayDetailSchema,
  listHolidaysResultSchema,
  deleteHolidayResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// holidayItemSchema
// ---------------------------------------------------------------------------
describe("holidayItemSchema", () => {
  const valid = {
    holiday_uuid: "hol-uuid-1",
    name: "National Day",
    date: "2026-02-25",
    is_recurring: true,
    description: "Annual national celebration",
    is_deleted: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  it("accepts a valid holiday item", () => {
    expect(holidayItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      holidayItemSchema.safeParse({
        ...valid, description: null, created_at: null, updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing holiday_uuid", () => {
    const { holiday_uuid: _, ...rest } = valid;
    expect(holidayItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(holidayItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean is_recurring", () => {
    expect(holidayItemSchema.safeParse({ ...valid, is_recurring: "yes" }).success).toBe(false);
  });

  it("rejects non-boolean is_deleted", () => {
    expect(holidayItemSchema.safeParse({ ...valid, is_deleted: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// holidayDetailSchema
// ---------------------------------------------------------------------------
describe("holidayDetailSchema", () => {
  it("accepts a valid holiday", () => {
    expect(holidayDetailSchema.safeParse({
      holiday_uuid: "h-1", name: "Holiday", date: "2026-01-01",
      is_recurring: false, description: null, is_deleted: false,
      created_at: null, updated_at: null,
    }).success).toBe(true);
  });

  it("accepts null", () => {
    expect(holidayDetailSchema.safeParse(null).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listHolidaysResultSchema
// ---------------------------------------------------------------------------
describe("listHolidaysResultSchema", () => {
  const valid = () => ({
    holidays: [{ holiday_uuid: "h-1", name: "Holiday", date: "2026-01-01",
                 is_recurring: false, description: null, is_deleted: false,
                 created_at: null, updated_at: null }],
    total: 1, page: 1, limit: 20, totalPages: 1,
  });

  it("accepts a valid paginated result", () => { expect(listHolidaysResultSchema.safeParse(valid()).success).toBe(true); });
  it("accepts empty holidays array", () => {
    expect(listHolidaysResultSchema.safeParse({ ...valid(), holidays: [] }).success).toBe(true);
  });
  it("rejects missing holidays", () => {
    const { holidays: _, ...rest } = valid();
    expect(listHolidaysResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteHolidayResultSchema
// ---------------------------------------------------------------------------
describe("deleteHolidayResultSchema", () => {
  it("accepts success: true", () => { expect(deleteHolidayResultSchema.safeParse({ success: true }).success).toBe(true); });
  it("accepts success: false", () => { expect(deleteHolidayResultSchema.safeParse({ success: false }).success).toBe(true); });
  it("rejects missing success", () => { expect(deleteHolidayResultSchema.safeParse({}).success).toBe(false); });
  it("rejects non-boolean success", () => {
    expect(deleteHolidayResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });
});
