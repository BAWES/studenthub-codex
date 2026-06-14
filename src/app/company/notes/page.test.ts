import { describe, it, expect } from "vitest";
import {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
} from "./schemas";

/**
 * Page migration test for company/notes.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company notes page — data contract", () => {
  it("listCompanyNotesSchema accepts valid input", () => {
    const r = listCompanyNotesSchema.safeParse({
      company_id: 1,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyNotesSchema accepts empty input", () => {
    const r = listCompanyNotesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("getCompanyNoteSchema validates with noteUuid", () => {
    const r = getCompanyNoteSchema.safeParse({ noteUuid: "note-uuid-123" });
    expect(r.success).toBe(true);
  });

  it("getCompanyNoteSchema rejects missing noteUuid", () => {
    const r = getCompanyNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createCompanyNoteSchema validates with required fields", () => {
    const r = createCompanyNoteSchema.safeParse({
      company_id: 1,
      note_text: "Follow up with client about placement.",
    });
    expect(r.success).toBe(true);
  });

  it("createCompanyNoteSchema rejects missing company_id", () => {
    const r = createCompanyNoteSchema.safeParse({
      note_text: "Some note",
    });
    expect(r.success).toBe(false);
  });

  it("createCompanyNoteSchema rejects missing note_text", () => {
    const r = createCompanyNoteSchema.safeParse({
      company_id: 1,
    });
    expect(r.success).toBe(false);
  });

  it("updateCompanyNoteSchema validates with noteUuid", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note-uuid-123",
      note_text: "Updated note text",
      note_type: "general",
    });
    expect(r.success).toBe(true);
  });

  it("updateCompanyNoteSchema accepts minimal input (uuid only)", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note-uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("updateCompanyNoteSchema rejects missing noteUuid", () => {
    const r = updateCompanyNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("deleteCompanyNoteSchema validates with noteUuid", () => {
    const r = deleteCompanyNoteSchema.safeParse({
      noteUuid: "note-uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("deleteCompanyNoteSchema rejects missing noteUuid", () => {
    const r = deleteCompanyNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
