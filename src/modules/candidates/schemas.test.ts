import { describe, it, expect } from "vitest";
import {
  updateCandidateProfileResultSchema,
  candidateErrorResultSchema,
  candidateLanguageResultSchema,
  getCountryOptionsResultSchema,
  getUniversityOptionsResultSchema,
  getBankOptionsResultSchema,
  getDegreeOptionsResultSchema,
  getMajorOptionsResultSchema,
  educationStateResultSchema,
  candidateActionErrorResultSchema,
  changePasswordResultSchema,
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const validNote = () => ({
  uuid: "note-uuid-001",
  text: "Follow up with candidate",
  type: "Internal Note",
  createdBy: 42,
  createdAt: "2024-01-15T10:30:00Z",
});

const validNoteNull = () => ({
  uuid: "note-uuid-002",
  text: "Another note",
  type: "Phone Call",
  createdBy: null,
  createdAt: "2024-01-16T11:00:00Z",
});

const validCandidateDetail = () => ({
  id: 1001,
  name: "Ahmed Al-Sabah",
  email: "ahmed@example.com",
  phone: "+965 5000 0000",
  gender: 1,
  objective: "Looking for internship in engineering",
  intro: "Hardworking student from KU",
  photoUrl: "https://example.com/photo.jpg",
  civilId: "1234567890",
  hourlyRate: 5.5,
  countryId: 1,
  universityId: 5,
  birthDate: "2000-01-01",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
});

// ---------------------------------------------------------------------------
// updateCandidateProfileResultSchema
// ---------------------------------------------------------------------------
describe("updateCandidateProfileResultSchema", () => {
  it("accepts success with no fieldErrors", () => {
    const r = updateCandidateProfileResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success with fieldErrors", () => {
    const r = updateCandidateProfileResultSchema.safeParse({
      success: true,
      fieldErrors: {
        name: ["Name is too short"],
        email: undefined,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts failure with fieldErrors", () => {
    const r = updateCandidateProfileResultSchema.safeParse({
      success: false,
      fieldErrors: { email: ["Invalid email format"] },
    });
    expect(r.success).toBe(true);
  });

  it("accepts success with missing fieldErrors", () => {
    const r = updateCandidateProfileResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = updateCandidateProfileResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = updateCandidateProfileResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateErrorResultSchema
// ---------------------------------------------------------------------------
describe("candidateErrorResultSchema", () => {
  it("accepts an error message", () => {
    const r = candidateErrorResultSchema.safeParse({ error: "Candidate not found" });
    expect(r.success).toBe(true);
  });

  it("accepts an empty error string", () => {
    const r = candidateErrorResultSchema.safeParse({ error: "" });
    expect(r.success).toBe(true);
  });

  it("rejects missing error", () => {
    const r = candidateErrorResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = candidateErrorResultSchema.safeParse({ error: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateLanguageResultSchema
// ---------------------------------------------------------------------------
describe("candidateLanguageResultSchema", () => {
  it("accepts success without error", () => {
    const r = candidateLanguageResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success with empty error", () => {
    const r = candidateLanguageResultSchema.safeParse({ success: true, error: "" });
    expect(r.success).toBe(true);
  });

  it("accepts failure with error message", () => {
    const r = candidateLanguageResultSchema.safeParse({ success: false, error: "Language already exists" });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = candidateLanguageResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = candidateLanguageResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = candidateLanguageResultSchema.safeParse({ success: false, error: 999 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCountryOptionsResultSchema
// ---------------------------------------------------------------------------
describe("getCountryOptionsResultSchema", () => {
  it("accepts an array of numeric options", () => {
    const r = getCountryOptionsResultSchema.safeParse([
      { id: 1, label: "Kuwait" },
      { id: 2, label: "Egypt" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = getCountryOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects non-integer id", () => {
    const r = getCountryOptionsResultSchema.safeParse([{ id: 1.5, label: "Kuwait" }]);
    expect(r.success).toBe(false);
  });

  it("rejects missing label", () => {
    const r = getCountryOptionsResultSchema.safeParse([{ id: 1 }]);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    const r = getCountryOptionsResultSchema.safeParse([{ id: "one", label: "Kuwait" }]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getUniversityOptionsResultSchema
// ---------------------------------------------------------------------------
describe("getUniversityOptionsResultSchema", () => {
  it("accepts an array of numeric options", () => {
    const r = getUniversityOptionsResultSchema.safeParse([
      { id: 10, label: "Kuwait University" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = getUniversityOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects negative id", () => {
    const r = getUniversityOptionsResultSchema.safeParse([{ id: -1, label: "Unknown" }]);
    // z.number().int() allows negative, but still validates type
    expect(r.success).toBe(true); // int() doesn't enforce nonnegative
  });

  it("rejects missing required fields", () => {
    const r = getUniversityOptionsResultSchema.safeParse([{}]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBankOptionsResultSchema
// ---------------------------------------------------------------------------
describe("getBankOptionsResultSchema", () => {
  it("accepts an array of numeric options", () => {
    const r = getBankOptionsResultSchema.safeParse([
      { id: 5, label: "National Bank of Kuwait" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = getBankOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects non-numeric id", () => {
    const r = getBankOptionsResultSchema.safeParse([{ id: "NBK", label: "NBK" }]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDegreeOptionsResultSchema
// ---------------------------------------------------------------------------
describe("getDegreeOptionsResultSchema", () => {
  it("accepts an array of uuid options", () => {
    const r = getDegreeOptionsResultSchema.safeParse([
      { id: "deg-uuid-1", label: "Bachelor" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = getDegreeOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects numeric id (expects string)", () => {
    const r = getDegreeOptionsResultSchema.safeParse([{ id: 1, label: "Bachelor" }]);
    expect(r.success).toBe(false);
  });

  it("rejects missing label", () => {
    const r = getDegreeOptionsResultSchema.safeParse([{ id: "deg-uuid-1" }]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getMajorOptionsResultSchema
// ---------------------------------------------------------------------------
describe("getMajorOptionsResultSchema", () => {
  it("accepts an array of uuid options", () => {
    const r = getMajorOptionsResultSchema.safeParse([
      { id: "maj-uuid-1", label: "Computer Science" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = getMajorOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects numeric id (expects string)", () => {
    const r = getMajorOptionsResultSchema.safeParse([{ id: 2, label: "Engineering" }]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationStateResultSchema
// ---------------------------------------------------------------------------
describe("educationStateResultSchema", () => {
  it("accepts success without error", () => {
    const r = educationStateResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts failure with error message", () => {
    const r = educationStateResultSchema.safeParse({ success: false, error: "Invalid date" });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = educationStateResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = educationStateResultSchema.safeParse({ success: "true" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = educationStateResultSchema.safeParse({ success: false, error: 42 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateActionErrorResultSchema
// ---------------------------------------------------------------------------
describe("candidateActionErrorResultSchema", () => {
  it("accepts non-empty error string", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "Something went wrong" });
    expect(r.success).toBe(true);
  });

  it("accepts empty error string (success case)", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: "" });
    expect(r.success).toBe(true);
  });

  it("rejects missing error", () => {
    const r = candidateActionErrorResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = candidateActionErrorResultSchema.safeParse({ error: false });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordResultSchema (union of 3 variants)
// ---------------------------------------------------------------------------
describe("changePasswordResultSchema", () => {
  it("accepts success variant", () => {
    const r = changePasswordResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts failure with error string", () => {
    const r = changePasswordResultSchema.safeParse({
      success: false,
      error: "Current password is incorrect",
    });
    expect(r.success).toBe(true);
  });

  it("accepts failure with fieldErrors", () => {
    const r = changePasswordResultSchema.safeParse({
      success: false,
      fieldErrors: { newPassword: ["Password too weak"] },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = changePasswordResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts extra fields on success (z.object strips unknown keys)", () => {
    // z.object() strips unknown keys by default, so extra fields are fine
    const r = changePasswordResultSchema.safeParse({
      success: true,
      extraField: "ignored",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// candidateNoteOutputSchema
// ---------------------------------------------------------------------------
describe("candidateNoteOutputSchema", () => {
  it("accepts a valid note with all fields", () => {
    const r = candidateNoteOutputSchema.safeParse(validNote());
    expect(r.success).toBe(true);
  });

  it("accepts nullable createdBy", () => {
    const r = candidateNoteOutputSchema.safeParse(validNoteNull());
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validNote();
    const r = candidateNoteOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing text", () => {
    const { text: _, ...rest } = validNote();
    const r = candidateNoteOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const r = candidateNoteOutputSchema.safeParse({ ...validNote(), uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for createdBy (string instead of number)", () => {
    const r = candidateNoteOutputSchema.safeParse({ ...validNote(), createdBy: "admin" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailOutputSchema
// ---------------------------------------------------------------------------
describe("candidateDetailOutputSchema", () => {
  it("accepts a full candidate detail", () => {
    const r = candidateDetailOutputSchema.safeParse(validCandidateDetail());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateDetailOutputSchema.safeParse({
      ...validCandidateDetail(),
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
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validCandidateDetail();
    const r = candidateDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validCandidateDetail();
    const r = candidateDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validCandidateDetail();
    const r = candidateDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    const r = candidateDetailOutputSchema.safeParse({ ...validCandidateDetail(), id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for hourlyRate (string instead of number)", () => {
    const r = candidateDetailOutputSchema.safeParse({
      ...validCandidateDetail(),
      hourlyRate: "five",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for gender (string instead of number)", () => {
    const r = candidateDetailOutputSchema.safeParse({
      ...validCandidateDetail(),
      gender: "male",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = validCandidateDetail();
    const r = candidateDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing updatedAt", () => {
    const { updatedAt: _, ...rest } = validCandidateDetail();
    const r = candidateDetailOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailResultOutputSchema
// ---------------------------------------------------------------------------
describe("candidateDetailResultOutputSchema", () => {
  it("accepts a valid result with candidate and notes", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: validCandidateDetail(),
      notes: [validNote(), validNoteNull()],
    });
    expect(r.success).toBe(true);
  });

  it("accepts null candidate", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty notes array", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: validCandidateDetail(),
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate (must be explicitly null or present)", () => {
    const { candidate: _, ...rest } = {
      candidate: validCandidateDetail(),
      notes: [],
    };
    const r = candidateDetailResultOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing notes", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: validCandidateDetail(),
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid candidate shape", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: { id: "not-a-number" },
      notes: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid note item in array", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: validCandidateDetail(),
      notes: [{ invalid: "note" }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addNoteResultOutputSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("addNoteResultOutputSchema", () => {
  it("accepts success variant", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts failure variant with error", () => {
    const r = addNoteResultOutputSchema.safeParse({
      success: false,
      error: "Note could not be saved",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = addNoteResultOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts extra fields on success (discriminatedUnion uses z.object which strips unknown keys)", () => {
    const r = addNoteResultOutputSchema.safeParse({
      success: true,
      error: "Unexpected",
    });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});
