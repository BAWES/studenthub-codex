import { describe, it, expect } from "vitest";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
} from "./schemas";
import type {
  NoteItem,
  ListNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — listNotes
// ---------------------------------------------------------------------------

describe("listNotesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listNotesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts full filter params", () => {
    const r = listNotesSchema.safeParse({
      page: 2,
      limit: 50,
      companyId: 1,
      staffId: 5,
      requestUuid: "req_abc123",
      storyUuid: "story_abc123",
      type: "Internal Note",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.companyId).toBe(1);
      expect(r.data.staffId).toBe(5);
      expect(r.data.requestUuid).toBe("req_abc123");
      expect(r.data.storyUuid).toBe("story_abc123");
      expect(r.data.type).toBe("Internal Note");
      expect(r.data.startDate).toBe("2024-01-01");
      expect(r.data.endDate).toBe("2024-12-31");
    }
  });

  it("rejects limit over 100", () => {
    expect(listNotesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listNotesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects invalid date format", () => {
    expect(listNotesSchema.safeParse({ startDate: "not-a-date" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — getNote
// ---------------------------------------------------------------------------

describe("getNoteSchema", () => {
  it("accepts a valid note UUID string", () => {
    const r = getNoteSchema.safeParse({ id: "note_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("note_abc123");
    }
  });

  it("rejects empty ID", () => {
    const r = getNoteSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — createNote
// ---------------------------------------------------------------------------

describe("createNoteSchema", () => {
  it("accepts valid create params", () => {
    const r = createNoteSchema.safeParse({
      noteText: "This is a test note",
      companyId: 1,
      requestUuid: "req_abc123",
      noteType: "Internal Note",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteText).toBe("This is a test note");
      expect(r.data.companyId).toBe(1);
    }
  });

  it("accepts minimal params (noteText only)", () => {
    const r = createNoteSchema.safeParse({
      noteText: "Minimal note",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty note text", () => {
    const r = createNoteSchema.safeParse({ noteText: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing note text", () => {
    const r = createNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — updateNote
// ---------------------------------------------------------------------------

describe("updateNoteSchema", () => {
  it("accepts valid update params", () => {
    const r = updateNoteSchema.safeParse({
      id: "note_abc123",
      noteText: "Updated note text",
      companyId: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("note_abc123");
      expect(r.data.noteText).toBe("Updated note text");
    }
  });

  it("rejects empty ID", () => {
    const r = updateNoteSchema.safeParse({ id: "", noteText: "text" });
    expect(r.success).toBe(false);
  });

  it("rejects empty note text", () => {
    const r = updateNoteSchema.safeParse({ id: "note_abc", noteText: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — NoteItem
// ---------------------------------------------------------------------------

describe("NoteItem type", () => {
  it("has the required shape", () => {
    const item: NoteItem = {
      note_uuid: "note_abc123",
      company_id: 1,
      request_uuid: "req_abc123",
      story_uuid: null,
      note_type: "Internal Note",
      note_text: "This is a note",
      created_by: 5,
      updated_by: 5,
      note_created_datetime: new Date("2024-06-01T10:00:00.000Z"),
      note_updated_datetime: new Date("2024-06-01T10:00:00.000Z"),
      staff_created: { staff_name: "Staff 1" },
      staff_updated: { staff_name: "Staff 1" },
    };
    expect(item.note_uuid).toBe("note_abc123");
    expect(item.note_text).toBe("This is a note");
    expect(item.note_type).toBe("Internal Note");
  });

  it("accepts null relations", () => {
    const item: NoteItem = {
      note_uuid: "note_def456",
      company_id: null,
      request_uuid: null,
      story_uuid: null,
      note_type: "Internal Note",
      note_text: null,
      created_by: null,
      updated_by: null,
      note_created_datetime: null,
      note_updated_datetime: null,
      staff_created: null,
      staff_updated: null,
    };
    expect(item.note_uuid).toBe("note_def456");
    expect(item.staff_created).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — ListNotesResult
// ---------------------------------------------------------------------------

describe("ListNotesResult type", () => {
  it("has the correct shape", () => {
    const result: ListNotesResult = {
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.notes).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});
