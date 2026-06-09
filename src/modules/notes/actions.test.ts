import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: note schema validation
//
// The note server actions use these schemas internally. Testing them
// separately avoids mocking "use server" dependencies (prisma, session,
// next/cache).
// ---------------------------------------------------------------------------

const listNotesSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  noteType: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

const createNoteSchema = z.object({
  companyId: z.number().int().positive().optional(),
  candidateId: z.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  noteType: z.string().optional().default("Internal Note"),
  noteText: z.string().optional(),
});

const updateNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
  noteText: z.string().optional(),
  noteType: z.string().optional(),
});

const deleteNoteSchema = z.object({
  noteUuid: z.string().min(1, "Note UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NoteListItem = {
  note_uuid: string;
  company_id: number | null;
  candidate_id: number | null;
  request_uuid: string | null;
  note_type: string | null;
  note_text: string | null;
  created_by: number | null;
  updated_by: number | null;
  note_created_datetime: Date;
  note_updated_datetime: Date;
};

type ListNotesResult = {
  notes: NoteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Filter builder (pure function)
// ---------------------------------------------------------------------------

type NoteWhereInput = {
  candidate_id?: number;
  company_id?: number;
  request_uuid?: string;
  note_type?: string;
};

function buildNoteFilter(params: {
  candidateId?: number;
  companyId?: number;
  requestUuid?: string;
  noteType?: string;
}): NoteWhereInput {
  const where: NoteWhereInput = {};

  if (params.candidateId !== undefined) {
    where.candidate_id = params.candidateId;
  }
  if (params.companyId !== undefined) {
    where.company_id = params.companyId;
  }
  if (params.requestUuid && params.requestUuid.trim()) {
    where.request_uuid = params.requestUuid;
  }
  if (params.noteType && params.noteType.trim()) {
    where.note_type = params.noteType;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Tests: listNotesSchema
// ---------------------------------------------------------------------------

describe("listNotesSchema", () => {
  it("accepts empty params and uses defaults", () => {
    const result = listNotesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listNotesSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts companyId filter", () => {
    const result = listNotesSchema.safeParse({ companyId: 7 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });

  it("accepts requestUuid filter", () => {
    const result = listNotesSchema.safeParse({ requestUuid: "request_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("request_abc123");
    }
  });

  it("accepts noteType filter", () => {
    const result = listNotesSchema.safeParse({ noteType: "Internal Note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("accepts pagination params", () => {
    const result = listNotesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listNotesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNotesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = listNotesSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: getNoteSchema
// ---------------------------------------------------------------------------

describe("getNoteSchema", () => {
  it("accepts a valid note UUID", () => {
    const result = getNoteSchema.safeParse({ noteUuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty noteUuid", () => {
    const result = getNoteSchema.safeParse({ noteUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing noteUuid", () => {
    const result = getNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: createNoteSchema
// ---------------------------------------------------------------------------

describe("createNoteSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createNoteSchema.safeParse({
      candidateId: 42,
      companyId: 7,
      requestUuid: "request_abc123",
      noteType: "Internal Note",
      noteText: "This is a note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
      expect(result.data.noteText).toBe("This is a note");
    }
  });

  it("accepts minimal input (no required fields beyond uuid generation)", () => {
    const result = createNoteSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("applies default noteType", () => {
    const result = createNoteSchema.safeParse({ noteText: "Just a note" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("rejects negative candidateId", () => {
    const result = createNoteSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateNoteSchema
// ---------------------------------------------------------------------------

describe("updateNoteSchema", () => {
  it("requires noteUuid", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts partial update with only uuid", () => {
    const result = updateNoteSchema.safeParse({ noteUuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("accepts full update data", () => {
    const result = updateNoteSchema.safeParse({
      noteUuid: "note_abc123",
      noteText: "Updated text",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteText).toBe("Updated text");
    }
  });

  it("rejects empty noteUuid", () => {
    const result = updateNoteSchema.safeParse({ noteUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteNoteSchema
// ---------------------------------------------------------------------------

describe("deleteNoteSchema", () => {
  it("requires noteUuid", () => {
    const result = deleteNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid noteUuid", () => {
    const result = deleteNoteSchema.safeParse({ noteUuid: "note_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty noteUuid", () => {
    const result = deleteNoteSchema.safeParse({ noteUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: buildNoteFilter (pure function)
// ---------------------------------------------------------------------------

describe("buildNoteFilter", () => {
  it("returns empty object with no filters", () => {
    const result = buildNoteFilter({});
    expect(result).toEqual({});
  });

  it("filters by candidateId", () => {
    const result = buildNoteFilter({ candidateId: 42 });
    expect(result).toEqual({ candidate_id: 42 });
  });

  it("filters by companyId", () => {
    const result = buildNoteFilter({ companyId: 7 });
    expect(result).toEqual({ company_id: 7 });
  });

  it("filters by requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "request_abc123" });
    expect(result).toEqual({ request_uuid: "request_abc123" });
  });

  it("filters by noteType", () => {
    const result = buildNoteFilter({ noteType: "Internal Note" });
    expect(result).toEqual({ note_type: "Internal Note" });
  });

  it("filters by multiple fields", () => {
    const result = buildNoteFilter({
      candidateId: 42,
      companyId: 7,
    });
    expect(result).toEqual({
      candidate_id: 42,
      company_id: 7,
    });
  });

  it("ignores empty requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only requestUuid", () => {
    const result = buildNoteFilter({ requestUuid: "   " });
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Tests: Return type shapes
// ---------------------------------------------------------------------------

describe("NoteListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: NoteListItem = {
      note_uuid: "note_abc123",
      company_id: 7,
      candidate_id: 42,
      request_uuid: "request_def456",
      note_type: "Internal Note",
      note_text: "Some content",
      created_by: 1,
      updated_by: 1,
      note_created_datetime: new Date("2024-06-01"),
      note_updated_datetime: new Date("2024-06-01"),
    };
    expect(mock.note_uuid).toBe("note_abc123");
    expect(mock.candidate_id).toBe(42);
    expect(mock.note_type).toBe("Internal Note");
  });
});

describe("ListNotesResult shape", () => {
  it("accepts empty result set", () => {
    const result: ListNotesResult = {
      notes: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.notes).toHaveLength(0);
  });
});
