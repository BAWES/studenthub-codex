import { describe, it, expect } from "vitest";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  staffInfoSchema,
  noteItemSchema,
  listNotesResultSchema,
  operationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listNotesSchema
// ---------------------------------------------------------------------------
describe("listNotesSchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(listNotesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      listNotesSchema.safeParse({
        companyId: 1,
        staffId: 42,
        requestUuid: "req-abc",
        storyUuid: "story-xyz",
        type: "general",
        startDate: "2026-06-01",
        endDate: "2026-06-14",
        page: 1,
        limit: 50,
      }).success,
    ).toBe(true);
  });

  it("accepts datetime strings for startDate", () => {
    expect(listNotesSchema.safeParse({ startDate: "2026-06-01T00:00:00+03:00" }).success).toBe(true);
  });

  it("rejects page of 0", () => {
    expect(listNotesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listNotesSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("rejects invalid startDate format", () => {
    expect(listNotesSchema.safeParse({ startDate: "not-a-date" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNoteSchema
// ---------------------------------------------------------------------------
describe("getNoteSchema", () => {
  it("accepts valid id", () => {
    expect(getNoteSchema.safeParse({ id: "note-123" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(getNoteSchema.safeParse({ id: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createNoteSchema
// ---------------------------------------------------------------------------
describe("createNoteSchema", () => {
  const valid = { noteText: "This is a note about the candidate" };

  it("accepts valid create with just noteText", () => {
    expect(createNoteSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional companyId", () => {
    expect(createNoteSchema.safeParse({ ...valid, companyId: 5 }).success).toBe(true);
  });

  it("accepts optional requestUuid", () => {
    expect(createNoteSchema.safeParse({ ...valid, requestUuid: "req-abc" }).success).toBe(true);
  });

  it("accepts optional candidateId", () => {
    expect(createNoteSchema.safeParse({ ...valid, candidateId: 100 }).success).toBe(true);
  });

  it("rejects missing noteText", () => {
    expect(createNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty noteText", () => {
    expect(createNoteSchema.safeParse({ noteText: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateNoteSchema
// ---------------------------------------------------------------------------
describe("updateNoteSchema", () => {
  const valid = { id: "note-123", noteText: "Updated note text" };

  it("accepts valid update", () => {
    expect(updateNoteSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional companyId", () => {
    expect(updateNoteSchema.safeParse({ ...valid, companyId: 3 }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(updateNoteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(updateNoteSchema.safeParse({ ...valid, id: "" }).success).toBe(false);
  });

  it("rejects missing noteText", () => {
    const { noteText: _, ...rest } = valid;
    expect(updateNoteSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// staffInfoSchema
// ---------------------------------------------------------------------------
describe("staffInfoSchema", () => {
  it("accepts valid staff name", () => {
    expect(staffInfoSchema.safeParse({ staff_name: "Ahmed" }).success).toBe(true);
  });

  it("rejects missing staff_name", () => {
    expect(staffInfoSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteItemSchema
// ---------------------------------------------------------------------------
describe("noteItemSchema", () => {
  const valid = {
    note_uuid: "n-001",
    company_id: 1,
    request_uuid: null,
    story_uuid: null,
    note_type: "general",
    note_text: "Some note",
    created_by: 42,
    updated_by: null,
    note_created_datetime: new Date("2026-06-14"),
    note_updated_datetime: null,
    staff_created: null,
    staff_updated: null,
  };

  it("accepts a valid note item", () => {
    expect(noteItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const allNull = {
      ...valid,
      company_id: null,
      request_uuid: null,
      story_uuid: null,
      note_type: null,
      note_text: null,
      created_by: null,
      updated_by: null,
      note_created_datetime: null,
      note_updated_datetime: null,
      staff_created: null,
      staff_updated: null,
    };
    expect(noteItemSchema.safeParse(allNull).success).toBe(true);
  });

  it("accepts staff_created as object", () => {
    expect(noteItemSchema.safeParse({ ...valid, staff_created: { staff_name: "Jane" } }).success).toBe(true);
  });

  it("rejects missing note_uuid", () => {
    const { note_uuid: _, ...rest } = valid;
    expect(noteItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listNotesResultSchema
// ---------------------------------------------------------------------------
describe("listNotesResultSchema", () => {
  const valid = {
    notes: [
      {
        note_uuid: "n-001",
        company_id: null,
        request_uuid: null,
        story_uuid: null,
        note_type: null,
        note_text: null,
        created_by: null,
        updated_by: null,
        note_created_datetime: null,
        note_updated_datetime: null,
        staff_created: null,
        staff_updated: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listNotesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty notes array", () => {
    expect(listNotesResultSchema.safeParse({ ...valid, notes: [], total: 0, totalPages: 0 }).success).toBe(true);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = valid;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listNotesResultSchema.safeParse({ ...valid, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// operationResultSchema
// ---------------------------------------------------------------------------
describe("operationResultSchema", () => {
  it("accepts valid operation result", () => {
    expect(operationResultSchema.safeParse({ operation: "create", message: "Note created" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(operationResultSchema.safeParse({ message: "ok" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(operationResultSchema.safeParse({ operation: "create" }).success).toBe(false);
  });
});
