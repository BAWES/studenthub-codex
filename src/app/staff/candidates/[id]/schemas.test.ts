import { describe, it, expect } from "vitest";
import {
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("candidateNoteOutputSchema", () => {
  const validNote = {
    uuid: "note_abc-123",
    text: "Candidate needs additional documentation.",
    type: "Internal Note",
    createdBy: 42,
    createdAt: "2026-06-12T10:00:00.000Z",
  };

  it("accepts a valid candidate note with all fields", () => {
    expect(candidateNoteOutputSchema.safeParse(validNote).success).toBe(true);
  });

  it("accepts null createdBy", () => {
    expect(
      candidateNoteOutputSchema.safeParse({
        ...validNote,
        createdBy: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty type", () => {
    expect(
      candidateNoteOutputSchema.safeParse({
        ...validNote,
        type: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validNote;
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing text", () => {
    const { text: _, ...rest } = validNote;
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = validNote;
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdBy", () => {
    const { createdBy: _, ...rest } = validNote;
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = validNote;
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for createdBy", () => {
    expect(
      candidateNoteOutputSchema.safeParse({
        ...validNote,
        createdBy: "42",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(
      candidateNoteOutputSchema.safeParse({
        ...validNote,
        uuid: 123,
      }).success,
    ).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  const validDetail = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+965 5555 0000",
    gender: 1,
    objective: "Seeking a challenging position in software engineering.",
    intro: "Experienced developer with 5 years in the industry.",
    photoUrl: "https://example.com/photos/john.jpg",
    civilId: "284121400123",
    hourlyRate: 25.5,
    countryId: 1,
    universityId: 3,
    birthDate: "2000-01-15",
    createdAt: "2026-06-12T10:00:00.000Z",
    updatedAt: "2026-06-12T10:00:00.000Z",
  };

  it("accepts a valid candidate detail with all fields", () => {
    expect(candidateDetailOutputSchema.safeParse(validDetail).success).toBe(
      true,
    );
  });

  it("accepts null phone", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        phone: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null gender", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        gender: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null objective", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        objective: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null intro", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        intro: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null photoUrl", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        photoUrl: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null civilId", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        civilId: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null hourlyRate", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        hourlyRate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null countryId", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        countryId: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null universityId", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        universityId: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null birthDate", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        birthDate: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updatedAt", () => {
    const { updatedAt: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for email", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        email: 123,
      }).success,
    ).toBe(false);
  });
});

describe("candidateDetailResultOutputSchema", () => {
  const validResult = {
    candidate: {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: null,
      gender: null,
      objective: null,
      intro: null,
      photoUrl: null,
      civilId: null,
      hourlyRate: null,
      countryId: null,
      universityId: null,
      birthDate: null,
      createdAt: "2026-06-12T10:00:00.000Z",
      updatedAt: "2026-06-12T10:00:00.000Z",
    },
    notes: [
      {
        uuid: "note_abc-123",
        text: "Candidate needs additional documentation.",
        type: "Internal Note",
        createdBy: 42,
        createdAt: "2026-06-12T10:00:00.000Z",
      },
    ],
  };

  it("accepts a valid candidate detail result", () => {
    expect(
      candidateDetailResultOutputSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("accepts null candidate", () => {
    expect(
      candidateDetailResultOutputSchema.safeParse({
        ...validResult,
        candidate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty notes array", () => {
    expect(
      candidateDetailResultOutputSchema.safeParse({
        ...validResult,
        notes: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate", () => {
    const { candidate: _, ...rest } = validResult;
    expect(
      candidateDetailResultOutputSchema.safeParse(rest).success,
    ).toBe(false);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = validResult;
    expect(
      candidateDetailResultOutputSchema.safeParse(rest).success,
    ).toBe(false);
  });

  it("rejects candidate with wrong type", () => {
    expect(
      candidateDetailResultOutputSchema.safeParse({
        ...validResult,
        candidate: "not_an_object",
      }).success,
    ).toBe(false);
  });

  it("rejects note item missing uuid", () => {
    const { uuid: _, ...noteMissingUuid } = validResult.notes[0];
    expect(
      candidateDetailResultOutputSchema.safeParse({
        ...validResult,
        notes: [noteMissingUuid],
      }).success,
    ).toBe(false);
  });
});

describe("addNoteResultOutputSchema", () => {
  it("accepts a successful add-note result", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failed add-note result with error message", () => {
    const r = addNoteResultOutputSchema.safeParse({
      success: false,
      error: "Failed to add note",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success:false without error field", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects success with non-boolean value", () => {
    expect(
      addNoteResultOutputSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });

  it("allows extra fields on success:true variant (stripped by Zod)", () => {
    const r = addNoteResultOutputSchema.safeParse({
      success: true,
      error: "Should not have error",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(addNoteResultOutputSchema.safeParse({}).success).toBe(false);
  });
});
