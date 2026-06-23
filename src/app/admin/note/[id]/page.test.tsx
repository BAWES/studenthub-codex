import { describe, it, expect } from "vitest";
import {
  getNoteSchema,
  noteItemSchema,
  listNotesResultSchema,
} from "@/modules/admin/note/schemas";

/**
 * Page migration test for admin/note/[id].
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin note detail page — data contract", () => {
  it("getNoteSchema validates with id", () => {
    const r = getNoteSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("getNoteSchema rejects empty id", () => {
    const r = getNoteSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("getNoteSchema rejects missing id", () => {
    const r = getNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("noteItemSchema validates a full note item", () => {
    const r = noteItemSchema.safeParse({
      note_uuid: "550e8400-e29b-41d4-a716-446655440000",
      company_id: 42,
      request_uuid: "550e8400-e29b-41d4-a716-446655440001",
      story_uuid: null,
      note_type: "general",
      note_text: "Candidate contacted for interview",
      created_by: 1,
      updated_by: 1,
      note_created_datetime: new Date("2026-06-01"),
      note_updated_datetime: new Date("2026-06-02"),
      staff_created: {
        staff_name: "Staff User",
      },
      staff_updated: {
        staff_name: "Staff User",
      },
    });
    expect(r.success).toBe(true);
  });

  it("noteItemSchema accepts nullable fields", () => {
    const r = noteItemSchema.safeParse({
      note_uuid: "550e8400-e29b-41d4-a716-446655440000",
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

  it("listNotesResultSchema validates paginated result", () => {
    const r = listNotesResultSchema.safeParse({
      notes: [
        {
          note_uuid: "550e8400-e29b-41d4-a716-446655440000",
          company_id: 42,
          request_uuid: null,
          story_uuid: null,
          note_type: "general",
          note_text: "Test note",
          created_by: 1,
          updated_by: null,
          note_created_datetime: new Date(),
          note_updated_datetime: new Date(),
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
});
