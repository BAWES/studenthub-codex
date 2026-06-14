import { describe, it, expect } from "vitest";
import {
  appealRowSchema,
  appealUpdateRowSchema,
  actionResultSchema,
  appealsPaginatedResultSchema,
  appealUpdatesPaginatedResultSchema,
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
