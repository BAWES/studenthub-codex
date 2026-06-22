import { describe, it, expect } from "vitest";
import {
  getNoteEntrySchema,
  deleteNoteEntrySchema,
  updateNoteEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — company/notes/[id]
// ---------------------------------------------------------------------------

describe("getNoteEntrySchema", () => {
  it("accepts valid note UUID", () => {
    const r = getNoteEntrySchema.safeParse({
      noteUuid: "note_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    expect(getNoteEntrySchema.safeParse({ noteUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getNoteEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    expect(getNoteEntrySchema.safeParse({ noteUuid: 123 }).success).toBe(
      false,
    );
  });
});

describe("deleteNoteEntrySchema", () => {
  it("accepts valid note UUID for deletion", () => {
    const r = deleteNoteEntrySchema.safeParse({
      noteUuid: "note_xyz-789",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_xyz-789");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      deleteNoteEntrySchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteNoteEntrySchema.safeParse({}).success).toBe(false);
  });
});

describe("updateNoteEntrySchema", () => {
  it("accepts valid update with all fields", () => {
    const r = updateNoteEntrySchema.safeParse({
      noteUuid: "note_abc-123",
      noteText: "Updated note content",
      companyId: 5,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc-123");
      expect(r.data.noteText).toBe("Updated note content");
      expect(r.data.companyId).toBe(5);
    }
  });

  it("rejects missing noteUuid", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteText: "Text",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "",
        noteText: "Text",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing noteText", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects empty noteText", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        noteText: "",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        noteText: "Text",
      }).success,
    ).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        noteText: "Text",
        companyId: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        noteText: "Text",
        companyId: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc-123",
        noteText: "Text",
        companyId: 1.5,
      }).success,
    ).toBe(false);
  });
});
