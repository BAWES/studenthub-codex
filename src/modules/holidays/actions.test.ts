import { describe, it, expect } from "vitest";
import {
  listHolidaysSchema,
  getHolidaySchema,
  createHolidaySchema,
  deleteHolidaySchema,
  holidayItemSchema,
  holidayDetailSchema,
  listHolidaysResultSchema,
  deleteHolidayResultSchema,
  type HolidayItem,
  type ListHolidaysResult,
  type DeleteHolidayResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests: listHolidaysSchema
// ---------------------------------------------------------------------------

describe("listHolidaysSchema", () => {
  it("accepts empty params (uses defaults)", () => {
    const result = listHolidaysSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listHolidaysSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts year filter", () => {
    const result = listHolidaysSchema.safeParse({ year: 2025 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2025);
    }
  });

  it("rejects limit over 100", () => {
    const result = listHolidaysSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listHolidaysSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects year below 2000", () => {
    const result = listHolidaysSchema.safeParse({ year: 1999 });
    expect(result.success).toBe(false);
  });

  it("rejects year above 2100", () => {
    const result = listHolidaysSchema.safeParse({ year: 2101 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests: getHolidaySchema
// ---------------------------------------------------------------------------

describe("getHolidaySchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getHolidaySchema.safeParse({ uuid: "abc-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("abc-123");
    }
  });

  it("rejects empty uuid", () => {
    const result = getHolidaySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getHolidaySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests: createHolidaySchema
// ---------------------------------------------------------------------------

describe("createHolidaySchema", () => {
  it("accepts valid holiday data", () => {
    const result = createHolidaySchema.safeParse({
      name: "New Year",
      date: "2025-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("New Year");
      expect(result.data.date).toBe("2025-01-01");
      expect(result.data.isRecurring).toBe(false);
    }
  });

  it("accepts with optional fields", () => {
    const result = createHolidaySchema.safeParse({
      name: "Christmas",
      date: "2025-12-25",
      isRecurring: true,
      description: "Christmas Day",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRecurring).toBe(true);
      expect(result.data.description).toBe("Christmas Day");
    }
  });

  it("rejects missing name", () => {
    const result = createHolidaySchema.safeParse({ date: "2025-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = createHolidaySchema.safeParse({ name: "New Year" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createHolidaySchema.safeParse({
      name: "Bad Date",
      date: "01-01-2025",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createHolidaySchema.safeParse({
      name: "",
      date: "2025-01-01",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests: deleteHolidaySchema
// ---------------------------------------------------------------------------

describe("deleteHolidaySchema", () => {
  it("accepts a valid UUID string", () => {
    const result = deleteHolidaySchema.safeParse({ uuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = deleteHolidaySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = deleteHolidaySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: holidayItemSchema
// ---------------------------------------------------------------------------

const validHolidayItem = {
  holiday_uuid: "550e8400-e29b-41d4-a716-446655440000",
  name: "New Year",
  date: new Date("2025-01-01"),
  is_recurring: true,
  description: "New Year's Day",
  is_deleted: false,
  created_at: new Date("2025-01-01T00:00:00Z"),
  updated_at: new Date("2025-01-01T00:00:00Z"),
};

describe("holidayItemSchema", () => {
  it("accepts a valid holiday item", () => {
    const result = holidayItemSchema.parse(validHolidayItem);
    expect(result.holiday_uuid).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result.name).toBe("New Year");
  });

  it("accepts nullable fields as null", () => {
    const result = holidayItemSchema.parse({
      ...validHolidayItem,
      description: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.description).toBeNull();
    expect(result.created_at).toBeNull();
    expect(result.updated_at).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { name, ...rest } = validHolidayItem;
    expect(() => holidayItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for date field", () => {
    expect(() =>
      holidayItemSchema.parse({ ...validHolidayItem, date: "not-a-date" }),
    ).toThrow();
  });

  it("rejects wrong type for is_recurring", () => {
    expect(() =>
      holidayItemSchema.parse({ ...validHolidayItem, is_recurring: "yes" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: holidayDetailSchema
// ---------------------------------------------------------------------------

describe("holidayDetailSchema", () => {
  it("accepts a valid holiday item", () => {
    const result = holidayDetailSchema.parse(validHolidayItem);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = holidayDetailSchema.parse(null);
    expect(result).toBeNull();
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

  it("rejects zero page", () => {
    expect(() =>
      listHolidaysResultSchema.parse({
        holidays: [],
        total: 0,
        page: 0,
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
  it("accepts a valid delete result", () => {
    const result = deleteHolidayResultSchema.parse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(() => deleteHolidayResultSchema.parse({})).toThrow();
  });

  it("rejects non-boolean success", () => {
    expect(() => deleteHolidayResultSchema.parse({ success: "yes" })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time, runtime assertions)
// ---------------------------------------------------------------------------

describe("HolidayItem shape", () => {
  it("defines the expected fields", () => {
    const mock: HolidayItem = {
      holiday_uuid: "abc-123",
      name: "Test Holiday",
      date: new Date("2025-06-01"),
      is_recurring: false,
      description: null,
      is_deleted: false,
      created_at: null,
      updated_at: null,
    };
    expect(mock.holiday_uuid).toBe("abc-123");
    expect(mock.name).toBe("Test Holiday");
    expect(mock.date).toBeInstanceOf(Date);
    expect(mock.is_recurring).toBe(false);
    expect(mock.description).toBeNull();
    expect(mock.is_deleted).toBe(false);
    expect(mock.created_at).toBeNull();
    expect(mock.updated_at).toBeNull();
  });
});

describe("ListHolidaysResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListHolidaysResult = {
      holidays: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.holidays).toHaveLength(0);
  });
});

describe("DeleteHolidayResult shape", () => {
  it("has success boolean", () => {
    const result: DeleteHolidayResult = { success: true };
    expect(result.success).toBe(true);
  });
});
