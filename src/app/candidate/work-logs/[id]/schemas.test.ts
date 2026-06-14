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

describe("getCandidateWorkLogDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getCandidateWorkLogDetailSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getCandidateWorkLogDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(getCandidateWorkLogDetailSchema.safeParse({ workLogUuid: "" }).success).toBe(false);
  });

  it("rejects non-string workLogUuid", () => {
    expect(getCandidateWorkLogDetailSchema.safeParse({ workLogUuid: 123 }).success).toBe(false);
  });
});

describe("approveWorkLogAppealSchema", () => {
  it("accepts valid input", () => {
    expect(
      approveWorkLogAppealSchema.safeParse({ appealUuid: "appeal-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(approveWorkLogAppealSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    expect(approveWorkLogAppealSchema.safeParse({ appealUuid: "" }).success).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    expect(approveWorkLogAppealSchema.safeParse({ appealUuid: 123 }).success).toBe(false);
  });
});

describe("rejectWorkLogAppealSchema", () => {
  it("accepts valid input", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({
        appealUuid: "appeal-001",
        reason: "Insufficient evidence",
      }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(rejectWorkLogAppealSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing appealUuid", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ reason: "Insufficient evidence" }).success
    ).toBe(false);
  });

  it("rejects missing reason", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ appealUuid: "appeal-001" }).success
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ appealUuid: "appeal-001", reason: "" }).success
    ).toBe(false);
  });

  it("rejects reason exceeding 1000 characters", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({
        appealUuid: "appeal-001",
        reason: "A".repeat(1001),
      }).success
    ).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    expect(
      rejectWorkLogAppealSchema.safeParse({ appealUuid: 123, reason: "Test reason" }).success
    ).toBe(false);
  });
});

describe("updateWorkLogSchema", () => {
  it("accepts valid input with required fields only", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: 1 }).success
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateWorkLogSchema.safeParse({
        workLogUuid: "wl-001",
        status: 1,
        note: "Updated note",
      }).success
    ).toBe(true);
  });

  it("accepts string-coercible status", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: "1" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateWorkLogSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing workLogUuid", () => {
    expect(updateWorkLogSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateWorkLogSchema.safeParse({ workLogUuid: "wl-001" }).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "", status: 1 }).success
    ).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: -1 }).success
    ).toBe(false);
  });

  it("rejects note exceeding 1000 characters", () => {
    expect(
      updateWorkLogSchema.safeParse({
        workLogUuid: "wl-001",
        status: 1,
        note: "A".repeat(1001),
      }).success
    ).toBe(false);
  });

  it("rejects non-coercible status", () => {
    expect(
      updateWorkLogSchema.safeParse({ workLogUuid: "wl-001", status: "abc" }).success
    ).toBe(false);
  });
});

describe("deleteWorkLogSchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteWorkLogSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(deleteWorkLogSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(deleteWorkLogSchema.safeParse({ workLogUuid: "" }).success).toBe(false);
  });

  it("rejects non-string workLogUuid", () => {
    expect(deleteWorkLogSchema.safeParse({ workLogUuid: 123 }).success).toBe(false);
  });
});

describe("getWorkLogAppealsSchema", () => {
  it("accepts valid input", () => {
    expect(
      getWorkLogAppealsSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getWorkLogAppealsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(getWorkLogAppealsSchema.safeParse({ workLogUuid: "" }).success).toBe(false);
  });
});

describe("getWorkLogFeedbackSchema", () => {
  it("accepts valid input", () => {
    expect(
      getWorkLogFeedbackSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getWorkLogFeedbackSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty workLogUuid", () => {
    expect(getWorkLogFeedbackSchema.safeParse({ workLogUuid: "" }).success).toBe(false);
  });
});

describe("workLogDetailForAppealOutputSchema", () => {
  const now = new Date();
  it("accepts valid output", () => {
    expect(
      workLogDetailForAppealOutputSchema.safeParse({
        candidate_working_hour_uuid: "wl-001",
        date: now,
        start_time: now,
        end_time: now,
        total_time: 8,
        status: 1,
        via: "mobile",
        note: "Test note",
        store_name: "Store A",
        store_location: "Location A",
        company_name: "Company X",
      }).success
    ).toBe(true);
  });

  it("accepts output with null values", () => {
    expect(
      workLogDetailForAppealOutputSchema.safeParse({
        candidate_working_hour_uuid: "wl-001",
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
      }).success
    ).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    expect(
      workLogDetailForAppealOutputSchema.safeParse({
        date: new Date(),
        start_time: new Date(),
        end_time: null,
        total_time: null,
        status: null,
        via: null,
        note: null,
        store_name: null,
        store_location: null,
        company_name: null,
      }).success
    ).toBe(false);
  });
});

describe("workLogAppealRowOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      workLogAppealRowOutputSchema.safeParse({
        appeal_uuid: "appeal-001",
        reason: "Late clock-in",
        status: 0,
        created_at: new Date(),
      }).success
    ).toBe(true);
  });

  it("accepts null status and reason", () => {
    expect(
      workLogAppealRowOutputSchema.safeParse({
        appeal_uuid: "appeal-001",
        reason: null,
        status: null,
        created_at: null,
      }).success
    ).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    expect(
      workLogAppealRowOutputSchema.safeParse({ reason: null, status: null, created_at: null }).success
    ).toBe(false);
  });
});

describe("workLogFeedbackRowOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse({
        cwlf_uuid: "feedback-001",
        note: "Good work",
        reason: null,
        status: 1,
        rating: true,
        created_at: new Date(),
      }).success
    ).toBe(true);
  });

  it("accepts null values", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse({
        cwlf_uuid: "feedback-001",
        note: null,
        reason: null,
        status: null,
        rating: null,
        created_at: null,
      }).success
    ).toBe(true);
  });

  it("rejects missing cwlf_uuid", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse({
        note: null,
        reason: null,
        status: null,
        rating: null,
        created_at: null,
      }).success
    ).toBe(false);
  });

  it("rejects non-boolean rating", () => {
    expect(
      workLogFeedbackRowOutputSchema.safeParse({
        cwlf_uuid: "feedback-001",
        note: null,
        reason: null,
        status: null,
        rating: "yes",
        created_at: null,
      }).success
    ).toBe(false);
  });
});

describe("workLogActionOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      workLogActionOutputSchema.safeParse({ appeal_uuid: "appeal-001" }).success
    ).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    expect(workLogActionOutputSchema.safeParse({}).success).toBe(false);
  });
});

describe("workLogUpdateOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      workLogUpdateOutputSchema.safeParse({ workLogUuid: "wl-001" }).success
    ).toBe(true);
  });

  it("rejects missing workLogUuid", () => {
    expect(workLogUpdateOutputSchema.safeParse({}).success).toBe(false);
  });
});
