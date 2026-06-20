import { describe, it, expect } from "vitest";
import {
  workingDateStatusLabel,
  WORKING_DATE_STATUS_LABELS,
} from "../working-date-helpers";
import type {
  WorkingDateRow,
  WorkingDateDetail,
} from "../working-date-helpers";

// ---------------------------------------------------------------------------
// Pure logic tests for candidate working date functions
// ---------------------------------------------------------------------------

describe("workingDateStatusLabel", () => {
  it('returns "Pending" for status 0', () => {
    expect(workingDateStatusLabel(0)).toBe("Pending");
  });

  it('returns "Confirmed" for status 1', () => {
    expect(workingDateStatusLabel(1)).toBe("Confirmed");
  });

  it('returns "Cancelled" for status 2', () => {
    expect(workingDateStatusLabel(2)).toBe("Cancelled");
  });

  it('returns "Completed" for status 3', () => {
    expect(workingDateStatusLabel(3)).toBe("Completed");
  });

  it('returns "Unknown" for null status', () => {
    expect(workingDateStatusLabel(null)).toBe("Unknown");
  });

  it('returns "Status N" for unrecognized status code', () => {
    expect(workingDateStatusLabel(99)).toBe("Status 99");
  });

  it("handles all known statuses without throwing", () => {
    const known = [0, 1, 2, 3];
    for (const s of known) {
      expect(() => workingDateStatusLabel(s)).not.toThrow();
    }
  });
});

describe("WorkingDateRow type shape", () => {
  it("has all required fields as strings", () => {
    const row: WorkingDateRow = {
      id: "cwd_uuid_123",
      date: "2026-06-10",
      store: "Store A",
      company: "Company X",
      startTime: "08:00",
      endTime: "17:00",
      totalTime: "480 min",
      status: "Confirmed",
    };
    expect(row.id).toBe("cwd_uuid_123");
    expect(row.date).toBe("2026-06-10");
    expect(row.store).toBe("Store A");
    expect(row.company).toBe("Company X");
    expect(row.startTime).toBe("08:00");
    expect(row.endTime).toBe("17:00");
    expect(row.totalTime).toBe("480 min");
    expect(row.status).toBe("Confirmed");
  });

  it("accepts missing store as 'No store'", () => {
    const row: WorkingDateRow = {
      id: "cwd_uuid_456",
      date: "2026-06-11",
      store: "No store",
      company: "No company",
      startTime: "09:00",
      endTime: "18:00",
      totalTime: "—",
      status: "Pending",
    };
    expect(row.store).toBe("No store");
    expect(row.company).toBe("No company");
    expect(row.totalTime).toBe("—");
  });
});

describe("WorkingDateDetail type shape", () => {
  it("has all required fields with correct types", () => {
    const now = new Date("2026-06-10T08:00:00Z");
    const detail: WorkingDateDetail = {
      cwd_uuid: "cwd_uuid_789",
      date: now,
      start_time: now,
      end_time: null,
      total_time: null,
      status: 0,
      store: {
        store_name: "Store B",
        company: { company_name: "Company Y" },
      },
      created_at: now,
      updated_at: now,
    };
    expect(detail.cwd_uuid).toBe("cwd_uuid_789");
    expect(detail.date).toBeInstanceOf(Date);
    expect(detail.total_time).toBeNull();
    expect(detail.end_time).toBeNull();
    expect(detail.status).toBe(0);
    expect(detail.store?.store_name).toBe("Store B");
    expect(detail.store?.company?.company_name).toBe("Company Y");
  });
});
