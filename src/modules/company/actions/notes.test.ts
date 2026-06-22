import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockRandomUUID,
  mockNoteFindMany,
  mockNoteFindUnique,
  mockNoteFindFirst,
  mockNoteCreate,
  mockNoteUpdate,
  mockNoteDelete,
  mockNoteCount,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRandomUUID: vi.fn(),
  mockNoteFindMany: vi.fn(),
  mockNoteFindUnique: vi.fn(),
  mockNoteFindFirst: vi.fn(),
  mockNoteCreate: vi.fn(),
  mockNoteUpdate: vi.fn(),
  mockNoteDelete: vi.fn(),
  mockNoteCount: vi.fn(),
}));

// ── Mock dependencies ───────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      findMany: mockNoteFindMany,
      findUnique: mockNoteFindUnique,
      findFirst: mockNoteFindFirst,
      create: mockNoteCreate,
      update: mockNoteUpdate,
      delete: mockNoteDelete,
      count: mockNoteCount,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("node:crypto", () => ({
  default: { randomUUID: mockRandomUUID },
  randomUUID: mockRandomUUID,
}));

// ── Imports (after mocks) ──────────────────────────────────
import {
  listCompanyNotes,
  getCompanyNote,
  createCompanyNote,
  updateCompanyNote,
  deleteCompanyNote,
  getNoteEntry,
  updateNoteEntry,
  deleteNoteEntry,
} from "./company";

// ===========================================================================
// listCompanyNotes()
// ===========================================================================
describe("listCompanyNotes()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("lists notes with default pagination", async () => {
    mockNoteFindMany.mockResolvedValue([
      {
        note_uuid: "note-1",
        note_text: "First note",
        note_type: "Internal Note",
        company_id: 1,
        created_by: 10,
        note_created_datetime: new Date("2025-01-01"),
        note_updated_datetime: new Date("2025-01-02"),
        company: { company_name: "Test Corp" },
      },
    ]);
    mockNoteCount.mockResolvedValue(1);

    const result = await listCompanyNotes({});

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockNoteFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { note_created_datetime: "desc" },
      skip: 0,
      take: 20,
      select: expect.any(Object),
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.notes).toHaveLength(1);
    expect(result.notes[0].note_text).toBe("First note");
    expect(result.notes[0].company_name).toBe("Test Corp");
  });

  it("filters by company_id when provided", async () => {
    mockNoteFindMany.mockResolvedValue([]);
    mockNoteCount.mockResolvedValue(0);

    await listCompanyNotes({ company_id: 5 });

    expect(mockNoteFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { company_id: 5 } }),
    );
  });

  it("applies pagination offset correctly", async () => {
    mockNoteFindMany.mockResolvedValue([]);
    mockNoteCount.mockResolvedValue(0);

    await listCompanyNotes({ page: 3, limit: 10 });

    expect(mockNoteFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result when no notes exist", async () => {
    mockNoteFindMany.mockResolvedValue([]);
    mockNoteCount.mockResolvedValue(0);

    const result = await listCompanyNotes({});

    expect(result.notes).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws on invalid input (negative page)", async () => {
    await expect(listCompanyNotes({ page: -1 })).rejects.toThrow();
  });

  it("throws on limit over 100", async () => {
    await expect(listCompanyNotes({ limit: 101 })).rejects.toThrow();
  });

  it("maps dates to ISO strings", async () => {
    const createdDate = new Date("2025-06-01T10:00:00.000Z");
    const updatedDate = new Date("2025-06-02T12:00:00.000Z");
    mockNoteFindMany.mockResolvedValue([
      {
        note_uuid: "note-1",
        note_text: "Note with dates",
        note_type: "Internal",
        company_id: 1,
        created_by: 5,
        note_created_datetime: createdDate,
        note_updated_datetime: updatedDate,
        company: { company_name: "Corp" },
      },
    ]);
    mockNoteCount.mockResolvedValue(1);

    const result = await listCompanyNotes({});

    expect(result.notes[0].created_at).toBe("2025-06-01T10:00:00.000Z");
    expect(result.notes[0].updated_at).toBe("2025-06-02T12:00:00.000Z");
  });
});

// ===========================================================================
// getCompanyNote()
// ===========================================================================
describe("getCompanyNote()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns a note when found", async () => {
    mockNoteFindUnique.mockResolvedValue({
      note_uuid: "note-1",
      company_id: 1,
      note_text: "Note content",
      note_type: "Internal Note",
      created_by: 10,
      updated_by: null,
      note_created_datetime: new Date("2025-01-01"),
      note_updated_datetime: new Date("2025-01-02"),
      company: { company_name: "Test Corp" },
    });

    const result = await getCompanyNote("note-1");

    expect(result).not.toBeNull();
    expect(result!.note_uuid).toBe("note-1");
    expect(result!.note_text).toBe("Note content");
    expect(result!.company_name).toBe("Test Corp");
  });

  it("returns null when note not found", async () => {
    mockNoteFindUnique.mockResolvedValue(null);

    const result = await getCompanyNote("nonexistent-uuid");

    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getCompanyNote("")).rejects.toThrow();
  });

  it("handles notes without company relation", async () => {
    mockNoteFindUnique.mockResolvedValue({
      note_uuid: "note-2",
      company_id: null,
      note_text: "Orphaned note",
      note_type: "General",
      created_by: null,
      updated_by: null,
      note_created_datetime: new Date("2025-01-01"),
      note_updated_datetime: null,
      company: null,
    });

    const result = await getCompanyNote("note-2");

    expect(result).not.toBeNull();
    expect(result!.company_id).toBeNull();
    expect(result!.company_name).toBeNull();
  });
});

// ===========================================================================
// createCompanyNote()
// ===========================================================================
describe("createCompanyNote()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockRandomUUID.mockReturnValue("note-uuid-1");
  });

  it("creates a note with all fields", async () => {
    mockNoteCreate.mockResolvedValue({ note_uuid: "note-uuid-1" });

    const result = await createCompanyNote({
      company_id: 1,
      note_text: "Meeting notes",
      note_type: "Internal Note",
      created_by: 10,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockNoteCreate).toHaveBeenCalledWith({
      data: {
        note_uuid: "note-uuid-1",
        company_id: 1,
        note_text: "Meeting notes",
        note_type: "Internal Note",
        created_by: 10,
        note_created_datetime: expect.any(Date),
        note_updated_datetime: expect.any(Date),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes");
    expect(result.note_uuid).toBe("note-uuid-1");
  });

  it("creates a note with minimal fields (defaults note_type)", async () => {
    mockNoteCreate.mockResolvedValue({ note_uuid: "note-uuid-min" });

    const result = await createCompanyNote({
      company_id: 1,
      note_text: "Minimal note",
    });

    expect(mockNoteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          note_type: "Internal Note",
          created_by: null,
        }),
      }),
    );
    expect(result.note_uuid).toBe("note-uuid-min");
  });

  it("throws on missing company_id", async () => {
    await expect(
      createCompanyNote({ note_text: "No company" } as any),
    ).rejects.toThrow();
  });

  it("throws on empty note_text", async () => {
    await expect(
      createCompanyNote({ company_id: 1, note_text: "" }),
    ).rejects.toThrow();
  });

  it("throws on negative company_id", async () => {
    await expect(
      createCompanyNote({ company_id: -1, note_text: "Negative" }),
    ).rejects.toThrow();
  });
});

// ===========================================================================
// updateCompanyNote()
// ===========================================================================
describe("updateCompanyNote()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockNoteUpdate.mockResolvedValue({ note_uuid: "note-1" });
  });

  it("updates note text", async () => {
    const result = await updateCompanyNote({
      noteUuid: "note-1",
      note_text: "Updated text",
    });

    expect(mockNoteUpdate).toHaveBeenCalledWith({
      where: { note_uuid: "note-1" },
      data: expect.objectContaining({
        note_text: "Updated text",
        note_updated_datetime: expect.any(Date),
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes");
    expect(result.note_uuid).toBe("note-1");
  });

  it("updates note type", async () => {
    await updateCompanyNote({
      noteUuid: "note-1",
      note_type: "External Note",
    });

    expect(mockNoteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ note_type: "External Note" }),
      }),
    );
  });

  it("updates both text and type together", async () => {
    await updateCompanyNote({
      noteUuid: "note-1",
      note_text: "New text",
      note_type: "Updated Type",
    });

    expect(mockNoteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          note_text: "New text",
          note_type: "Updated Type",
        }),
      }),
    );
  });

  it("throws on empty UUID", async () => {
    await expect(updateCompanyNote({ noteUuid: "" })).rejects.toThrow();
  });

  it("does not pass undefined fields to prisma update", async () => {
    await updateCompanyNote({ noteUuid: "note-1" });

    const callData = mockNoteUpdate.mock.calls[0][0].data;
    expect(callData).toHaveProperty("updated_by");
    expect(callData).toHaveProperty("note_updated_datetime");
    expect(callData).not.toHaveProperty("note_text");
    expect(callData).not.toHaveProperty("note_type");
  });
});

// ===========================================================================
// deleteCompanyNote()
// ===========================================================================
describe("deleteCompanyNote()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("soft-deletes a note by setting company_id to null", async () => {
    mockNoteUpdate.mockResolvedValue({ note_uuid: "note-1" });

    const result = await deleteCompanyNote("note-1");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockNoteUpdate).toHaveBeenCalledWith({
      where: { note_uuid: "note-1" },
      data: {
        company_id: null,
        note_updated_datetime: expect.any(Date),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes");
    expect(result).toEqual({ success: true });
  });

  it("throws on empty UUID", async () => {
    await expect(deleteCompanyNote("")).rejects.toThrow();
  });
});

// ===========================================================================
// getNoteEntry()
// ===========================================================================
describe("getNoteEntry()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns a note entry with staff info when found", async () => {
    mockNoteFindFirst.mockResolvedValue({
      note_uuid: "note-entry-1",
      company_id: 1,
      request_uuid: null,
      story_uuid: null,
      note_type: "Internal",
      note_text: "Entry content",
      created_by: 10,
      updated_by: null,
      note_created_datetime: new Date("2025-01-01"),
      note_updated_datetime: new Date("2025-01-02"),
    });

    const result = await getNoteEntry("note-entry-1");

    expect(result).not.toBeNull();
    expect(result!.note_uuid).toBe("note-entry-1");
    expect(result!.staff_created).toBeNull();
    expect(result!.staff_updated).toBeNull();
  });

  it("returns null when note not found", async () => {
    mockNoteFindFirst.mockResolvedValue(null);

    const result = await getNoteEntry("nonexistent");

    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getNoteEntry("")).rejects.toThrow();
  });
});

// ===========================================================================
// updateNoteEntry()
// ===========================================================================
describe("updateNoteEntry()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("updates note text and company association", async () => {
    mockNoteFindFirst.mockResolvedValue({ note_uuid: "note-1" });
    mockNoteUpdate.mockResolvedValue({ note_uuid: "note-1" });

    const result = await updateNoteEntry("note-1", "Updated text", 5);

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockNoteUpdate).toHaveBeenCalledWith({
      where: { note_uuid: "note-1" },
      data: {
        note_text: "Updated text",
        company_id: 5,
        note_updated_datetime: expect.any(Date),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes/note-1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes");
    expect(result).toEqual({ success: true });
  });

  it("returns error when note not found", async () => {
    mockNoteFindFirst.mockResolvedValue(null);

    const result = await updateNoteEntry("nonexistent", "Text", 1);

    expect(result).toEqual({ success: false, error: "Note not found" });
    expect(mockNoteUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty UUID", async () => {
    const result = await updateNoteEntry("", "Text", 1);

    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// deleteNoteEntry()
// ===========================================================================
describe("deleteNoteEntry()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("hard-deletes a note entry by UUID", async () => {
    mockNoteFindFirst.mockResolvedValue({ note_uuid: "note-1" });
    mockNoteDelete.mockResolvedValue({ note_uuid: "note-1" });

    const result = await deleteNoteEntry("note-1");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
    expect(mockNoteDelete).toHaveBeenCalledWith({
      where: { note_uuid: "note-1" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/notes");
    expect(result).toEqual({ success: true });
  });

  it("returns error when note not found", async () => {
    mockNoteFindFirst.mockResolvedValue(null);

    const result = await deleteNoteEntry("nonexistent");

    expect(result).toEqual({ success: false, error: "Note not found" });
    expect(mockNoteDelete).not.toHaveBeenCalled();
  });

  it("returns validation error for empty UUID", async () => {
    const result = await deleteNoteEntry("");

    expect(result.success).toBe(false);
  });
});
