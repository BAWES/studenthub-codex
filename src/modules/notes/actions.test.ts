import { describe, it, expect } from "vitest";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  noteListItemSchema,
  noteDetailSchema,
  noteDetailNullableSchema,
  listNotesResultSchema,
  createNoteResultSchema,
  updateNoteResultSchema,
  deleteNoteResultSchema,
  type ListNotesParams,
  type NoteListItem,
  type NoteDetail,
  type ListNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: note schema validation
//
// The note server actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (prisma, session,
// next/cache).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tests: listNotesSchema
// ---------------------------------------------------------------------------

describe("listNotesSchema", () => {
  it("accepts empty params and uses defaults", () => {
    const result = listNotesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listNotesSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts companyId filter", () => {
    const result = listNotesSchema.safeParse({ companyId: 7 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });

  it("accepts requestUuid filter", () => {
    const result = listNotesSchema.safeParse({ requestUuid: "request_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("request_abc123");
    }
  });

  it("accepts noteType filter", () => {
    const result = listNotesSchema.safeParse({ noteType: "Internal Note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("accepts pagination params", () => {
    const result = listNotesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
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

// ---------------------------------------------------------------------------
// Tests: getNoteSchema
// ---------------------------------------------------------------------------

describe("getNoteSchema", () => {
  it("accepts a valid note UUID", () => {
    const result = getNoteSchema.safeParse({ uuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = getNoteSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: createNoteSchema
// ---------------------------------------------------------------------------

describe("createNoteSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createNoteSchema.safeParse({
      candidateId: 42,
      companyId: 7,
      requestUuid: "request_abc123",
      storyUuid: "story_def456",
      noteType: "Internal Note",
      noteText: "This is a note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
      expect(result.data.noteText).toBe("This is a note");
      expect(result.data.storyUuid).toBe("story_def456");
    }
  });

  it("rejects empty params because noteText is required", () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty noteText", () => {
    const result = createNoteSchema.safeParse({ noteText: "" });
    expect(result.success).toBe(false);
  });

  it("applies default noteType", () => {
    const result = createNoteSchema.safeParse({ noteText: "Just a note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("rejects negative candidateId", () => {
    const result = createNoteSchema.safeParse({
      noteText: "Note text",
      candidateId: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateNoteSchema
// ---------------------------------------------------------------------------

describe("updateNoteSchema", () => {
  it("requires uuid", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts partial update with only uuid", () => {
    const result = updateNoteSchema.safeParse({ uuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("accepts full update data", () => {
    const result = updateNoteSchema.safeParse({
      uuid: "note_abc123",
      noteText: "Updated text",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteText).toBe("Updated text");
    }
  });

  it("rejects empty uuid", () => {
    const result = updateNoteSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteNoteSchema
// ---------------------------------------------------------------------------

describe("deleteNoteSchema", () => {
  it("requires uuid", () => {
    const result = deleteNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid uuid", () => {
    const result = deleteNoteSchema.safeParse({ uuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = deleteNoteSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Pure function: buildNoteFilter
// ---------------------------------------------------------------------------

type NoteWhereInput = {
  candidate_id?: number;
  company_id?: number;
  request_uuid?: string;
  note_type?: string;
};

function buildNoteFilter(params: {
  candidateId?: number;
  companyId?: number;
  requestUuid?: string;
  noteType?: string;
}): NoteWhereInput {
  const where: NoteWhereInput = {};

  if (params.candidateId !== undefined) {
    where.candidate_id = params.candidateId;
  }
  if (params.companyId !== undefined) {
    where.company_id = params.companyId;
  }
  if (params.requestUuid && params.requestUuid.trim()) {
    where.request_uuid = params.requestUuid;
  }
  if (params.noteType && params.noteType.trim()) {
    where.note_type = params.noteType;
  }

  return where;
}

describe("buildNoteFilter", () => {
  it("returns empty object with no filters", () => {
    const result = buildNoteFilter({});
    expect(result).toEqual({});
  });

  it("filters by candidateId", () => {
    const result = buildNoteFilter({ candidateId: 42 });
    expect(result).toEqual({ candidate_id: 42 });
  });

  it("filters by companyId", () => {
    const result = buildNoteFilter({ companyId: 7 });
    expect(result).toEqual({ company_id: 7 });
  });

  it("filters by requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "request_abc123" });
    expect(result).toEqual({ request_uuid: "request_abc123" });
  });

  it("filters by noteType", () => {
    const result = buildNoteFilter({ noteType: "Internal Note" });
    expect(result).toEqual({ note_type: "Internal Note" });
  });

  it("filters by multiple fields", () => {
    const result = buildNoteFilter({
      candidateId: 42,
      companyId: 7,
    });
    expect(result).toEqual({
      candidate_id: 42,
      company_id: 7,
    });
  });

  it("ignores empty requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "   " });
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteListItemSchema
// ---------------------------------------------------------------------------

const validNoteListItem = {
  note_uuid: "note_abc123",
  note_type: "Internal Note",
  note_text: "Some content",
  company_id: 7,
  candidate_id: 42,
  created_by: 1,
  note_created_datetime: new Date("2024-06-01"),
};

describe("noteListItemSchema", () => {
  it("accepts a valid note list item", () => {
    const result = noteListItemSchema.parse(validNoteListItem);
    expect(result.note_uuid).toBe("note_abc123");
    expect(result.note_type).toBe("Internal Note");
    expect(result.note_text).toBe("Some content");
  });

  it("accepts nullable fields as null", () => {
    const result = noteListItemSchema.parse({
      ...validNoteListItem,
      note_type: null,
      note_text: null,
      company_id: null,
      candidate_id: null,
      created_by: null,
      note_created_datetime: null,
    });
    expect(result.note_type).toBeNull();
    expect(result.note_text).toBeNull();
    expect(result.company_id).toBeNull();
    expect(result.candidate_id).toBeNull();
    expect(result.created_by).toBeNull();
    expect(result.note_created_datetime).toBeNull();
  });

  it("rejects missing required field", () => {
    const { note_uuid: _, ...rest } = validNoteListItem;
    expect(() => noteListItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for note_uuid", () => {
    expect(() =>
      noteListItemSchema.parse({ ...validNoteListItem, note_uuid: 123 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteDetailSchema
// ---------------------------------------------------------------------------

const validNoteDetail = {
  ...validNoteListItem,
  note_updated_datetime: new Date("2024-06-02"),
  updated_by: 2,
  request_uuid: "request_abc123",
  story_uuid: null,
};

describe("noteDetailSchema", () => {
  it("accepts a valid note detail", () => {
    const result = noteDetailSchema.parse(validNoteDetail);
    expect(result.note_uuid).toBe("note_abc123");
    expect(result.request_uuid).toBe("request_abc123");
    expect(result.note_updated_datetime).toBeInstanceOf(Date);
  });

  it("accepts nullable extended fields as null", () => {
    const result = noteDetailSchema.parse({
      ...validNoteDetail,
      note_updated_datetime: null,
      updated_by: null,
      request_uuid: null,
      story_uuid: null,
    });
    expect(result.note_updated_datetime).toBeNull();
    expect(result.updated_by).toBeNull();
    expect(result.request_uuid).toBeNull();
    expect(result.story_uuid).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: noteDetailNullableSchema
// ---------------------------------------------------------------------------

describe("noteDetailNullableSchema", () => {
  it("accepts a valid note detail", () => {
    const result = noteDetailNullableSchema.parse(validNoteDetail);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = noteDetailNullableSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listNotesResultSchema
// ---------------------------------------------------------------------------

describe("listNotesResultSchema", () => {
  it("accepts a valid result with notes", () => {
    const result = listNotesResultSchema.parse({
      notes: [validNoteListItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.notes.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listNotesResultSchema.parse({
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.notes.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listNotesResultSchema.parse({
        notes: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
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
// Output schema tests: createNoteResultSchema
// ---------------------------------------------------------------------------

describe("createNoteResultSchema", () => {
  it("accepts a success result with note", () => {
    const result = createNoteResultSchema.parse({
      operation: "success",
      message: "Note created successfully",
      note: validNoteDetail,
    });
    expect(result.operation).toBe("success");
    expect(result.note).toBeDefined();
  });

  it("accepts an error result without note", () => {
    const result = createNoteResultSchema.parse({
      operation: "error",
      message: "Invalid create parameters",
    });
    expect(result.operation).toBe("error");
    expect(result.note).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: updateNoteResultSchema
// ---------------------------------------------------------------------------

describe("updateNoteResultSchema", () => {
  it("accepts a success result with note", () => {
    const result = updateNoteResultSchema.parse({
      operation: "success",
      message: "Note successfully updated",
      note: validNoteDetail,
    });
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result = updateNoteResultSchema.parse({
      operation: "error",
      message: "Note not found",
    });
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: deleteNoteResultSchema
// ---------------------------------------------------------------------------

describe("deleteNoteResultSchema", () => {
  it("accepts a success result", () => {
    const result = deleteNoteResultSchema.parse({
      operation: "success",
      message: "Note deleted successfully",
    });
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result = deleteNoteResultSchema.parse({
      operation: "error",
      message: "Note not found or already deleted",
    });
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Return type shape tests
// ---------------------------------------------------------------------------

describe("NoteListItem shape (from output schema)", () => {
  it("validates via noteListItemSchema", () => {
    const item: NoteListItem = noteListItemSchema.parse(validNoteListItem);
    expect(item.note_uuid).toBe("note_abc123");
    expect(item.note_type).toBe("Internal Note");
  });
});

describe("ListNotesResult shape (from output schema)", () => {
  it("accepts empty result set", () => {
    const result: ListNotesResult = listNotesResultSchema.parse({
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.total).toBe(0);
    expect(result.notes).toHaveLength(0);
  });
});
