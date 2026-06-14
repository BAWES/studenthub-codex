import { describe, it, expect } from "vitest";
import {
  getCandidateWorkLogDetailSchema,
  approveWorkLogAppealSchema,
  rejectWorkLogAppealSchema,
  updateWorkLogSchema,
  deleteWorkLogSchema,
  getWorkLogAppealsSchema,
  getWorkLogFeedbackSchema,
  workLogDetailForAppealOutputSchema,
  workLogAppealRowOutputSchema,
  workLogFeedbackRowOutputSchema,
  workLogActionOutputSchema,
  workLogUpdateOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema validation tests — candidate/work-logs/[id]
// ---------------------------------------------------------------------------

describe("getCandidateWorkLogDetailSchema", () => {
  it("accepts a valid work log UUID", () => {
    expect(
      getCandidateWorkLogDetailSchema.safeParse({ workLogUuid: "wl-001" })
        .success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(getCandidateWorkLogDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      getCandidateWorkLogDetailSchema.safeParse({ workLogUuid: "" }).success,
    ).toBe(false);
  });
});

describe("approveWorkLogAppealSchema", () => {
  it("accepts a valid appeal UUID", () => {
    expect(
      approveWorkLogAppealSchema.safeParse({ appealUuid: "appeal-001" }).success,
    ).toBe(true);
  });

  it("rejects missing appealUuid", () => {
    expect(approveWorkLogAppealSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    expect(
      approveWorkLogAppealSchema.safeParse({ appealUuid: "" }).success,
    ).toBe(false);
  });
});

describe("rejectWorkLogAppealSchema", () => {
  it("accepts a valid rejection", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({
        appealUuid: "appeal-001",
        reason: "Insufficient evidence",
      }).success,
    ).toBe(true);
  });

  it("rejects missing appealUuid", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ reason: "No" }).success,
    ).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ appealUuid: "appeal-001" }).success,
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({
        appealUuid: "appeal-001",
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("rejects reason over 1000 characters", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({
        appealUuid: "appeal-001",
        reason: "A".repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe("updateWorkLogSchema", () => {
  it("accepts a valid update", () => {
    expect(
      updateWorkLogSchema.safeParse({
        workLogUuid: "wl-001",
        status: 1,
        note: "Approved",
      }).success,
    ).toBe(true);
  });

  it("accepts update without note", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: 1 })
        .success,
    ).toBe(true);
  });

  it("accepts string status (coerced)", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: "1" })
        .success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(updateWorkLogSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "", status: 1 }).success,
    ).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects note over 1000 characters", () => {
    expect(
      updateWorkLogSchema.safeParse({
        workLogUuid: "wl-001",
        status: 1,
        note: "A".repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe("deleteWorkLogSchema", () => {
  it("accepts a valid work log UUID", () => {
    expect(
      deleteWorkLogSchema.safeParse({ workLogUuid: "wl-001" }).success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(deleteWorkLogSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      deleteWorkLogSchema.safeParse({ workLogUuid: "" }).success,
    ).toBe(false);
  });
});

describe("getWorkLogAppealsSchema", () => {
  it("accepts a valid work log UUID", () => {
    expect(
      getWorkLogAppealsSchema.safeParse({ workLogUuid: "wl-001" }).success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(getWorkLogAppealsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      getWorkLogAppealsSchema.safeParse({ workLogUuid: "" }).success,
    ).toBe(false);
  });
});

describe("getWorkLogFeedbackSchema", () => {
  it("accepts a valid work log UUID", () => {
    expect(
      getWorkLogFeedbackSchema.safeParse({ workLogUuid: "wl-001" }).success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(getWorkLogFeedbackSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      getWorkLogFeedbackSchema.safeParse({ workLogUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests — candidate/work-logs/[id]
// ---------------------------------------------------------------------------

describe("workLogDetailForAppealOutputSchema", () => {
  const validDetail = {
    candidate_working_hour_uuid: "wl-001",
    date: new Date("2026-06-15"),
    start_time: new Date("2026-06-15T09:00:00"),
    end_time: new Date("2026-06-15T17:00:00"),
    total_time: 8,
    status: 1,
    via: "app",
    note: "Good work",
    store_name: "Main Branch",
    store_location: "Kuwait City",
    company_name: "Acme Corp",
  };

  it("accepts a valid detail object", () => {
    expect(
      workLogDetailForAppealOutputSchema.safeParse(validDetail).success,
    ).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    const nullable = {
      ...validDetail,
      date: null,
      start_time: null,
      end_time: null,
      total_time: null,
      status: null,
      via: null,
      note: null,
      store_name: null,
      store_location: null,
      company_name: null,
    };
    expect(
      workLogDetailForAppealOutputSchema.safeParse(nullable).success,
    ).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    const { candidate_working_hour_uuid: _, ...rest } = validDetail;
    expect(workLogDetailForAppealOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });
});

describe("workLogAppealRowOutputSchema", () => {
  const validRow = {
    appeal_uuid: "appeal-001",
    reason: "Late clock-in",
    status: 0,
    created_at: new Date("2026-06-15T10:00:00"),
  };

  it("accepts a valid appeal row", () => {
    expect(workLogAppealRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    expect(
      workLogAppealRowOutputSchema.safeParse({
        ...validRow,
        reason: null,
        status: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    const { appeal_uuid: _, ...rest } = validRow;
    expect(workLogAppealRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("workLogFeedbackRowOutputSchema", () => {
  const validRow = {
    cwlf_uuid: "feedback-001",
    note: "Great work",
    reason: "Punctual",
    status: 1,
    rating: true,
    created_at: new Date("2026-06-15T10:00:00"),
  };

  it("accepts a valid feedback row", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse(validRow).success,
    ).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse({
        ...validRow,
        note: null,
        reason: null,
        status: null,
        rating: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing cwlf_uuid", () => {
    const { cwlf_uuid: _, ...rest } = validRow;
    expect(workLogFeedbackRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("workLogActionOutputSchema", () => {
  it("accepts a valid action result", () => {
    expect(
      workLogActionOutputSchema.safeParse({ appeal_uuid: "appeal-001" }).success,
    ).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    expect(workLogActionOutputSchema.safeParse({}).success).toBe(false);
  });
});

describe("workLogUpdateOutputSchema", () => {
  it("accepts a valid update result", () => {
    expect(
      workLogUpdateOutputSchema.safeParse({ workLogUuid: "wl-001" }).success,
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(workLogUpdateOutputSchema.safeParse({}).success).toBe(false);
  });
});
