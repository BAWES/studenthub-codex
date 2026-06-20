import { describe, it, expect } from "vitest";
import {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for company/notes/actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listCompanyNotesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listCompanyNotesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCompanyNotesSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts optional company_id filter", () => {
    const r = listCompanyNotesSchema.safeParse({ company_id: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(5);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCompanyNotesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects limit under 1", () => {
    expect(listCompanyNotesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCompanyNotesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCompanyNotesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(listCompanyNotesSchema.safeParse({ company_id: 0 }).success).toBe(false);
  });

  it("rejects negative company_id", () => {
    expect(listCompanyNotesSchema.safeParse({ company_id: -5 }).success).toBe(false);
  });
});

describe("getCompanyNoteSchema", () => {
  it("accepts a valid note UUID", () => {
    expect(
      getCompanyNoteSchema.safeParse({
        noteUuid: "note_abc123-def456",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCompanyNoteSchema.safeParse({ noteUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null UUID", () => {
    expect(getCompanyNoteSchema.safeParse({ noteUuid: null }).success).toBe(false);
  });
});

describe("createCompanyNoteSchema", () => {
  it("accepts valid note data with all fields", () => {
    const r = createCompanyNoteSchema.safeParse({
      company_id: 1,
      note_text: "This is a test note about the company.",
      note_type: "Internal Note",
      created_by: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(1);
      expect(r.data.note_text).toBe("This is a test note about the company.");
      expect(r.data.note_type).toBe("Internal Note");
      expect(r.data.created_by).toBe(42);
    }
  });

  it("accepts minimal data (company_id + note_text only)", () => {
    const r = createCompanyNoteSchema.safeParse({
      company_id: 1,
      note_text: "Minimal note",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note_type).toBeUndefined();
      expect(r.data.created_by).toBeUndefined();
    }
  });

  it("accepts note_type without created_by", () => {
    const r = createCompanyNoteSchema.safeParse({
      company_id: 1,
      note_text: "Note with type only",
      note_type: "Feedback",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note_type).toBe("Feedback");
    }
  });

  it("rejects missing company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        note_text: "Missing company ID",
      }).success,
    ).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 0,
        note_text: "Zero company ID",
      }).success,
    ).toBe(false);
  });

  it("rejects negative company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: -1,
        note_text: "Negative company ID",
      }).success,
    ).toBe(false);
  });

  it("rejects missing note_text", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects empty note_text", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 1,
        note_text: "",
      }).success,
    ).toBe(false);
  });

  it("rejects note_text over 10000 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 1,
        note_text: "x".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("accepts note_text at exactly 10000 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 1,
        note_text: "x".repeat(10000),
      }).success,
    ).toBe(true);
  });

  it("rejects note_type over 100 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        company_id: 1,
        note_text: "Valid note",
        note_type: "x".repeat(101),
      }).success,
    ).toBe(false);
  });
});

describe("updateCompanyNoteSchema", () => {
  it("accepts full update data", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc123",
      note_text: "Updated note content",
      note_type: "Internal Note",
      updated_by: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc123");
      expect(r.data.note_text).toBe("Updated note content");
      expect(r.data.note_type).toBe("Internal Note");
      expect(r.data.updated_by).toBe(42);
    }
  });

  it("accepts partial update (note_text only)", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc123",
      note_text: "Just updating the text",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note_type).toBeUndefined();
      expect(r.data.updated_by).toBeUndefined();
    }
  });

  it("accepts partial update (note_type only)", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc123",
      note_type: "Feedback",
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with updated_by only", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc123",
      updated_by: 99,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        note_text: "Missing UUID",
      }).success,
    ).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "",
        note_text: "Empty UUID",
      }).success,
    ).toBe(false);
  });

  it("rejects empty note_text", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc",
        note_text: "",
      }).success,
    ).toBe(false);
  });

  it("rejects note_text over 10000 chars", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc",
        note_text: "x".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("rejects note_type over 100 chars", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc",
        note_type: "x".repeat(101),
      }).success,
    ).toBe(false);
  });
});

describe("deleteCompanyNoteSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteCompanyNoteSchema.safeParse({
        noteUuid: "note_xyz-789",
      }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteCompanyNoteSchema.safeParse({ noteUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null UUID", () => {
    expect(deleteCompanyNoteSchema.safeParse({ noteUuid: null }).success).toBe(false);
  });
});
