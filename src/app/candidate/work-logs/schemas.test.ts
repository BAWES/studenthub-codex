import { describe, it, expect } from "vitest";
import {
  listWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
  workLogItemOutputSchema,
  workLogDetailOutputSchema,
  listWorkLogsResultOutputSchema,
  submitWorkLogResultOutputSchema,
  updateWorkLogStatusResultOutputSchema,
} from "./schemas";

describe("listWorkLogsSchema", () => {
  it("accepts empty input (uses defaults)", () => {
    expect(listWorkLogsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid input", () => {
    expect(
      listWorkLogsSchema.safeParse({ page: 1, limit: 20, date: "2025-01-01" }).success
    ).toBe(true);
  });

  it("rejects non-positive page", () => {
    expect(listWorkLogsSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(listWorkLogsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listWorkLogsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listWorkLogsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });
});

describe("getWorkLogDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getWorkLogDetailSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getWorkLogDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(getWorkLogDetailSchema.safeParse({ workLogUuid: "" }).success).toBe(false);
  });

  it("rejects non-string workLogUuid", () => {
    expect(getWorkLogDetailSchema.safeParse({ workLogUuid: 123 }).success).toBe(false);
  });
});

describe("submitWorkLogSchema", () => {
  it("accepts valid input with required fields only", () => {
    expect(
      submitWorkLogSchema.safeParse({
        date: "2025-01-15",
        startTime: "09:00",
      }).success
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      submitWorkLogSchema.safeParse({
        date: "2025-01-15",
        startTime: "09:00",
        endTime: "17:00",
        totalTime: 8,
        note: "Full day",
        storeId: 1,
      }).success
    ).toBe(true);
  });

  it("accepts string-coercible totalTime", () => {
    expect(
      submitWorkLogSchema.safeParse({
        date: "2025-01-15",
        startTime: "09:00",
        totalTime: "8",
      }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(submitWorkLogSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing date", () => {
    expect(
      submitWorkLogSchema.safeParse({ startTime: "09:00" }).success
    ).toBe(false);
  });

  it("rejects missing startTime", () => {
    expect(
      submitWorkLogSchema.safeParse({ date: "2025-01-15" }).success
    ).toBe(false);
  });

  it("rejects empty date", () => {
    expect(
      submitWorkLogSchema.safeParse({ date: "", startTime: "09:00" }).success
    ).toBe(false);
  });

  it("rejects empty startTime", () => {
    expect(
      submitWorkLogSchema.safeParse({ date: "2025-01-15", startTime: "" }).success
    ).toBe(false);
  });

  it("rejects non-string date", () => {
    expect(
      submitWorkLogSchema.safeParse({ date: 123, startTime: "09:00" }).success
    ).toBe(false);
  });
});

describe("updateWorkLogStatusSchema", () => {
  it("accepts valid input with status 0", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "wl-001", status: 0 }).success
    ).toBe(true);
  });

  it("accepts string-coercible status", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "wl-001", status: "1" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateWorkLogStatusSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing workLogUuid", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ status: 1 }).success
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "", status: 1 }).success
    ).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "wl-001", status: -1 }).success
    ).toBe(false);
  });

  it("rejects non-coercible status", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "wl-001", status: "abc" }).success
    ).toBe(false);
  });
});

describe("workLogItemOutputSchema", () => {
  const now = new Date();
  const validItem = {
    candidate_working_hour_uuid: "wl-001",
    date: now,
    start_time: now,
    end_time: now,
    total_time: 8,
    status: 1,
    via: "mobile",
    note: "On time",
    store_name: "Store A",
    company_name: "Company X",
    created_at: now,
    updated_at: now,
  };

  it("accepts valid output", () => {
    expect(workLogItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts valid output with null values", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        end_time: null,
        total_time: null,
        status: null,
        via: null,
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      }).success
    ).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    const { candidate_working_hour_uuid, ...rest } = validItem;
    expect(workLogItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for date field", () => {
    expect(
      workLogItemOutputSchema.safeParse({ ...validItem, date: "2025-01-01" }).success
    ).toBe(false);
  });
});

describe("workLogDetailOutputSchema", () => {
  const now = new Date();
  const validDetail = {
    candidate_working_hour_uuid: "wl-001",
    date: now,
    start_time: now,
    end_time: now,
    total_time: 8,
    status: 1,
    via: "mobile",
    note: "On time",
    store_name: "Store A",
    company_name: "Company X",
    created_at: now,
    updated_at: now,
    start_location_lat: 29.3759,
    start_location_long: 47.9774,
    end_location_lat: null,
    end_location_long: null,
    store_location: "Kuwait City",
  };

  it("accepts valid output", () => {
    expect(workLogDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("rejects missing extended field", () => {
    const { start_location_lat, ...rest } = validDetail;
    expect(workLogDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listWorkLogsResultOutputSchema", () => {
  const now = new Date();
  const validResult = {
    items: [
      {
        candidate_working_hour_uuid: "wl-001",
        date: now,
        start_time: now,
        end_time: null,
        total_time: 8,
        status: 1,
        via: "mobile",
        note: null,
        store_name: "Store A",
        company_name: "Company X",
        created_at: now,
        updated_at: now,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid output", () => {
    expect(listWorkLogsResultOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listWorkLogsResultOutputSchema.safeParse({ ...validResult, total: -1 }).success
    ).toBe(false);
  });

  it("rejects missing items", () => {
    const { items, ...rest } = validResult;
    expect(listWorkLogsResultOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("submitWorkLogResultOutputSchema", () => {
  const now = new Date();
  const baseWorkLog = {
    candidate_working_hour_uuid: "wl-001",
    date: now,
    start_time: now,
    end_time: null,
    total_time: 8,
    status: 1,
    via: "mobile",
    note: null,
    store_name: "Store A",
    company_name: "Company X",
    created_at: now,
    updated_at: now,
  };

  it("accepts success branch", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
        message: "Work log submitted",
      }).success
    ).toBe(true);
  });

  it("accepts success branch with workLog", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
        message: "Work log submitted",
        workLog: baseWorkLog,
      }).success
    ).toBe(true);
  });

  it("accepts error branch", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "error",
        message: "Failed to submit",
      }).success
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "success",
      }).success
    ).toBe(false);
  });

  it("rejects empty object", () => {
    expect(submitWorkLogResultOutputSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateWorkLogStatusResultOutputSchema", () => {
  const now = new Date();
  const baseWorkLog = {
    candidate_working_hour_uuid: "wl-001",
    date: now,
    start_time: now,
    end_time: null,
    total_time: 8,
    status: 1,
    via: "mobile",
    note: null,
    store_name: "Store A",
    company_name: "Company X",
    created_at: now,
    updated_at: now,
  };

  it("accepts success branch", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
      }).success
    ).toBe(true);
  });

  it("accepts success branch with workLog", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "success",
        message: "Status updated",
        workLog: baseWorkLog,
      }).success
    ).toBe(true);
  });

  it("accepts error branch", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "error",
        message: "Failed to update",
      }).success
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "success",
      }).success
    ).toBe(false);
  });
});
