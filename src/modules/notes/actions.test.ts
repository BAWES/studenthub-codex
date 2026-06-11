import { describe, it, expect } from "vitest";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  noteListItemSchema,
  noteDetailSchema,
  listNotesResultSchema,
  noteMutationResultSchema,
  noteDeleteResultSchema,
  type NoteListItem,
  type NoteDetail,
  type ListNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests: listNotesSchema
// ---------------------------------------------------------------------------

describe("listNotesSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listNotesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts all filter params", () => {
    const result = listNotesSchema.safeParse({
      page: 2,
      limit: 50,
      companyId: 7,
      staffId: 3,
      requestUuid: "req_123",
      noteType: "Internal",
      candidateId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listNotesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNotesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listNotesSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });
});

describe("getNoteSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getNoteSchema.safeParse({ uuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getNoteSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createNoteSchema", () => {
  it("accepts valid input", () => {
    const result = createNoteSchema.safeParse({
      noteText: "Test note",
      companyId: 7,
      candidateId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("applies default noteType", () => {
    const result = createNoteSchema.safeParse({ noteText: "Note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("rejects empty noteText", () => {
    const result = createNoteSchema.safeParse({ noteText: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing noteText", () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("requires UUID", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts partial update", () => {
    const result = updateNoteSchema.safeParse({ uuid: "note_abc", noteText: "Updated" });
    expect(result.success).toBe(true);
  });
});

describe("deleteNoteSchema", () => {
  it("requires UUID", () => {
    const result = deleteNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid UUID", () => {
    const result = deleteNoteSchema.safeParse({ uuid: "note_abc" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteListItemSchema
// ---------------------------------------------------------------------------

const validNoteListItem: NoteListItem = {
  note_uuid: "note_abc123",
  note_type: "Internal Note",
  note_text: "Some content",
  company_id: 7,
  candidate_id: 42,
  created_by: 1,
  note_created_datetime: null,
};

describe("noteListItemSchema", () => {
  it("accepts a valid note list item", () => {
    const result = noteListItemSchema.parse(validNoteListItem);
    expect(result.note_uuid).toBe("note_abc123");
  });

  it("rejects missing required field", () => {
    const { note_uuid, ...rest } = validNoteListItem;
    expect(() => noteListItemSchema.parse(rest)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteDetailSchema
// ---------------------------------------------------------------------------

const validNoteDetail: NoteDetail = {
  note_uuid: "note_abc123",
  note_type: "Internal Note",
  note_text: "Detailed content",
  company_id: 7,
  candidate_id: 42,
  created_by: 1,
  note_created_datetime: null,
  note_updated_datetime: null,
  updated_by: null,
  request_uuid: "req_abc",
  story_uuid: null,
};

describe("noteDetailSchema", () => {
  it("accepts a valid note detail", () => {
    const result = noteDetailSchema.parse(validNoteDetail);
    expect(result.request_uuid).toBe("req_abc");
  });

  it("includes all list item fields plus extras", () => {
    const result = noteDetailSchema.parse(validNoteDetail);
    expect(result.note_updated_datetime).toBeDefined();
    expect(result.updated_by).toBeDefined();
    expect(result.story_uuid).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listNotesResultSchema
// ---------------------------------------------------------------------------

describe("listNotesResultSchema", () => {
  it("accepts a valid result", () => {
    const result = listNotesResultSchema.parse({
      notes: [validNoteListItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.notes).toHaveLength(1);
  });

  it("accepts empty list", () => {
    const result = listNotesResultSchema.parse({
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.notes).toHaveLength(0);
  });

  it("rejects negative total", () => {
    expect(() =>
      listNotesResultSchema.parse({
        notes: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteMutationResultSchema
// ---------------------------------------------------------------------------

describe("noteMutationResultSchema", () => {
  it("accepts success with note", () => {
    const result = noteMutationResultSchema.parse({
      operation: "success",
      message: "Created",
      note: validNoteDetail,
    });
    expect(result.operation).toBe("success");
  });

  it("accepts success without note", () => {
    const result = noteMutationResultSchema.parse({
      operation: "success",
      message: "Updated",
    });
    expect(result.message).toBe("Updated");
  });

  it("accepts error result", () => {
    const result = noteMutationResultSchema.parse({
      operation: "error",
      message: "Not found",
    });
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteDeleteResultSchema
// ---------------------------------------------------------------------------

describe("noteDeleteResultSchema", () => {
  it("accepts delete result", () => {
    const result = noteDeleteResultSchema.parse({
      operation: "success",
      message: "Deleted",
    });
    expect(result.operation).toBe("success");
  });
});
