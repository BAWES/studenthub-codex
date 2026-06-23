import { describe, it, expect } from "vitest";
import {
  listCompanyNotesSchema,
  getCompanyNoteSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  deleteCompanyNoteSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — company/notes
// ---------------------------------------------------------------------------

describe("listCompanyNotesSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = listCompanyNotesSchema.safeParse({
      company_id: 1,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(1);
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts empty input (all optional)", () => {
    const r = listCompanyNotesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts just company_id", () => {
    const r = listCompanyNotesSchema.safeParse({ company_id: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(5);
    }
  });

  it("rejects limit > 100", () => {
    expect(
      listCompanyNotesSchema.safeParse({ limit: 200 }).success,
    ).toBe(false);
  });

  it("rejects limit < 1", () => {
    expect(
      listCompanyNotesSchema.safeParse({ limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listCompanyNotesSchema.safeParse({ page: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCompanyNotesSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative company_id", () => {
    expect(
      listCompanyNotesSchema.safeParse({ company_id: -1 }).success,
    ).toBe(false);
  });
});

describe("getCompanyNoteSchema", () => {
  it("accepts valid note UUID", () => {
    const r = getCompanyNoteSchema.safeParse({
      noteUuid: "note_abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc-123");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      getCompanyNoteSchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getCompanyNoteSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    expect(
      getCompanyNoteSchema.safeParse({ noteUuid: 123 }).success,
    ).toBe(false);
  });
});

describe("createCompanyNoteSchema", () => {
  const validInput = {
    company_id: 1,
    note_text: "This is a note about the company.",
  };

  it("accepts valid note creation input", () => {
    const r = createCompanyNoteSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(1);
      expect(r.data.note_text).toBe("This is a note about the company.");
    }
  });

  it("accepts optional note_type and created_by", () => {
    const r = createCompanyNoteSchema.safeParse({
      ...validInput,
      note_type: "general",
      created_by: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note_type).toBe("general");
      expect(r.data.created_by).toBe(42);
    }
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validInput;
    expect(createCompanyNoteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note_text", () => {
    const { note_text: _, ...rest } = validInput;
    expect(createCompanyNoteSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty note_text", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        note_text: "",
      }).success,
    ).toBe(false);
  });

  it("rejects note_text over 10000 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        note_text: "A".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        company_id: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        company_id: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects note_type over 100 chars", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        note_type: "A".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    expect(
      createCompanyNoteSchema.safeParse({
        ...validInput,
        company_id: 1.5,
      }).success,
    ).toBe(false);
  });
});

describe("updateCompanyNoteSchema", () => {
  it("accepts valid update with note_text", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc-123",
      note_text: "Updated note text",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_abc-123");
      expect(r.data.note_text).toBe("Updated note text");
    }
  });

  it("accepts update with all optional fields", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc-123",
      note_text: "Text",
      note_type: "follow-up",
      updated_by: 5,
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with only noteUuid (all others optional)", () => {
    const r = updateCompanyNoteSchema.safeParse({
      noteUuid: "note_abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing noteUuid", () => {
    expect(
      updateCompanyNoteSchema.safeParse({ note_text: "Hello" }).success,
    ).toBe(false);
  });

  it("rejects empty noteUuid", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "",
        note_text: "Text",
      }).success,
    ).toBe(false);
  });

  it("rejects note_text exceeding 10000 chars", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc-123",
        note_text: "A".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("rejects note_type exceeding 100 chars", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc-123",
        note_type: "A".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("rejects empty note_text", () => {
    expect(
      updateCompanyNoteSchema.safeParse({
        noteUuid: "note_abc-123",
        note_text: "",
      }).success,
    ).toBe(false);
  });
});

describe("deleteCompanyNoteSchema", () => {
  it("accepts valid note UUID for deletion", () => {
    const r = deleteCompanyNoteSchema.safeParse({
      noteUuid: "note_xyz-789",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.noteUuid).toBe("note_xyz-789");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      deleteCompanyNoteSchema.safeParse({ noteUuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteCompanyNoteSchema.safeParse({}).success).toBe(false);
  });
});
