import { describe, it, expect } from "vitest";
import {
  appealRowSchema,
  appealUpdateRowSchema,
  actionResultSchema,
  appealsPaginatedResultSchema,
  appealUpdatesPaginatedResultSchema,
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
  listAppealsResultSchema,
  getAppealResultSchema,
  createAppealResultSchema,
  updateAppealStatusResultSchema,
  listAppealUpdatesResultSchema,
  createAppealUpdateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// appealRowSchema
// ---------------------------------------------------------------------------
describe("appealRowSchema", () => {
  const valid = {
    appealUuid: "uuid-1",
    worklogUuid: "uuid-2",
    candidateId: 42,
    reason: "Late clock-in on Monday",
    status: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: null,
  };

  it("accepts a valid appeal row", () => {
    expect(appealRowSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable reason", () => {
    expect(
      appealRowSchema.safeParse({ ...valid, reason: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updatedAt", () => {
    expect(
      appealRowSchema.safeParse({ ...valid, updatedAt: "2026-06-01T00:00:00Z" }).success,
    ).toBe(true);
  });

  it("rejects missing appealUuid", () => {
    const { appealUuid: _, ...rest } = valid;
    expect(appealRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing worklogUuid", () => {
    const { worklogUuid: _, ...rest } = valid;
    expect(appealRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = valid;
    expect(appealRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid;
    expect(appealRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = valid;
    expect(appealRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      appealRowSchema.safeParse({ ...valid, candidateId: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      appealRowSchema.safeParse({ ...valid, status: "pending" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealUpdateRowSchema
// ---------------------------------------------------------------------------
describe("appealUpdateRowSchema", () => {
  const valid = {
    appealUpdateUuid: "uuid-1",
    appealUuid: "uuid-2",
    update: "Manager reviewed the case",
    detail: "Approved after manager review",
    createdBy: 10,
    isNew: true,
    createdAt: "2026-01-01T00:00:00Z",
  };

  it("accepts a valid appeal update row", () => {
    expect(appealUpdateRowSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable update", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, update: null }).success,
    ).toBe(true);
  });

  it("accepts nullable detail", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, detail: null }).success,
    ).toBe(true);
  });

  it("accepts nullable createdBy", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, createdBy: null }).success,
    ).toBe(true);
  });

  it("accepts nullable isNew", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, isNew: null }).success,
    ).toBe(true);
  });

  it("rejects missing appealUpdateUuid", () => {
    const { appealUpdateUuid: _, ...rest } = valid;
    expect(appealUpdateRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing appealUuid", () => {
    const { appealUuid: _, ...rest } = valid;
    expect(appealUpdateRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = valid;
    expect(appealUpdateRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for isNew", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, isNew: "true" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for createdBy", () => {
    expect(
      appealUpdateRowSchema.safeParse({ ...valid, createdBy: "admin" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResultSchema
// ---------------------------------------------------------------------------
describe("actionResultSchema", () => {
  const valid = {
    success: true,
    error: "Something went wrong",
  };

  it("accepts a valid action result", () => {
    expect(actionResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional error", () => {
    const { error: _, ...rest } = valid;
    expect(actionResultSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing success", () => {
    const { success: _, ...rest } = valid;
    expect(actionResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      actionResultSchema.safeParse({ ...valid, success: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error", () => {
    expect(
      actionResultSchema.safeParse({ ...valid, error: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealsPaginatedResultSchema
// ---------------------------------------------------------------------------
describe("appealsPaginatedResultSchema", () => {
  const valid = {
    items: [
      {
        appealUuid: "uuid-1",
        worklogUuid: "uuid-2",
        candidateId: 42,
        reason: "Late clock-in",
        status: 0,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(appealsPaginatedResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      appealsPaginatedResultSchema.safeParse({ ...valid, items: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = valid;
    expect(appealsPaginatedResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(appealsPaginatedResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(appealsPaginatedResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array items", () => {
    expect(
      appealsPaginatedResultSchema.safeParse({ ...valid, items: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealUpdatesPaginatedResultSchema
// ---------------------------------------------------------------------------
describe("appealUpdatesPaginatedResultSchema", () => {
  const valid = {
    items: [
      {
        appealUpdateUuid: "uuid-1",
        appealUuid: "uuid-2",
        update: "Reviewed",
        detail: "Additional info",
        createdBy: 10,
        isNew: false,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(appealUpdatesPaginatedResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items", () => {
    expect(
      appealUpdatesPaginatedResultSchema.safeParse({
        ...valid,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = valid;
    expect(appealUpdatesPaginatedResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealsResultSchema  (union)
// ---------------------------------------------------------------------------
describe("listAppealsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    expect(
      listAppealsResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts an error result", () => {
    expect(
      listAppealsResultSchema.safeParse({ error: "Database error" }).success,
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(listAppealsResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAppealResultSchema
// ---------------------------------------------------------------------------
describe("getAppealResultSchema", () => {
  it("accepts a valid appeal", () => {
    expect(
      getAppealResultSchema.safeParse({
        appeal: {
          appealUuid: "uuid-1",
          worklogUuid: "uuid-2",
          candidateId: 42,
          reason: null,
          status: 0,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts nullable appeal", () => {
    expect(
      getAppealResultSchema.safeParse({ appeal: null }).success,
    ).toBe(true);
  });

  it("accepts optional error", () => {
    expect(
      getAppealResultSchema.safeParse({ appeal: null, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects missing appeal field", () => {
    expect(getAppealResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealResultSchema
// ---------------------------------------------------------------------------
describe("createAppealResultSchema", () => {
  const valid = {
    success: true,
    appealUuid: "uuid-new",
  };

  it("accepts a valid create result", () => {
    expect(createAppealResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional appealUuid", () => {
    const { appealUuid: _, ...rest } = valid;
    expect(createAppealResultSchema.safeParse(rest).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      createAppealResultSchema.safeParse({ success: false, error: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    const { success: _, ...rest } = valid;
    expect(createAppealResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      createAppealResultSchema.safeParse({ ...valid, success: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for appealUuid", () => {
    expect(
      createAppealResultSchema.safeParse({ ...valid, appealUuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateAppealStatusResultSchema
// ---------------------------------------------------------------------------
describe("updateAppealStatusResultSchema", () => {
  it("accepts a valid update result", () => {
    expect(
      updateAppealStatusResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      updateAppealStatusResultSchema.safeParse({ success: false, error: "Cannot reject" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(
      updateAppealStatusResultSchema.safeParse({}).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealUpdatesResultSchema  (union)
// ---------------------------------------------------------------------------
describe("listAppealUpdatesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    expect(
      listAppealUpdatesResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts an error result", () => {
    expect(
      listAppealUpdatesResultSchema.safeParse({ error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(listAppealUpdatesResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealUpdateResultSchema
// ---------------------------------------------------------------------------
describe("createAppealUpdateResultSchema", () => {
  const valid = {
    success: true,
    appealUpdateUuid: "uuid-new-update",
  };

  it("accepts a valid result", () => {
    expect(createAppealUpdateResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional appealUpdateUuid", () => {
    const { appealUpdateUuid: _, ...rest } = valid;
    expect(createAppealUpdateResultSchema.safeParse(rest).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      createAppealUpdateResultSchema.safeParse({ success: false, error: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    const { success: _, ...rest } = valid;
    expect(createAppealUpdateResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for appealUpdateUuid", () => {
    expect(
      createAppealUpdateResultSchema.safeParse({ ...valid, appealUpdateUuid: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealsSchema  (input)
// ---------------------------------------------------------------------------
describe("listAppealsSchema", () => {
  it("accepts empty params (all optional with defaults)", () => {
    const result = listAppealsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listAppealsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts status filter", () => {
    const result = listAppealsSchema.safeParse({ status: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts startDate and endDate", () => {
    const result = listAppealsSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts page and limit", () => {
    const result = listAppealsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects negative candidateId", () => {
    const result = listAppealsSchema.safeParse({ candidateId: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range limit (>100)", () => {
    const result = listAppealsSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = listAppealsSchema.safeParse({ startDate: "01-01-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listAppealsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAppealSchema  (input)
// ---------------------------------------------------------------------------
describe("getAppealSchema", () => {
  it("accepts a valid appeal UUID", () => {
    const result = getAppealSchema.safeParse({ appealUuid: "appeal_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appealUuid).toBe("appeal_abc123");
    }
  });

  it("rejects missing appealUuid", () => {
    const result = getAppealSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    const result = getAppealSchema.safeParse({ appealUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    const result = getAppealSchema.safeParse({ appealUuid: 123 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealSchema  (input)
// ---------------------------------------------------------------------------
describe("createAppealSchema", () => {
  const valid = {
    worklogUuid: "worklog_abc123",
    reason: "Late clock-in on Monday morning by 15 minutes",
  };

  it("accepts a valid create appeal payload", () => {
    const result = createAppealSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects missing worklogUuid", () => {
    const { worklogUuid: _, ...rest } = valid;
    expect(createAppealSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty worklogUuid", () => {
    expect(
      createAppealSchema.safeParse({ ...valid, worklogUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing reason", () => {
    const { reason: _, ...rest } = valid;
    expect(createAppealSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects reason shorter than 10 characters", () => {
    expect(
      createAppealSchema.safeParse({ ...valid, reason: "Short" }).success,
    ).toBe(false);
  });

  it("rejects reason longer than 1000 characters", () => {
    expect(
      createAppealSchema.safeParse({ ...valid, reason: "x".repeat(1001) }).success,
    ).toBe(false);
  });

  it("rejects non-string worklogUuid", () => {
    expect(
      createAppealSchema.safeParse({ ...valid, worklogUuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string reason", () => {
    expect(
      createAppealSchema.safeParse({ ...valid, reason: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateAppealStatusSchema  (input)
// ---------------------------------------------------------------------------
describe("updateAppealStatusSchema", () => {
  const valid = {
    appealUuid: "appeal_abc123",
    resolution: "approve",
  };

  it("accepts valid approve resolution", () => {
    const result = updateAppealStatusSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts valid reject resolution", () => {
    const result = updateAppealStatusSchema.safeParse({
      ...valid,
      resolution: "reject",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional note", () => {
    const result = updateAppealStatusSchema.safeParse({
      ...valid,
      note: "Approved after manager review",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe("Approved after manager review");
    }
  });

  it("rejects missing appealUuid", () => {
    const { appealUuid: _, ...rest } = valid;
    expect(updateAppealStatusSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    expect(
      updateAppealStatusSchema.safeParse({ ...valid, appealUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid resolution", () => {
    expect(
      updateAppealStatusSchema.safeParse({ ...valid, resolution: "maybe" }).success,
    ).toBe(false);
  });

  it("rejects missing resolution", () => {
    const { resolution: _, ...rest } = valid;
    expect(updateAppealStatusSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    expect(
      updateAppealStatusSchema.safeParse({ ...valid, appealUuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string note", () => {
    expect(
      updateAppealStatusSchema.safeParse({ ...valid, note: 456 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealUpdatesSchema  (input)
// ---------------------------------------------------------------------------
describe("listAppealUpdatesSchema", () => {
  it("accepts valid appealUuid with defaults", () => {
    const result = listAppealUpdatesSchema.safeParse({ appealUuid: "appeal_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appealUuid).toBe("appeal_abc123");
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const result = listAppealUpdatesSchema.safeParse({
      appealUuid: "appeal_abc123",
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects missing appealUuid", () => {
    const result = listAppealUpdatesSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    const result = listAppealUpdatesSchema.safeParse({ appealUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    const result = listAppealUpdatesSchema.safeParse({ appealUuid: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range limit (>100)", () => {
    const result = listAppealUpdatesSchema.safeParse({
      appealUuid: "appeal_abc123",
      limit: "200",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealUpdateSchema  (input)
// ---------------------------------------------------------------------------
describe("createAppealUpdateSchema", () => {
  const valid = {
    appealUuid: "appeal_abc123",
    update: "Manager has reviewed the appeal",
  };

  it("accepts a valid create appeal update payload", () => {
    const result = createAppealUpdateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts optional detail", () => {
    const result = createAppealUpdateSchema.safeParse({
      ...valid,
      detail: "Full case notes here",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.detail).toBe("Full case notes here");
    }
  });

  it("rejects missing appealUuid", () => {
    const { appealUuid: _, ...rest } = valid;
    expect(createAppealUpdateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty appealUuid", () => {
    expect(
      createAppealUpdateSchema.safeParse({ ...valid, appealUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing update", () => {
    const { update: _, ...rest } = valid;
    expect(createAppealUpdateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty update", () => {
    expect(
      createAppealUpdateSchema.safeParse({ ...valid, update: "" }).success,
    ).toBe(false);
  });

  it("rejects non-string appealUuid", () => {
    expect(
      createAppealUpdateSchema.safeParse({ ...valid, appealUuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string update", () => {
    expect(
      createAppealUpdateSchema.safeParse({ ...valid, update: 456 }).success,
    ).toBe(false);
  });

  it("rejects non-string detail", () => {
    expect(
      createAppealUpdateSchema.safeParse({ ...valid, detail: true }).success,
    ).toBe(false);
  });
});
