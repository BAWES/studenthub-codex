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

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listWorkLogsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listWorkLogsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listWorkLogsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listWorkLogsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listWorkLogsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit to number", () => {
    const r = listWorkLogsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts optional date filter", () => {
    const r = listWorkLogsSchema.safeParse({ date: "2026-06-15" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.date).toBe("2026-06-15");
    }
  });
});

describe("getWorkLogDetailSchema", () => {
  it("accepts valid work log UUID", () => {
    const r = getWorkLogDetailSchema.safeParse({
      workLogUuid: "wl_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.workLogUuid).toBe("wl_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      getWorkLogDetailSchema.safeParse({ workLogUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getWorkLogDetailSchema.safeParse({}).success).toBe(false);
  });
});

describe("submitWorkLogSchema", () => {
  it("accepts valid work log submission", () => {
    const r = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      endTime: "2026-06-15T16:00:00",
      note: "Worked on project X",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.date).toBe("2026-06-15");
      expect(r.data.note).toBe("Worked on project X");
    }
  });

  it("accepts minimal submission without endTime or note", () => {
    const r = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    expect(
      submitWorkLogSchema.safeParse({ startTime: "2026-06-15T08:00:00" })
        .success,
    ).toBe(false);
  });

  it("rejects missing startTime", () => {
    expect(
      submitWorkLogSchema.safeParse({ date: "2026-06-15" }).success,
    ).toBe(false);
  });

  it("accepts optional storeId", () => {
    const r = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      storeId: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.storeId).toBe(5);
    }
  });
});

describe("updateWorkLogStatusSchema", () => {
  it("accepts valid status update", () => {
    const r = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc-123",
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.workLogUuid).toBe("wl_abc-123");
      expect(r.data.status).toBe(1);
    }
  });

  it("rejects empty UUID", () => {
    expect(
      updateWorkLogStatusSchema.safeParse({ workLogUuid: "", status: 1 })
        .success,
    ).toBe(false);
  });

  it("coerces string status to number", () => {
    const r = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wl_abc-123",
      status: "1",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("workLogItemOutputSchema", () => {
  const validItem = {
    candidate_working_hour_uuid: "wl_abc-123",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T08:00:00"),
    end_time: new Date("2026-06-15T16:00:00"),
    total_time: 480,
    status: 1,
    via: "web",
    note: "Worked on project X",
    store_name: null,
    company_name: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid work log item with all fields", () => {
    expect(workLogItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null timestamps", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        date: null,
        start_time: null,
        end_time: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null optional text fields", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        via: null,
        note: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null store_name and company_name", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        store_name: null,
        company_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing UUID", () => {
    const { candidate_working_hour_uuid: _, ...rest } = validItem;
    expect(workLogItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for total_time", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        total_time: "480",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      workLogItemOutputSchema.safeParse({
        ...validItem,
        status: "active",
      }).success,
    ).toBe(false);
  });
});

describe("workLogDetailOutputSchema", () => {
  const validDetail = {
    candidate_working_hour_uuid: "wl_abc-123",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T08:00:00"),
    end_time: new Date("2026-06-15T16:00:00"),
    total_time: 480,
    status: 1,
    via: "web",
    note: "Worked on project X",
    store_name: null,
    company_name: null,
    created_at: null,
    updated_at: null,
    start_location_lat: null,
    start_location_long: null,
    end_location_lat: null,
    end_location_long: null,
    store_location: null,
  };

  it("accepts a valid work log detail with all fields", () => {
    expect(workLogDetailOutputSchema.safeParse(validDetail).success).toBe(
      true,
    );
  });

  it("accepts numeric location coordinates", () => {
    expect(
      workLogDetailOutputSchema.safeParse({
        ...validDetail,
        start_location_lat: 29.3759,
        start_location_long: 47.9774,
      }).success,
    ).toBe(true);
  });

  it("rejects missing location fields", () => {
    const { start_location_lat: _, start_location_long: _2, end_location_lat: _3, end_location_long: _4, store_location: _5, ...rest } = validDetail;
    expect(workLogDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for coordinates", () => {
    expect(
      workLogDetailOutputSchema.safeParse({
        ...validDetail,
        start_location_lat: "29.3759",
      }).success,
    ).toBe(false);
  });
});

describe("listWorkLogsResultOutputSchema", () => {
  const validResult = {
    items: [
      {
        candidate_working_hour_uuid: "wl_abc-123",
        date: new Date("2026-06-15"),
        start_time: new Date("2026-06-15T08:00:00"),
        end_time: new Date("2026-06-15T16:00:00"),
        total_time: 480,
        status: 1,
        via: "web",
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(
      listWorkLogsResultOutputSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listWorkLogsResultOutputSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items field", () => {
    const { items: _, ...rest } = validResult;
    expect(listWorkLogsResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listWorkLogsResultOutputSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });
});

describe("submitWorkLogResultOutputSchema", () => {
  it("accepts success result without workLog", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log submitted successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({
      operation: "error",
      message: "Failed to submit work log",
    });
    expect(r.success).toBe(true);
  });

  it("accepts success result with workLog", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log submitted successfully",
      workLog: {
        candidate_working_hour_uuid: "wl_abc-123",
        date: new Date("2026-06-15"),
        start_time: new Date("2026-06-15T08:00:00"),
        end_time: new Date("2026-06-15T16:00:00"),
        total_time: 480,
        status: 1,
        via: "web",
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      submitWorkLogResultOutputSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    const r = submitWorkLogResultOutputSchema.safeParse({
      operation: "success",
    });
    expect(r.success).toBe(false);
  });
});

describe("updateWorkLogStatusResultOutputSchema", () => {
  it("accepts success result with workLog", () => {
    const r = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log status updated",
      workLog: {
        candidate_working_hour_uuid: "wl_abc-123",
        date: new Date("2026-06-15"),
        start_time: new Date("2026-06-15T08:00:00"),
        end_time: new Date("2026-06-15T16:00:00"),
        total_time: 480,
        status: 1,
        via: "web",
        note: null,
        store_name: null,
        company_name: null,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "error",
      message: "Failed to update",
    });
    expect(r.success).toBe(true);
  });

  it("accepts success result without workLog", () => {
    const r = updateWorkLogStatusResultOutputSchema.safeParse({
      operation: "success",
      message: "Work log status updated",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      updateWorkLogStatusResultOutputSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });
});
