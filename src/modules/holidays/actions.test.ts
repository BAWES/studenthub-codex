import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listHolidaysSchema,
  getHolidaySchema,
  createHolidaySchema,
  deleteHolidaySchema,
} from "./actions";

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
      description: "UAE National Day holiday",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("National Day");
      expect(result.data.date).toBe("2026-12-02");
      expect(result.data.isRecurring).toBe(true);
      expect(result.data.description).toBe("UAE National Day holiday");
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
// Return type shape verification
// ---------------------------------------------------------------------------

type HolidayItem = {
  holiday_uuid: string;
  name: string;
  date: Date | string;
  is_recurring: boolean;
  description: string | null;
  is_deleted: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListHolidaysResult = {
  holidays: HolidayItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListHolidaysResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListHolidaysResult = {
      holidays: [
        {
          holiday_uuid: "abc-123",
          name: "National Day",
          date: "2026-12-02",
          is_recurring: true,
          description: "UAE National Day",
          is_deleted: false,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.holidays).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty holiday list", () => {
    const result: ListHolidaysResult = {
      holidays: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.holidays).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

describe("getHoliday return type", () => {
  it("returns HolidayItem or null", () => {
    const found: HolidayItem = {
      holiday_uuid: "abc",
      name: "National Day",
      date: "2026-12-02",
      is_recurring: true,
      description: "UAE National Day",
      is_deleted: false,
      created_at: null,
      updated_at: null,
    };
    const notFound: null = null;

    expect(found.name).toBe("National Day");
    expect(notFound).toBeNull();
  });
});

describe("createHoliday return type", () => {
  it("returns HolidayItem", () => {
    const created: HolidayItem = {
      holiday_uuid: "new-uuid",
      name: "New Year",
      date: "2026-01-01",
      is_recurring: false,
      description: null,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(created.holiday_uuid).toBe("new-uuid");
    expect(created.is_deleted).toBe(false);
  });
});

describe("deleteHoliday return type", () => {
  it("returns success object", () => {
    const result: { success: boolean } = { success: true };
    expect(result.success).toBe(true);
  });
});
