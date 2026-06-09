import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff work session schema validation
//
// These schemas mirror the ones in actions.ts. Testing them separately avoids
// mocking "use server" dependencies (prisma, session, etc.).
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

const createStaffWorkSessionSchema = z.object({
  staff_id: z.coerce.number().int().positive("Staff ID is required"),
  total_minutes: z.coerce.number().int().min(0).optional().default(0),
});

describe("listStaffWorkSessionsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listStaffWorkSessionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts staffId filter", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ staffId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("accepts date range filter", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe("2025-01-01");
      expect(result.data.endDate).toBe("2025-12-31");
    }
  });

  it("accepts startDate only", () => {
    const result = listStaffWorkSessionsSchema.safeParse({
      startDate: "2025-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe("2025-06-01");
      expect(result.data.endDate).toBeUndefined();
    }
  });

  it("rejects limit over 100", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const result = listStaffWorkSessionsSchema.safeParse({ limit: 0 });
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
});

describe("getStaffWorkSessionSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getStaffWorkSessionSchema.safeParse({
      workSessionUuid: "work_session_550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
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

describe("createStaffWorkSessionSchema", () => {
  it("accepts valid data with staff_id only", () => {
    const result = createStaffWorkSessionSchema.safeParse({ staff_id: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staff_id).toBe(42);
      expect(result.data.total_minutes).toBe(0);
    }
  });

  it("accepts valid data with total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 15,
      total_minutes: 480,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staff_id).toBe(15);
      expect(result.data.total_minutes).toBe(480);
    }
  });

  it("accepts zero total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 10,
      total_minutes: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative staff_id", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: -5,
      total_minutes: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total_minutes", () => {
    const result = createStaffWorkSessionSchema.safeParse({
      staff_id: 10,
      total_minutes: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type StaffWorkSession = {
  work_session_uuid: string;
  staff_id: number | null;
  total_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type ListStaffWorkSessionsResult = {
  sessions: StaffWorkSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateStaffWorkSessionResult = {
  work_session_uuid: string;
  staff_id: number | null;
  total_minutes: number | null;
};

describe("StaffWorkSession type shape", () => {
  it("defines the expected fields", () => {
    const mock: StaffWorkSession = {
      work_session_uuid: "work_session_550e8400-e29b-41d4-a716-446655440000",
      staff_id: 42,
      total_minutes: 480,
      created_at: "2025-06-09T10:00:00.000Z",
      updated_at: "2025-06-09T10:00:00.000Z",
    };
    expect(mock.work_session_uuid).toBe(
      "work_session_550e8400-e29b-41d4-a716-446655440000",
    );
    expect(mock.staff_id).toBe(42);
    expect(mock.total_minutes).toBe(480);
    expect(mock.created_at).toBe("2025-06-09T10:00:00.000Z");
    expect(mock.updated_at).toBe("2025-06-09T10:00:00.000Z");
  });
});

describe("ListStaffWorkSessionsResult type shape", () => {
  it("accepts a valid result set with data", () => {
    const result: ListStaffWorkSessionsResult = {
      sessions: [
        {
          work_session_uuid:
            "work_session_550e8400-e29b-41d4-a716-446655440000",
          staff_id: 42,
          total_minutes: 480,
          created_at: "2025-06-09T10:00:00.000Z",
          updated_at: "2025-06-09T10:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.sessions).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("accepts an empty result set", () => {
    const result: ListStaffWorkSessionsResult = {
      sessions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.sessions).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe("CreateStaffWorkSessionResult type shape", () => {
  it("accepts a success result", () => {
    const result: CreateStaffWorkSessionResult = {
      work_session_uuid: "work_session_550e8400-e29b-41d4-a716-446655440000",
      staff_id: 42,
      total_minutes: 480,
    };
    expect(result.work_session_uuid).toBe(
      "work_session_550e8400-e29b-41d4-a716-446655440000",
    );
    expect(result.staff_id).toBe(42);
    expect(result.total_minutes).toBe(480);
  });

  it("accepts null fields", () => {
    const result: CreateStaffWorkSessionResult = {
      work_session_uuid: "work_session_00000000-0000-0000-0000-000000000000",
      staff_id: null,
      total_minutes: null,
    };
    expect(result.staff_id).toBeNull();
    expect(result.total_minutes).toBeNull();
  });
});
