import { describe, it, expect } from "vitest";
import {
  getNoteEntrySchema,
  updateNoteEntrySchema,
  deleteNoteEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for company/notes/[id] actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getNoteEntrySchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      getNoteEntrySchema.safeParse({
        noteUuid: "note_abc123-def456",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getNoteEntrySchema.safeParse({ noteUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getNoteEntrySchema.safeParse({}).success).toBe(false);
  });
});

describe("updateNoteEntrySchema", () => {
  it("accepts valid update params", () => {
    const r = updateNoteEntrySchema.safeParse({
      noteUuid: "note_abc",
      noteText: "Updated note content",
      companyId: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc");
      expect(r.data.noteText).toBe("Updated note content");
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects missing noteUuid", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteText: "content",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "",
        noteText: "content",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing noteText", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects empty noteText", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc",
        noteText: "",
        companyId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc",
        noteText: "content",
      }).success,
    ).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc",
        noteText: "content",
        companyId: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(
      updateNoteEntrySchema.safeParse({
        noteUuid: "note_abc",
        noteText: "content",
        companyId: -1,
      }).success,
    ).toBe(false);
  });
});

describe("deleteNoteEntrySchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteNoteEntrySchema.safeParse({
        noteUuid: "note_xyz",
      }).success,
    ).toBe(true);
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
