import { describe, it, expect } from "vitest";
import {
  companyNoteListItemSchema,
  companyNoteDetailSchema,
  listCompanyNotesResultSchema,
} from "./schemas";

describe("company notes page — data contract", () => {
  it("companyNoteListItemSchema validates a valid note list item", () => {
    const r = companyNoteListItemSchema.safeParse({
      note_uuid: "note-123",
      note_text: "Follow up with client",
      note_type: "general",
      company_id: 1,
      created_by: 42,
      created_at: "2024-06-01T10:00:00Z",
      updated_at: "2024-06-02T10:00:00Z",
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.note_uuid).toBe("note-123");
  });

  it("companyNoteListItemSchema rejects missing note_uuid", () => {
    const r = companyNoteListItemSchema.safeParse({ note_text: "Test note" });
    expect(r.success).toBe(false);
  });

  it("companyNoteListItemSchema accepts null values", () => {
    const r = companyNoteListItemSchema.safeParse({
      note_uuid: "note-123",
      note_text: null,
      note_type: null,
      company_id: null,
      created_by: null,
      created_at: null,
      updated_at: null,
      company_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyNotesResultSchema validates a paginated result", () => {
    const r = listCompanyNotesResultSchema.safeParse({
      notes: [
        {
          note_uuid: "n1", note_text: null, note_type: null,
          company_id: null, created_by: null, created_at: null,
          updated_at: null, company_name: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.notes.length).toBe(1);
  });

  it("listCompanyNotesResultSchema rejects non-array notes", () => {
    const r = listCompanyNotesResultSchema.safeParse({
      notes: "bad",
      total: 0, page: 0, limit: 0, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("companyNoteDetailSchema validates a note detail", () => {
    const r = companyNoteDetailSchema.safeParse({
      note_uuid: "note-123",
      company_id: 1,
      note_text: "Follow up with client regarding contract renewal",
      note_type: "follow-up",
      created_by: 42,
      updated_by: 43,
      created_at: "2024-06-01T10:00:00Z",
      updated_at: "2024-06-02T10:00:00Z",
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
  });

  it("companyNoteDetailSchema accepts null for all nullable fields", () => {
    const r = companyNoteDetailSchema.safeParse({
      note_uuid: "note-123",
      company_id: null,
      note_text: null,
      note_type: null,
      created_by: null,
      updated_by: null,
      created_at: null,
      updated_at: null,
      company_name: null,
    });
    expect(r.success).toBe(true);
  });
});
