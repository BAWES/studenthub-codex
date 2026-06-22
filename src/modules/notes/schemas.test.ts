import { describe, it, expect } from "vitest";
import {
  noteListItemSchema,
  noteDetailSchema,
  listNotesResultSchema,
  noteDetailOrNullSchema,
  noteMutationResultSchema,
  noteDeleteResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidNoteListItem(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    note_uuid: "note_abc123",
    note_type: "Internal Note",
    note_text: "Candidate seemed like a great fit",
    company_id: 42,
    candidate_id: 1001,
    created_by: 5,
    note_created_datetime: "2026-06-14T10:00:00Z",
    ...overrides,
  };
}

function makeValidNoteDetail(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...makeValidNoteListItem(),
    note_updated_datetime: "2026-06-14T12:00:00Z",
    updated_by: 3,
    request_uuid: "req_xyz789",
    story_uuid: "story_def456",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// noteListItemSchema
// ---------------------------------------------------------------------------

describe("noteListItemSchema", () => {
  it("accepts a valid note list item with all fields", () => {
    const result = noteListItemSchema.safeParse(makeValidNoteListItem());
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields set to null", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({
        note_type: null,
        note_text: null,
        company_id: null,
        candidate_id: null,
        created_by: null,
        note_created_datetime: null,
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects missing note_uuid", () => {
    const { note_uuid: _, ...rest } = makeValidNoteListItem();
    const result = noteListItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string note_uuid", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ note_uuid: 123 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string note_type", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ note_type: 42 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string note_text", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ note_text: 999 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number company_id", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ company_id: "42" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ candidate_id: "abc" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number created_by", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ created_by: "5" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string note_created_datetime", () => {
    const result = noteListItemSchema.safeParse(
      makeValidNoteListItem({ note_created_datetime: 123 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = noteListItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteDetailSchema
// ---------------------------------------------------------------------------

describe("noteDetailSchema", () => {
  it("accepts a valid note detail with all fields", () => {
    const result = noteDetailSchema.safeParse(makeValidNoteDetail());
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields set to null (including extended fields)", () => {
    const result = noteDetailSchema.safeParse(
      makeValidNoteDetail({
        note_type: null,
        note_text: null,
        company_id: null,
        candidate_id: null,
        created_by: null,
        note_created_datetime: null,
        note_updated_datetime: null,
        updated_by: null,
        request_uuid: null,
        story_uuid: null,
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects missing note_uuid (inherited required field)", () => {
    const { note_uuid: _, ...rest } = makeValidNoteDetail();
    const result = noteDetailSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-string note_updated_datetime", () => {
    const result = noteDetailSchema.safeParse(
      makeValidNoteDetail({ note_updated_datetime: 456 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-number updated_by", () => {
    const result = noteDetailSchema.safeParse(
      makeValidNoteDetail({ updated_by: "abc" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const result = noteDetailSchema.safeParse(
      makeValidNoteDetail({ request_uuid: 789 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects non-string story_uuid", () => {
    const result = noteDetailSchema.safeParse(
      makeValidNoteDetail({ story_uuid: 123 }),
    );
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listNotesResultSchema
// ---------------------------------------------------------------------------

describe("listNotesResultSchema", () => {
  const validListResult = {
    notes: [makeValidNoteListItem(), makeValidNoteListItem({ note_uuid: "note_def456" })],
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result with note items", () => {
    const result = listNotesResultSchema.safeParse(validListResult);
    expect(result.success).toBe(true);
  });

  it("accepts an empty notes array", () => {
    const result = listNotesResultSchema.safeParse({
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = validListResult;
    const result = listNotesResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects non-array notes", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      notes: "not-an-array",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validListResult;
    const result = listNotesResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      total: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validListResult;
    const result = listNotesResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validListResult;
    const result = listNotesResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      limit: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validListResult;
    const result = listNotesResultSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });

  it("validates nested note items within paginated result", () => {
    const result = listNotesResultSchema.safeParse({
      notes: [{ ...makeValidNoteListItem(), note_uuid: 123 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      total: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listNotesResultSchema.safeParse({
      ...validListResult,
      page: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteDetailOrNullSchema
// ---------------------------------------------------------------------------

describe("noteDetailOrNullSchema", () => {
  it("accepts a valid note detail (non-null)", () => {
    const result = noteDetailOrNullSchema.safeParse(makeValidNoteDetail());
    expect(result.success).toBe(true);
  });

  it("accepts null", () => {
    const result = noteDetailOrNullSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("rejects undefined", () => {
    const result = noteDetailOrNullSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it("rejects an empty object (missing required fields)", () => {
    const result = noteDetailOrNullSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a string or other non-object, non-null value", () => {
    const result = noteDetailOrNullSchema.safeParse("not-null");
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteMutationResultSchema
// ---------------------------------------------------------------------------

describe("noteMutationResultSchema", () => {
  it("accepts a success result with a note", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "success",
      message: "Note created successfully",
      note: makeValidNoteDetail(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a result without the optional note field", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "success",
      message: "Note created",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = noteMutationResultSchema.safeParse({
      message: "Note created",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: 1,
      message: "Done",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "error",
      message: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid note shape in the optional note field", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "error",
      message: "Invalid",
      note: { note_uuid: 123 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts any valid string for operation (not only known values)", () => {
    const result = noteMutationResultSchema.safeParse({
      operation: "update",
      message: "Note updated",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// noteDeleteResultSchema
// ---------------------------------------------------------------------------

describe("noteDeleteResultSchema", () => {
  it("accepts a success result", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: "success",
      message: "Note deleted successfully",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error result", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: "error",
      message: "Note not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = noteDeleteResultSchema.safeParse({ message: "Done" });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: 1,
      message: "Deleted",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: "success",
      message: 42,
    });
    expect(result.success).toBe(false);
  });

  it("accepts any valid string for operation (not only known values)", () => {
    const result = noteDeleteResultSchema.safeParse({
      operation: "unknown_action",
      message: "Something happened",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = noteDeleteResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
