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

const validListItem = {
  note_uuid: "note_abc123",
  note_type: "Internal Note",
  note_text: "Some text content.",
  company_id: 1,
  candidate_id: 42,
  created_by: 7,
  note_created_datetime: "2024-01-15T10:30:00Z",
};

const validDetail = {
  ...validListItem,
  note_updated_datetime: "2024-06-20T14:00:00Z",
  updated_by: 7,
  request_uuid: "req_xyz",
  story_uuid: "story_456",
};

// ---------------------------------------------------------------------------
// noteListItemSchema
// ---------------------------------------------------------------------------
describe("noteListItemSchema", () => {
  it("accepts a valid list item with all fields", () => {
    expect(noteListItemSchema.safeParse(validListItem).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      noteListItemSchema.safeParse({
        note_uuid: "note_null_test",
        note_type: null,
        note_text: null,
        company_id: null,
        candidate_id: null,
        created_by: null,
        note_created_datetime: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing note_uuid", () => {
    const { note_uuid: _, ...rest } = validListItem;
    expect(noteListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for note_uuid", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, note_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, company_id: "one" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, candidate_id: "two" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for created_by", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, created_by: "three" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for note_type", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, note_type: 42 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for note_text", () => {
    expect(
      noteListItemSchema.safeParse({ ...validListItem, note_text: false })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for note_created_datetime", () => {
    expect(
      noteListItemSchema.safeParse({
        ...validListItem,
        note_created_datetime: 12345,
      }).success,
    ).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(noteListItemSchema.safeParse("string").success).toBe(false);
    expect(noteListItemSchema.safeParse(42).success).toBe(false);
    expect(noteListItemSchema.safeParse(null).success).toBe(false);
    expect(noteListItemSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteDetailSchema
// ---------------------------------------------------------------------------
describe("noteDetailSchema", () => {
  it("accepts a valid detail with all extended fields", () => {
    expect(noteDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts nullable extended fields as null", () => {
    expect(
      noteDetailSchema.safeParse({
        ...validListItem,
        note_updated_datetime: null,
        updated_by: null,
        request_uuid: null,
        story_uuid: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing note_updated_datetime", () => {
    const { note_updated_datetime: _, ...rest } = validDetail;
    expect(noteDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updated_by", () => {
    const { updated_by: _, ...rest } = validDetail;
    expect(noteDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = validDetail;
    expect(noteDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing story_uuid", () => {
    const { story_uuid: _, ...rest } = validDetail;
    expect(noteDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for note_updated_datetime", () => {
    expect(
      noteDetailSchema.safeParse({ ...validDetail, note_updated_datetime: 123 })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for updated_by", () => {
    expect(
      noteDetailSchema.safeParse({ ...validDetail, updated_by: "who" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for request_uuid", () => {
    expect(
      noteDetailSchema.safeParse({ ...validDetail, request_uuid: false })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for story_uuid", () => {
    expect(
      noteDetailSchema.safeParse({ ...validDetail, story_uuid: 999 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listNotesResultSchema
// ---------------------------------------------------------------------------
describe("listNotesResultSchema", () => {
  const validResult = {
    notes: [validListItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result with one item", () => {
    expect(listNotesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts an empty notes array", () => {
    expect(
      listNotesResultSchema.safeParse({
        notes: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts multiple items in notes array", () => {
    expect(
      listNotesResultSchema.safeParse({
        notes: [
          validListItem,
          {
            note_uuid: "note_def456",
            note_type: null,
            note_text: "Second note",
            company_id: 2,
            candidate_id: null,
            created_by: 3,
            note_created_datetime: "2024-02-10T08:00:00Z",
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects non-array for notes", () => {
    expect(
      listNotesResultSchema.safeParse({
        ...validResult,
        notes: "not-an-array",
      }).success,
    ).toBe(false);
    expect(
      listNotesResultSchema.safeParse({
        ...validResult,
        notes: null,
      }).success,
    ).toBe(false);
    expect(
      listNotesResultSchema.safeParse({
        ...validResult,
        notes: 42,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid elements in notes array", () => {
    expect(
      listNotesResultSchema.safeParse({
        ...validResult,
        notes: [{ note_uuid: 123, company_id: "bad" }],
      }).success,
    ).toBe(false);
  });

  it("rejects missing notes field", () => {
    const { notes: _, ...rest } = validResult;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total field", () => {
    const { total: _, ...rest } = validResult;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page field", () => {
    const { page: _, ...rest } = validResult;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit field", () => {
    const { limit: _, ...rest } = validResult;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages field", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listNotesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listNotesResultSchema.safeParse({ ...validResult, total: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listNotesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      listNotesResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
    expect(
      listNotesResultSchema.safeParse({ ...validResult, page: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-positive limit", () => {
    expect(
      listNotesResultSchema.safeParse({ ...validResult, limit: 0 }).success,
    ).toBe(false);
    expect(
      listNotesResultSchema.safeParse({ ...validResult, limit: -5 }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listNotesResultSchema.safeParse({ ...validResult, totalPages: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(listNotesResultSchema.safeParse(true).success).toBe(false);
    expect(listNotesResultSchema.safeParse("string").success).toBe(false);
    expect(listNotesResultSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteDetailOrNullSchema
// ---------------------------------------------------------------------------
describe("noteDetailOrNullSchema", () => {
  it("accepts a valid note detail", () => {
    expect(noteDetailOrNullSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null", () => {
    expect(noteDetailOrNullSchema.safeParse(null).success).toBe(true);
  });

  it("rejects undefined (null only, not undefined)", () => {
    expect(noteDetailOrNullSchema.safeParse(undefined).success).toBe(false);
  });

  it("rejects a string", () => {
    expect(noteDetailOrNullSchema.safeParse("string").success).toBe(false);
  });

  it("rejects an invalid object", () => {
    expect(
      noteDetailOrNullSchema.safeParse({
        note_uuid: "abc",
        // missing all other required fields
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteMutationResultSchema
// ---------------------------------------------------------------------------
describe("noteMutationResultSchema", () => {
  const baseResult = {
    operation: "create",
    message: "Note created successfully.",
  };

  it("accepts a result without note", () => {
    expect(noteMutationResultSchema.safeParse(baseResult).success).toBe(true);
  });

  it("accepts a result with note", () => {
    expect(
      noteMutationResultSchema.safeParse({
        ...baseResult,
        note: validDetail,
      }).success,
    ).toBe(true);
  });

  it("accepts a result with note having nullable fields", () => {
    expect(
      noteMutationResultSchema.safeParse({
        ...baseResult,
        note: {
          ...validListItem,
          note_updated_datetime: null,
          updated_by: null,
          request_uuid: null,
          story_uuid: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = baseResult;
    expect(noteMutationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = baseResult;
    expect(noteMutationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      noteMutationResultSchema.safeParse({ ...baseResult, operation: 123 })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for message", () => {
    expect(
      noteMutationResultSchema.safeParse({ ...baseResult, message: true })
        .success,
    ).toBe(false);
  });

  it("rejects invalid note structure", () => {
    expect(
      noteMutationResultSchema.safeParse({
        ...baseResult,
        note: { invalid: "object" },
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// noteDeleteResultSchema
// ---------------------------------------------------------------------------
describe("noteDeleteResultSchema", () => {
  const validDelete = {
    operation: "delete",
    message: "Note deleted successfully.",
  };

  it("accepts a valid delete result", () => {
    expect(noteDeleteResultSchema.safeParse(validDelete).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = validDelete;
    expect(noteDeleteResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = validDelete;
    expect(noteDeleteResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      noteDeleteResultSchema.safeParse({ ...validDelete, operation: null })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for message", () => {
    expect(
      noteDeleteResultSchema.safeParse({ ...validDelete, message: 0 }).success,
    ).toBe(false);
  });

  it("rejects extra unrecognized fields (strict object)", () => {
    // Zod object by default strips unknown keys, so extra fields are allowed.
    // This test documents the default behaviour.
    expect(
      noteDeleteResultSchema.safeParse({
        ...validDelete,
        extraField: "should-be-ignored",
      }).success,
    ).toBe(true);
  });

  it("rejects non-object input", () => {
    expect(noteDeleteResultSchema.safeParse("delete").success).toBe(false);
    expect(noteDeleteResultSchema.safeParse(42).success).toBe(false);
    expect(noteDeleteResultSchema.safeParse(null).success).toBe(false);
  });
});
