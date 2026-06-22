import { describe, it, expect } from "vitest";
import {
  getCandidateProfileSchema,
  educationStateResultSchema,
  candidateActionErrorResultSchema,
  changePasswordResultSchema,
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("getCandidateProfileSchema", () => {
  it("accepts a valid positive candidateId (number)", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });

  it("rejects zero candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationStateResultSchema
// ---------------------------------------------------------------------------

describe("educationStateResultSchema", () => {
  it("accepts success: true with no error", () => {
    const r = educationStateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success: false with error message", () => {
    const r = educationStateResultSchema.safeParse({ success: false, error: "Something went wrong." });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
      expect(r.data.error).toBe("Something went wrong.");
    }
  });

  it("accepts success: false without error", () => {
    const r = educationStateResultSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(educationStateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(educationStateResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(educationStateResultSchema.safeParse({ success: false, error: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateActionErrorResultSchema
// ---------------------------------------------------------------------------

describe("candidateActionErrorResultSchema", () => {
  it("accepts empty error string (success case)", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "" });
    expect(r.success).toBe(true);
  });

  it("accepts non-empty error string (failure case)", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "Invalid input." });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.error).toBe("Invalid input.");
  });

  it("rejects missing error field", () => {
    expect(candidateActionErrorResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(candidateActionErrorResultSchema.safeParse({ error: false }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordResultSchema
// ---------------------------------------------------------------------------

describe("changePasswordResultSchema", () => {
  it("accepts success: true", () => {
    const r = changePasswordResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(true);
    }
  });

  it("accepts success: false with error string", () => {
    const r = changePasswordResultSchema.safeParse({ success: false, error: "Incorrect password." });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
    }
  });

  it("accepts success: false with fieldErrors", () => {
    const r = changePasswordResultSchema.safeParse({
      success: false,
      fieldErrors: { currentPassword: ["Required"] },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(false);
    }
  });

  it("rejects success: false missing both error and fieldErrors", () => {
    const r = changePasswordResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("accepts success: false with both error and fieldErrors (union picks first match)", () => {
    // z.union matches the first fitting variant; extra keys are allowed,
    // so {success:false, error, fieldErrors} matches the error variant.
    const r = changePasswordResultSchema.safeParse({
      success: false,
      error: "Nope",
      fieldErrors: { x: ["y"] },
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(changePasswordResultSchema.safeParse({ success: 1 }).success).toBe(false);
  });
});

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
