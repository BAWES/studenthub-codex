import { describe, it, expect } from "vitest";
import {
  listNotesSchema,
  getNoteSchema,
  createNoteSchema,
  updateNoteSchema,
  noteItemSchema,
  listNotesResultSchema,
  operationResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/note.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */
describe("admin note page — data contract", () => {
  it("listNotesSchema parses with defaults", () => {
    const r = listNotesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBeUndefined();
      expect(r.data.limit).toBeUndefined();
    }
  });

  it("listNotesSchema accepts filters", () => {
    const r = listNotesSchema.safeParse({
      companyId: 1,
      staffId: 5,
      requestUuid: "req-abc",
      storyUuid: "story-xyz",
      type: "Internal Note",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      page: 1,
      limit: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(1);
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("listNotesSchema rejects limit over 100", () => {
    const r = listNotesSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("listNotesSchema rejects negative page", () => {
    const r = listNotesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("listNotesSchema rejects invalid date format", () => {
    const r = listNotesSchema.safeParse({ startDate: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("getNoteSchema validates with id", () => {
    const r = getNoteSchema.safeParse({ id: "note-001" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("note-001");
    }
  });

  it("getNoteSchema rejects empty id", () => {
    const r = getNoteSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("createNoteSchema validates with required noteText", () => {
    const r = createNoteSchema.safeParse({ noteText: "Test note" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteText).toBe("Test note");
    }
  });

  it("createNoteSchema rejects empty noteText", () => {
    const r = createNoteSchema.safeParse({ noteText: "" });
    expect(r.success).toBe(false);
  });

  it("updateNoteSchema validates with id and noteText", () => {
    const r = updateNoteSchema.safeParse({ id: "note-001", noteText: "Updated" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("note-001");
    }
  });

  it("updateNoteSchema rejects empty id", () => {
    const r = updateNoteSchema.safeParse({ id: "", noteText: "text" });
    expect(r.success).toBe(false);
  });

  it("noteItemSchema validates a full note entry with staff relations", () => {
    const r = noteItemSchema.safeParse({
      note_uuid: "n-001",
      company_id: 1,
      request_uuid: "req-001",
      story_uuid: null,
      note_type: "Internal Note",
      note_text: "Some note content here",
      created_by: 42,
      updated_by: 42,
      note_created_datetime: new Date("2026-06-14"),
      note_updated_datetime: new Date("2026-06-14"),
      staff_created: { staff_name: "Staff User" },
      staff_updated: { staff_name: "Staff User" },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note_uuid).toBe("n-001");
      expect(r.data.staff_created?.staff_name).toBe("Staff User");
    }
  });

  it("noteItemSchema accepts nullable staff_created", () => {
    const r = noteItemSchema.safeParse({
      note_uuid: "n-002",
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
    });
    expect(r.success).toBe(true);
  });

  it("noteItemSchema rejects missing required fields", () => {
    const r = noteItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("listNotesResultSchema validates paginated result", () => {
    const r = listNotesResultSchema.safeParse({
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
    });
    expect(r.success).toBe(true);
  });

  it("listNotesResultSchema rejects negative total", () => {
    const r = listNotesResultSchema.safeParse({
      notes: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("operationResultSchema validates success result", () => {
    const r = operationResultSchema.safeParse({
      operation: "success",
      message: "Note created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("operationResultSchema rejects missing message", () => {
    const r = operationResultSchema.safeParse({ operation: "success" });
    expect(r.success).toBe(false);
  });
});
