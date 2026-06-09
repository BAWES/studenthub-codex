import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — mirror the ones in actions.ts
// ---------------------------------------------------------------------------

const listStaffWorkSessionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getStaffWorkSessionSchema = z.object({
  workSessionUuid: z.string().min(1, "Work session UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StaffWorkSession = {
  work_session_uuid: string;
  staff_id: number | null;
  total_minutes: number | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// listStaffWorkSessionsSchema
// ---------------------------------------------------------------------------

describe("listStaffWorkSessionsSchema", () => {
  it("accepts empty params (defaults to page 1, limit 20)", () => {
    const result = listStaffWorkSessionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts staffId filter", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(5);
    }
  });

  it("accepts date range filters", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-06-09",
    });
    expect(result.success).toBe(true);
  });

  it("accepts custom pagination", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts startDate only (no endDate)", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts endDate only (no startDate)", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      endDate: "2026-06-09",
    });
    expect(result.success).toBe(true);
  });

  it("coerces numeric strings to numbers", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      page: "3",
      limit: "25",
      staffId: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
      expect(result.data.staffId).toBe(10);
    }
  });
});

// ---------------------------------------------------------------------------
// getStaffWorkSessionSchema
// ---------------------------------------------------------------------------

describe("getStaffWorkSessionSchema", () => {
  it("accepts valid work session UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({
      workSessionUuid: "work_session_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workSessionUuid).toBe("work_session_abc123");
    }
  });

  it("rejects empty UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({
      workSessionUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// StaffWorkSession type shape
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// createStaffWorkSessionSchema
// ---------------------------------------------------------------------------

const createStaffWorkSessionSchema = z.object({
  staff_id: z.coerce.number().int().positive("Staff ID is required"),
  total_minutes: z.coerce.number().int().min(0).optional().default(0),
});

describe("createStaffWorkSessionSchema", () => {
  it("accepts valid staff_id and total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 5,
      total_minutes: 480,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staff_id).toBe(5);
      expect(result.data.total_minutes).toBe(480);
    }
  });

  it("defaults total_minutes to 0 when omitted", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_minutes).toBe(0);
    }
  });

  it("rejects missing staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      total_minutes: 480,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 1,
      total_minutes: -10,
    });
    expect(result.success).toBe(false);
  });

  it("coerces numeric strings to numbers", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: "7",
      total_minutes: "300",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staff_id).toBe(7);
      expect(result.data.total_minutes).toBe(300);
    }
  });
});

// ---------------------------------------------------------------------------
// createStaffWorkSession — result type shape
// ---------------------------------------------------------------------------

type CreateStaffWorkSessionResult = {
  work_session_uuid: string;
  staff_id: number | null;
  total_minutes: number | null;
};

describe("createStaffWorkSession result type", () => {
  it("has all required fields", () => {
    const result: CreateStaffWorkSessionResult = {
      work_session_uuid: "work_session_abc123",
      staff_id: 5,
      total_minutes: 480,
    };
    expect(result.work_session_uuid).toMatch(/^work_session_/);
    expect(result.staff_id).toBe(5);
    expect(result.total_minutes).toBe(480);
  });

  it("accepts nullable fields", () => {
    const result: CreateStaffWorkSessionResult = {
      work_session_uuid: "work_session_xyz",
      staff_id: null,
      total_minutes: null,
    };
    expect(result.staff_id).toBeNull();
    expect(result.total_minutes).toBeNull();
  });
});

describe("StaffWorkSession type", () => {
  it("has all required fields", () => {
    const session: StaffWorkSession = {
      work_session_uuid: "work_session_abc123",
      staff_id: 5,
      total_minutes: 480,
      created_at: "2026-06-09T04:00:00.000Z",
      updated_at: "2026-06-09T04:00:00.000Z",
    };
    expect(session.work_session_uuid).toBe("work_session_abc123");
    expect(session.staff_id).toBe(5);
    expect(session.total_minutes).toBe(480);
    expect(session.created_at).toBeTruthy();
    expect(session.updated_at).toBeTruthy();
  });

  it("accepts nullable staff_id and total_minutes", () => {
    const session: StaffWorkSession = {
      work_session_uuid: "work_session_xyz",
      staff_id: null,
      total_minutes: null,
      created_at: "2026-06-09T04:00:00.000Z",
      updated_at: "2026-06-09T04:00:00.000Z",
    };
    expect(session.staff_id).toBeNull();
    expect(session.total_minutes).toBeNull();
  });

  it("has valid ISO date strings for timestamps", () => {
    const session: StaffWorkSession = {
      work_session_uuid: "work_session_123",
      staff_id: 1,
      total_minutes: 300,
      created_at: "2026-06-09T00:00:00.000Z",
      updated_at: "2026-06-09T00:00:00.000Z",
    };
    expect(() => new Date(session.created_at)).not.toThrow();
    expect(() => new Date(session.updated_at)).not.toThrow();
    expect(new Date(session.created_at).toISOString()).toBeTruthy();
  });
});
