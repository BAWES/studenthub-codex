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
// Schema tests — CandidateWorkingHour
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
// Type shape tests — CandidateWorkingHour
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

// ---------------------------------------------------------------------------
// WorkLogFeedback schema tests
// ---------------------------------------------------------------------------

const listWorkLogFeedbackSchema = z.object({
  candidate_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getWorkLogFeedbackSchema = z.object({
  uuid: z.string().min(1, "Work log feedback UUID is required"),
});

type WorkLogFeedbackItem = {
  cwlf_uuid: string;
  candidate_id: number;
  store_id: number;
  company_id: number;
  date: string;
  candidate_working_hour_uuid: string | null;
  status: number | null;
  note: string | null;
  reason: string | null;
  is_public: boolean | null;
  rating: boolean | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListWorkLogFeedbackResult = {
  workLogFeedbacks: WorkLogFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("listWorkLogFeedbackSchema", () => {
  it("accepts empty params (all optional)", () => {
    const result = listWorkLogFeedbackSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.candidate_id).toBeUndefined();
  });

  it("accepts valid input with all fields", () => {
    const result = listWorkLogFeedbackSchema.parse({
      candidate_id: "42",
      status: "1",
      date_from: "2026-06-01",
      date_to: "2026-06-09",
      page: "2",
      limit: "10",
    });
    expect(result.candidate_id).toBe(42);
    expect(result.status).toBe(1);
    expect(result.date_from).toBe("2026-06-01");
    expect(result.date_to).toBe("2026-06-09");
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("rejects invalid date format", () => {
    expect(() =>
      listWorkLogFeedbackSchema.parse({ date_from: "01-06-2026" }),
    ).toThrow();
  });

  it("rejects status above max value", () => {
    expect(() =>
      listWorkLogFeedbackSchema.parse({ status: "5" }),
    ).toThrow();
  });

  it("rejects limit above 100", () => {
    expect(() =>
      listWorkLogFeedbackSchema.parse({ limit: "200" }),
    ).toThrow();
  });
});

describe("getWorkLogFeedbackSchema", () => {
  it("accepts valid UUID", () => {
    const result = getWorkLogFeedbackSchema.parse({
      uuid: "cwlf-abc-123",
    });
    expect(result.uuid).toBe("cwlf-abc-123");
  });

  it("rejects empty UUID", () => {
    expect(() =>
      getWorkLogFeedbackSchema.parse({ uuid: "" }),
    ).toThrow("Work log feedback UUID is required");
  });
});

describe("WorkLogFeedbackItem type", () => {
  it("can represent a valid feedback record", () => {
    const item: WorkLogFeedbackItem = {
      cwlf_uuid: "cwlf-uuid-1",
      candidate_id: 42,
      store_id: 5,
      company_id: 1,
      date: "2026-06-09",
      candidate_working_hour_uuid: "wh-uuid-1",
      status: 1,
      note: "Good work",
      reason: null,
      is_public: true,
      rating: true,
      created_by: "staff:1",
      created_at: "2026-06-09T08:00:00.000Z",
      updated_at: "2026-06-09T08:00:00.000Z",
    };
    expect(item.cwlf_uuid).toBe("cwlf-uuid-1");
    expect(item.status).toBe(1);
  });
});

describe("ListWorkLogFeedbackResult type", () => {
  it("can represent an empty list result", () => {
    const result: ListWorkLogFeedbackResult = {
      workLogFeedbacks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.workLogFeedbacks.length).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("can represent a non-empty list result", () => {
    const result: ListWorkLogFeedbackResult = {
      workLogFeedbacks: [
        {
          cwlf_uuid: "cwlf-uuid-1",
          candidate_id: 1,
          store_id: 1,
          company_id: 1,
          date: "2026-06-09",
          candidate_working_hour_uuid: null,
          status: 1,
          note: "Great work",
          reason: null,
          is_public: true,
          rating: true,
          created_by: "staff:1",
          created_at: "2026-06-09T08:00:00.000Z",
          updated_at: "2026-06-09T08:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.workLogFeedbacks.length).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});
