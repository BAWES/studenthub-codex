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
  describe("listNotesSchema", () => {
    it("parses with defaults", () => {
      const r = listNotesSchema.safeParse({});
      expect(r.success).toBe(true);
    });

    it("accepts all filter parameters", () => {
      const r = listNotesSchema.safeParse({
        companyId: 123,
        staffId: 456,
        requestUuid: "req-001",
        storyUuid: "story-001",
        type: "general",
        page: 1,
        limit: 50,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.companyId).toBe(123);
        expect(r.data.page).toBe(1);
      }
    });

    it("rejects negative page", () => {
      const r = listNotesSchema.safeParse({ page: -1 });
      expect(r.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const r = listNotesSchema.safeParse({ limit: 200 });
      expect(r.success).toBe(false);
    });

    it("accepts ISO datetime for startDate", () => {
      const r = listNotesSchema.safeParse({
        startDate: "2026-06-01T00:00:00+03:00",
      });
      expect(r.success).toBe(true);
    });

    it("accepts date-only string for startDate", () => {
      const r = listNotesSchema.safeParse({
        startDate: "2026-06-01",
      });
      expect(r.success).toBe(true);
    });
  });

  describe("getNoteSchema", () => {
    it("validates with id", () => {
      const r = getNoteSchema.safeParse({ id: "note-001" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.id).toBe("note-001");
      }
    });

    it("rejects empty id", () => {
      const r = getNoteSchema.safeParse({ id: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("createNoteSchema", () => {
    it("validates with required fields only", () => {
      const r = createNoteSchema.safeParse({ noteText: "Test note" });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.noteText).toBe("Test note");
      }
    });

    it("accepts all optional fields", () => {
      const r = createNoteSchema.safeParse({
        noteText: "Test note",
        companyId: 123,
        requestUuid: "req-001",
        storyUuid: "story-001",
        noteType: "follow-up",
        candidateId: 789,
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty noteText", () => {
      const r = createNoteSchema.safeParse({ noteText: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing noteText", () => {
      const r = createNoteSchema.safeParse({});
      expect(r.success).toBe(false);
    });
  });

  describe("updateNoteSchema", () => {
    it("validates with required fields", () => {
      const r = updateNoteSchema.safeParse({
        id: "note-001",
        noteText: "Updated text",
      });
      expect(r.success).toBe(true);
    });

    it("accepts optional companyId", () => {
      const r = updateNoteSchema.safeParse({
        id: "note-001",
        noteText: "Updated",
        companyId: 456,
      });
      expect(r.success).toBe(true);
    });

    it("rejects empty id", () => {
      const r = updateNoteSchema.safeParse({
        id: "",
        noteText: "text",
      });
      expect(r.success).toBe(false);
    });

    it("rejects empty noteText", () => {
      const r = updateNoteSchema.safeParse({
        id: "note-001",
        noteText: "",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("noteItemSchema", () => {
    it("validates a full note entry", () => {
      const r = noteItemSchema.safeParse({
        note_uuid: "note-001",
        company_id: 123,
        request_uuid: "req-001",
        story_uuid: null,
        note_type: "general",
        note_text: "A sample note",
        created_by: 100,
        updated_by: null,
        note_created_datetime: new Date("2026-06-14"),
        note_updated_datetime: null,
        staff_created: { staff_name: "Staff User" },
        staff_updated: null,
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.note_uuid).toBe("note-001");
        expect(r.data.note_text).toBe("A sample note");
      }
    });

    it("accepts null optional fields", () => {
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

    it("rejects missing required note_uuid", () => {
      const r = noteItemSchema.safeParse({
        company_id: null,
        request_uuid: null,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("listNotesResultSchema", () => {
    it("validates paginated result", () => {
      const r = listNotesResultSchema.safeParse({
        notes: [
          {
            note_uuid: "note-001",
            company_id: 123,
            request_uuid: null,
            story_uuid: null,
            note_type: "general",
            note_text: "Note text",
            created_by: 100,
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

    it("rejects zero page", () => {
      const r = listNotesResultSchema.safeParse({
        notes: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      });
      expect(r.success).toBe(false);
    });
  });

  describe("operationResultSchema", () => {
    it("validates success result", () => {
      const r = operationResultSchema.safeParse({
        operation: "createNote",
        message: "Note created successfully",
      });
      expect(r.success).toBe(true);
    });

    it("validates error result", () => {
      const r = operationResultSchema.safeParse({
        operation: "createNote",
        message: "Failed to create note",
      });
      expect(r.success).toBe(true);
    });
  });
});
