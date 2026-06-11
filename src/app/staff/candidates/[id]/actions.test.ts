import { describe, it, expect } from "vitest";
import {
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateNoteOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateSchema
// ---------------------------------------------------------------------------

describe("getCandidateSchema", () => {
  it("accepts a valid candidate ID", () => {
    const result = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts a string candidate ID (coerced)", () => {
    const result = getCandidateSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects missing candidateId", () => {
    const result = getCandidateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const result = getCandidateSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = getCandidateSchema.safeParse({ candidateId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addCandidateNoteSchema
// ---------------------------------------------------------------------------

describe("addCandidateNoteSchema", () => {
  it("accepts valid note input", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: 42,
      noteText: "Candidate followed up on their application.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.noteText).toBe("Candidate followed up on their application.");
    }
  });

  it("accepts optional note type", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: 42,
      noteText: "Call scheduled",
      noteType: "Phone Call",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Phone Call");
    }
  });

  it("defaults noteType to 'Internal Note'", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: 42,
      noteText: "Quick note",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noteType).toBe("Internal Note");
    }
  });

  it("rejects missing noteText", () => {
    const result = addCandidateNoteSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects empty noteText", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: 42,
      noteText: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const result = addCandidateNoteSchema.safeParse({
      noteText: "Some note",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: -1,
      noteText: "Some note",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only note text", () => {
    const result = addCandidateNoteSchema.safeParse({
      candidateId: 42,
      noteText: "   ",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type CandidateDetail = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: number | null;
  objective: string | null;
  intro: string | null;
  photoUrl: string | null;
  civilId: string | null;
  hourlyRate: number | null;
  countryId: number | null;
  universityId: number | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type CandidateNote = {
  uuid: string;
  text: string;
  type: string;
  createdBy: number | null;
  createdAt: string;
};

type CandidateDetailResult = {
  candidate: CandidateDetail | null;
  notes: CandidateNote[];
};

type AddNoteResult = {
  success: boolean;
  error?: string;
};

describe("CandidateDetail shape", () => {
  it("defines the expected fields", () => {
    const mock: CandidateDetail = {
      id: 42,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      gender: 1,
      objective: "Looking for a software engineering role",
      intro: "Experienced developer",
      photoUrl: null,
      civilId: "CIV123456",
      hourlyRate: 25.5,
      countryId: 1,
      universityId: null,
      birthDate: "1990-01-15",
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-06-01T12:00:00.000Z",
    };
    expect(mock.id).toBe(42);
    expect(mock.name).toBe("John Doe");
    expect(mock.email).toBe("john@example.com");
  });
});

describe("CandidateNote shape", () => {
  it("defines the expected fields", () => {
    const note: CandidateNote = {
      uuid: "note_abc-123",
      text: "Followed up with candidate",
      type: "Internal Note",
      createdBy: 5,
      createdAt: "2025-06-01T12:00:00.000Z",
    };
    expect(note.uuid).toBe("note_abc-123");
    expect(note.text).toBe("Followed up with candidate");
    expect(note.type).toBe("Internal Note");
  });
});

describe("AddNoteResult shape", () => {
  it("accepts a success result", () => {
    const result: AddNoteResult = { success: true };
    expect(result.success).toBe(true);
  });

  it("accepts an error result", () => {
    const result: AddNoteResult = { success: false, error: "Access denied" };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Access denied");
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateNoteOutputSchema", () => {
  it("accepts a valid note", () => {
    const result = candidateNoteOutputSchema.safeParse({
      uuid: "note_abc",
      text: "Followed up",
      type: "Internal Note",
      createdBy: 5,
      createdAt: "2025-06-01T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const result = candidateNoteOutputSchema.safeParse({
      text: "Note",
      type: "Internal",
      createdBy: 5,
      createdAt: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("candidateDetailResultOutputSchema", () => {
  it("accepts a valid detail result with candidate", () => {
    const result = candidateDetailResultOutputSchema.safeParse({
      candidate: {
        id: 42,
        name: "John Doe",
        email: "john@example.com",
        phone: "+965****5678",
        gender: 1,
        objective: "Looking",
        intro: "Hello",
        photoUrl: "https://example.com/photo.jpg",
        civilId: "1234567890",
        hourlyRate: 15,
        countryId: 1,
        universityId: 2,
        birthDate: "1990-01-01T00:00:00.000Z",
        createdAt: "2025-01-10T00:00:00.000Z",
        updatedAt: "2025-06-01T12:00:00.000Z",
      },
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a null candidate result", () => {
    const result = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
      notes: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("addNoteResultOutputSchema", () => {
  it("accepts a success result", () => {
    const result = addNoteResultOutputSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it("accepts an error result", () => {
    const result = addNoteResultOutputSchema.safeParse({ success: false, error: "Access denied" });
    expect(result.success).toBe(true);
  });
});
