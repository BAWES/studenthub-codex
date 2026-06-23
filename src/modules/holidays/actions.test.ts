import { describe, it, expect } from "vitest";

import {
  listHolidaysSchema,
  getHolidaySchema,
  createHolidaySchema,
  deleteHolidaySchema,
  holidayItemSchema,
  listHolidaysResultSchema,
  deleteHolidayResultSchema,
  type HolidayItem,
  type ListHolidaysResult,
} from "./schemas";

describe("listHolidaysSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listHolidaysSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.year).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listHolidaysSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts year filter", () => {
    const result = listHolidaysSchema.safeParse({ year: "2026" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2026);
    }
  });

  it("rejects page less than 1", () => {
    const result = listHolidaysSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listHolidaysSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listHolidaysSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listHolidaysSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listHolidaysSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listHolidaysSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it("rejects non-integer year", () => {
    const result = listHolidaysSchema.safeParse({ year: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getHolidaySchema", () => {
  it("accepts valid UUID string", () => {
    const result = getHolidaySchema.safeParse({
      uuid: "holiday-001-uuid-string",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("holiday-001-uuid-string");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getHolidaySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getHolidaySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createHolidaySchema", () => {
  it("accepts valid holiday data", () => {
    const result = createHolidaySchema.safeParse({
      name: "National Day",
      date: "2026-12-02",
      isRecurring: true,
      description: "Kuwait National Day holiday",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("National Day");
      expect(result.data.date).toBe("2026-12-02");
      expect(result.data.isRecurring).toBe(true);
      expect(result.data.description).toBe("Kuwait National Day holiday");
    }
  });

  it("accepts minimal holiday data", () => {
    const result = createHolidaySchema.safeParse({
      name: "New Year",
      date: "2026-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("New Year");
      expect(result.data.date).toBe("2026-01-01");
      expect(result.data.isRecurring).toBe(false);
      expect(result.data.description).toBeUndefined();
    }
  });

  it("rejects missing name", () => {
    const result = createHolidaySchema.safeParse({
      date: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = createHolidaySchema.safeParse({
      name: "New Year",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createHolidaySchema.safeParse({
      name: "Bad Date",
      date: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty description", () => {
    const result = createHolidaySchema.safeParse({
      name: "Test",
      date: "2026-06-01",
      description: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteHolidaySchema", () => {
  it("accepts valid UUID", () => {
    const result = deleteHolidaySchema.safeParse({
      uuid: "holiday-to-delete-uuid",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("holiday-to-delete-uuid");
    }
  });

  it("rejects empty UUID", () => {
    const result = deleteHolidaySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteHolidaySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: holidayItemSchema
// ---------------------------------------------------------------------------

const validHolidayItem: HolidayItem = {
  holiday_uuid: "abc-123",
  name: "National Day",
  date: "2026-12-02",
  is_recurring: true,
  description: "Kuwait National Day",
  is_deleted: false,
  created_at: null,
  updated_at: null,
};

describe("holidayItemSchema", () => {
  it("accepts a valid holiday item", () => {
    const result = holidayItemSchema.parse(validHolidayItem);
    expect(result.holiday_uuid).toBe("abc-123");
  });

  it("accepts nullable date fields as null", () => {
    const result = holidayItemSchema.parse({
      ...validHolidayItem,
      created_at: null,
      updated_at: null,
    });
    expect(result.created_at).toBeNull();
    expect(result.updated_at).toBeNull();
  });

  it("rejects missing required field", () => {
    const { name, ...rest } = validHolidayItem;
    expect(() => holidayItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for boolean field", () => {
    expect(() =>
      holidayItemSchema.parse({ ...validHolidayItem, is_recurring: "yes" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listHolidaysResultSchema
// ---------------------------------------------------------------------------

describe("listHolidaysResultSchema", () => {
  it("accepts a valid result with holidays", () => {
    const result = listHolidaysResultSchema.parse({
      holidays: [validHolidayItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.holidays.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listHolidaysResultSchema.parse({
      holidays: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.holidays.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listHolidaysResultSchema.parse({
        holidays: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects negative total", () => {
    expect(() =>
      listHolidaysResultSchema.parse({
        holidays: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: deleteHolidayResultSchema
// ---------------------------------------------------------------------------

describe("deleteHolidayResultSchema", () => {
  it("accepts success result", () => {
    const result = deleteHolidayResultSchema.parse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(() => deleteHolidayResultSchema.parse({ success: "yes" })).toThrow();
  });
});
