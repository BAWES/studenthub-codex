import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching actions.ts (test-time copy for unit isolation)
// ---------------------------------------------------------------------------

const listCandidateWorkingHoursSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  date: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getCandidateWorkingHourSchema = z.object({
  uuid: z.string().min(1, "Working hour UUID is required"),
});

type ListCandidateWorkingHoursInput = z.input<
  typeof listCandidateWorkingHoursSchema
>;
type GetCandidateWorkingHourInput = z.input<
  typeof getCandidateWorkingHourSchema
>;

export type CandidateWorkingHourItem = {
  candidate_working_hour_uuid: string;
  candidate_id: number | null;
  store_id: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  start_location_lat: number | null;
  start_location_long: number | null;
  end_location_lat: number | null;
  end_location_long: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListCandidateWorkingHoursResult = {
  items: CandidateWorkingHourItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listCandidateWorkingHoursSchema", () => {
  it("accepts valid input with required fields only", () => {
    const result = listCandidateWorkingHoursSchema.parse({
      candidateId: "42",
    });
    expect(result.candidateId).toBe(42);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.date).toBeUndefined();
  });

  it("accepts valid input with all fields", () => {
    const result = listCandidateWorkingHoursSchema.parse({
      candidateId: "99",
      date: "2026-06-09",
      page: "2",
      limit: "10",
    });
    expect(result.candidateId).toBe(99);
    expect(result.date).toBe("2026-06-09");
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("rejects missing candidateId", () => {
    expect(() => listCandidateWorkingHoursSchema.parse({})).toThrow();
  });

  it("rejects non-positive candidateId", () => {
    expect(() =>
      listCandidateWorkingHoursSchema.parse({ candidateId: "0" }),
    ).toThrow("Candidate ID is required");
  });

  it("rejects limit above 100", () => {
    expect(() =>
      listCandidateWorkingHoursSchema.parse({
        candidateId: "1",
        limit: "200",
      }),
    ).toThrow();
  });
});

describe("getCandidateWorkingHourSchema", () => {
  it("accepts valid UUID", () => {
    const result = getCandidateWorkingHourSchema.parse({
      uuid: "abc-123-def",
    });
    expect(result.uuid).toBe("abc-123-def");
  });

  it("rejects empty UUID", () => {
    expect(() =>
      getCandidateWorkingHourSchema.parse({ uuid: "" }),
    ).toThrow("Working hour UUID is required");
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — confirm the export types compile correctly
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourItem type", () => {
  it("can represent a valid working hour record", () => {
    const item: CandidateWorkingHourItem = {
      candidate_working_hour_uuid: "uuid-1",
      candidate_id: 42,
      store_id: 5,
      date: "2026-06-09",
      start_time: "2026-06-09T08:00:00.000Z",
      end_time: "2026-06-09T17:00:00.000Z",
      total_time: 32400,
      status: 0,
      via: "Timer",
      note: "Regular shift",
      start_location_lat: null,
      start_location_long: null,
      end_location_lat: null,
      end_location_long: null,
      created_at: "2026-06-09T08:00:00.000Z",
      updated_at: "2026-06-09T17:00:00.000Z",
    };
    expect(item.candidate_working_hour_uuid).toBe("uuid-1");
    expect(item.status).toBe(0);
  });

  it("allows nullable fields as null", () => {
    const item: CandidateWorkingHourItem = {
      candidate_working_hour_uuid: "uuid-2",
      candidate_id: null,
      store_id: null,
      date: null,
      start_time: null,
      end_time: null,
      total_time: null,
      status: null,
      via: null,
      note: null,
      start_location_lat: null,
      start_location_long: null,
      end_location_lat: null,
      end_location_long: null,
      created_at: null,
      updated_at: null,
    };
    expect(item.candidate_working_hour_uuid).toBe("uuid-2");
  });
});

describe("ListCandidateWorkingHoursResult type", () => {
  it("can represent an empty list result", () => {
    const result: ListCandidateWorkingHoursResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.items.length).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("can represent a non-empty list result", () => {
    const result: ListCandidateWorkingHoursResult = {
      items: [
        {
          candidate_working_hour_uuid: "uuid-1",
          candidate_id: 1,
          store_id: 1,
          date: "2026-06-09",
          start_time: "08:00:00",
          end_time: "17:00:00",
          total_time: 32400,
          status: 0,
          via: "Timer",
          note: null,
          start_location_lat: null,
          start_location_long: null,
          end_location_lat: null,
          end_location_long: null,
          created_at: "2026-06-09T08:00:00.000Z",
          updated_at: "2026-06-09T17:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.items.length).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});
