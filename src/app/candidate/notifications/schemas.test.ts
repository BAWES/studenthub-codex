import { describe, it, expect } from "vitest";
import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  dismissNotificationSchema,
  updateNotificationSchema,
  notificationRowSchema,
  notificationRowArraySchema,
  notificationDetailSchema,
  dismissResultSchema,
  updateResultSchema,
  actionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateNotificationRowsSchema
// ---------------------------------------------------------------------------
describe("getCandidateNotificationRowsSchema", () => {
  it("accepts empty input with default limit", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit limit", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 50 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateNotificationDetailSchema
// ---------------------------------------------------------------------------
describe("getCandidateNotificationDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getCandidateNotificationDetailSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({ notificationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dismissNotificationSchema
// ---------------------------------------------------------------------------
describe("dismissNotificationSchema", () => {
  it("accepts valid input", () => {
    expect(
      dismissNotificationSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(dismissNotificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(dismissNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(dismissNotificationSchema.safeParse({ notificationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateNotificationSchema
// ---------------------------------------------------------------------------
describe("updateNotificationSchema", () => {
  it("accepts valid input with isNew", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "uuid-12345", isNew: true }).success,
    ).toBe(true);
  });

  it("accepts valid input without isNew", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(updateNotificationSchema.safeParse({ isNew: true }).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "", isNew: false }).success,
    ).toBe(false);
  });

  it("rejects non-boolean isNew", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "uuid-1", isNew: "true" }).success,
    ).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: 123, isNew: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationRowSchema (output)
// ---------------------------------------------------------------------------
describe("notificationRowSchema", () => {
  const validRow = {
    id: "notif-1",
    type: "invitation",
    typeCode: 1,
    message: "You have a new invitation",
    isNew: "true",
    created: "2024-01-01T00:00:00Z",
  };

  it("accepts a valid row", () => {
    expect(notificationRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(notificationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validRow;
    expect(notificationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing typeCode", () => {
    const { typeCode: _, ...rest } = validRow;
    expect(notificationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number typeCode", () => {
    expect(
      notificationRowSchema.safeParse({ ...validRow, typeCode: "one" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationRowArraySchema (output)
// ---------------------------------------------------------------------------
describe("notificationRowArraySchema", () => {
  const validRows = [
    {
      id: "notif-1",
      type: "invitation",
      typeCode: 1,
      message: "New invitation",
      isNew: "true",
      created: "2024-01-01T00:00:00Z",
    },
  ];

  it("accepts a valid array", () => {
    expect(notificationRowArraySchema.safeParse(validRows).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(notificationRowArraySchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(notificationRowArraySchema.safeParse({}).success).toBe(false);
  });

  it("rejects array with invalid items", () => {
    expect(
      notificationRowArraySchema.safeParse([{ id: "notif-1" }]).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationDetailSchema (output)
// ---------------------------------------------------------------------------
describe("notificationDetailSchema", () => {
  const validDetail = {
    notification: {
      cn_uuid: "uuid-1",
      type: 1,
      message: "You have a new invitation",
      is_new: true,
      created_at: new Date("2024-01-01"),
      updated_at: null,
      invitation_uuid: null,
      request_uuid: null,
      company_id: null,
      store_id: null,
      staff_id: null,
    },
    typeLabel: "Invitation",
  };

  it("accepts a valid detail", () => {
    expect(notificationDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null notification", () => {
    expect(
      notificationDetailSchema.safeParse({ notification: null, typeLabel: "None" }).success,
    ).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      notificationDetailSchema.safeParse({
        notification: {
          cn_uuid: "uuid-1",
          type: 1,
          message: null,
          is_new: null,
          created_at: null,
          updated_at: null,
          invitation_uuid: null,
          request_uuid: null,
          company_id: null,
          store_id: null,
          staff_id: null,
        },
        typeLabel: "Invitation",
      }).success,
    ).toBe(true);
  });

  it("rejects missing notification", () => {
    const { notification: _, ...rest } = validDetail;
    expect(notificationDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing typeLabel", () => {
    const { typeLabel: _, ...rest } = validDetail;
    expect(notificationDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing cn_uuid", () => {
    const { cn_uuid: _, ...notifRest } = validDetail.notification!;
    expect(
      notificationDetailSchema.safeParse({ ...validDetail, notification: notifRest }).success,
    ).toBe(false);
  });

  it("rejects non-date created_at", () => {
    expect(
      notificationDetailSchema.safeParse({
        ...validDetail,
        notification: { ...validDetail.notification!, created_at: "2024-01-01" },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dismissResultSchema (output)
// ---------------------------------------------------------------------------
describe("dismissResultSchema", () => {
  it("accepts success result", () => {
    expect(dismissResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      dismissResultSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("accepts success without error", () => {
    expect(dismissResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(dismissResultSchema.safeParse({ error: "Oops" }).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(dismissResultSchema.safeParse({ success: "true" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateResultSchema (output)
// ---------------------------------------------------------------------------
describe("updateResultSchema", () => {
  it("accepts success result", () => {
    expect(updateResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      updateResultSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(updateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(updateResultSchema.safeParse({ success: "false" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResponseSchema (output)
// ---------------------------------------------------------------------------
describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      actionResponseSchema.safeParse({ success: false, error: "Something went wrong" }).success,
    ).toBe(true);
  });

  it("rejects missing success key", () => {
    expect(actionResponseSchema.safeParse({ error: "Oops" }).success).toBe(false);
  });

  it("rejects error without error string", () => {
    expect(actionResponseSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(actionResponseSchema.safeParse({ success: "true" }).success).toBe(false);
  });
});
