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

/**
 * Page migration test for admin/note.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */

const validStaffInfo = { staff_name: "Staff User" };

const validNoteItem = {
  note_uuid: "note-001",
  company_id: 42,
  request_uuid: "req-001",
  story_uuid: "story-001",
  note_type: "general",
  note_text: "Followed up with candidate regarding interview",
  created_by: 1,
  updated_by: 1,
  note_created_datetime: new Date("2026-06-14"),
  note_updated_datetime: new Date("2026-06-14"),
  staff_created: validStaffInfo,
  staff_updated: validStaffInfo,
};

describe("admin note page — data contract", () => {
  // ── Input: listNotesSchema ──
  describe("listNotesSchema", () => {
    it("parses with defaults", () => {
      const r = listNotesSchema.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.page).toBeUndefined();
      }
    });

    it("accepts all filter params", () => {
      const r = listNotesSchema.safeParse({
        companyId: 1,
        staffId: 42,
        requestUuid: "req-abc",
        storyUuid: "story-xyz",
        type: "general",
        startDate: "2026-06-01",
        endDate: "2026-06-14",
        page: 1,
        limit: 50,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.companyId).toBe(1);
        expect(r.data.page).toBe(1);
      }
    });

    it("rejects limit over 100", () =>
      expect(listNotesSchema.safeParse({ limit: 200 }).success).toBe(false));
  });

  // ── Input: getNoteSchema ──
  describe("getNoteSchema", () => {
    it("accepts valid id", () => {
      const r = getNoteSchema.safeParse({ id: "note-001" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.id).toBe("note-001");
    });

    it("rejects empty id", () =>
      expect(getNoteSchema.safeParse({ id: "" }).success).toBe(false));

    it("rejects missing id", () =>
      expect(getNoteSchema.safeParse({}).success).toBe(false));
  });

  // ── Input: createNoteSchema ──
  describe("createNoteSchema", () => {
    it("accepts valid create input", () => {
      const r = createNoteSchema.safeParse({
        noteText: "New note",
        companyId: 1,
        requestUuid: "req-001",
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.noteText).toBe("New note");
    });

    it("rejects empty noteText", () =>
      expect(createNoteSchema.safeParse({ noteText: "" }).success).toBe(false));

    it("rejects missing noteText", () =>
      expect(createNoteSchema.safeParse({}).success).toBe(false));
  });

  // ── Input: updateNoteSchema ──
  describe("updateNoteSchema", () => {
    it("accepts valid update input", () => {
      const r = updateNoteSchema.safeParse({
        id: "note-001",
        noteText: "Updated text",
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.id).toBe("note-001");
        expect(r.data.noteText).toBe("Updated text");
      }
    });

    it("rejects empty id", () =>
      expect(updateNoteSchema.safeParse({ id: "", noteText: "text" }).success).toBe(
        false,
      ));

    it("rejects empty noteText", () =>
      expect(updateNoteSchema.safeParse({ id: "note-001", noteText: "" }).success).toBe(
        false,
      ));
  });

  // ── Output: staffInfoSchema ──
  describe("staffInfoSchema", () => {
    it("validates staff info", () => {
      const r = staffInfoSchema.safeParse(validStaffInfo);
      expect(r.success).toBe(true);
    });

    it("rejects missing staff_name", () =>
      expect(staffInfoSchema.safeParse({}).success).toBe(false));
  });

  // ── Output: noteItemSchema ──
  describe("noteItemSchema", () => {
    it("validates a full note item", () => {
      const r = noteItemSchema.safeParse(validNoteItem);
      expect(r.success).toBe(true);
    });

    it("accepts nullable fields as null", () => {
      const r = noteItemSchema.safeParse({
        note_uuid: "note-002",
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

    it("rejects missing note_uuid", () =>
      expect(noteItemSchema.safeParse({}).success).toBe(false));
  });

  // ── Output: listNotesResultSchema ──
  describe("listNotesResultSchema", () => {
    it("validates paginated result", () => {
      const r = listNotesResultSchema.safeParse({
        notes: [validNoteItem],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(r.success).toBe(true);
    });

    it("rejects negative total", () => {
      const r = listNotesResultSchema.safeParse({
        notes: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });
  });

  // ── Output: operationResultSchema ──
  describe("operationResultSchema", () => {
    it("validates success result", () => {
      const r = operationResultSchema.safeParse({
        operation: "create",
        message: "Note created successfully",
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing fields", () =>
      expect(operationResultSchema.safeParse({}).success).toBe(false));
  });
});
