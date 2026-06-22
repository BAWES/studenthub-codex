import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getCandidateProfileSchema,
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
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateNoteOutputSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  addNoteResultOutputSchema,
  type CandidateDetail,
  type CandidateNote,
  type CandidateDetailResult,
  type AddNoteResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidDetail(
  overrides: Partial<CandidateDetail> = {},
): CandidateDetail {
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+965 5555 1234",
    gender: 1,
    objective: "Seeking a challenging role",
    intro: "Experienced developer",
    photoUrl: "https://example.com/photo.jpg",
    civilId: "284120500123",
    hourlyRate: 15.5,
    countryId: 1,
    universityId: 5,
    birthDate: "1990-01-01",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-01T12:00:00Z",
    ...overrides,
  };
}

function makeValidNote(
  overrides: Partial<CandidateNote> = {},
): CandidateNote {
  return {
    uuid: "note_abc123",
    text: "Great candidate",
    type: "Internal Note",
    createdBy: 1,
    createdAt: "2024-02-10T14:30:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("getCandidateProfileSchema", () => {
  it("accepts a valid candidate ID (number)", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: 42 }).success).toBe(true);
  });

  it("coerces a string candidate ID to number", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: "42" }).success).toBe(true);
  });

  it("rejects a negative candidate ID", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects zero", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getCandidateProfileSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({}).success).toBe(false);
  });
});

describe("getCandidateSchema", () => {
  it("accepts a valid candidate ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 99 }).success).toBe(true);
  });

  it("coerces a string to number", () => {
    expect(getCandidateSchema.safeParse({ candidateId: "99" }).success).toBe(true);
  });

  it("rejects a negative ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: -5 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateSchema.safeParse({}).success).toBe(false);
  });
});

describe("addCandidateNoteSchema", () => {
  it("accepts a valid note input", () => {
    expect(
      addCandidateNoteSchema.safeParse({
        candidateId: 1,
        noteText: "  Follow up with candidate  ",
        noteType: "Phone Call",
      }).success,
    ).toBe(true);
  });

  it("defaults noteType to 'Internal Note' when omitted", () => {
    const parsed = addCandidateNoteSchema.safeParse({ candidateId: 1, noteText: "Note" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.noteType).toBe("Internal Note");
    }
  });

  it("rejects empty trimmed noteText", () => {
    expect(
      addCandidateNoteSchema.safeParse({ candidateId: 1, noteText: "   " }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      addCandidateNoteSchema.safeParse({ noteText: "Note" }).success,
    ).toBe(false);
  });

  it("rejects missing noteText", () => {
    expect(
      addCandidateNoteSchema.safeParse({ candidateId: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output / result schemas
// ---------------------------------------------------------------------------

describe("updateCandidateProfileResultSchema", () => {
  it("accepts a success result", () => {
    expect(
      updateCandidateProfileResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts a failure result with fieldErrors", () => {
    expect(
      updateCandidateProfileResultSchema.safeParse({
        success: false,
        fieldErrors: { name: ["Name is required"] },
      }).success,
    ).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(
      updateCandidateProfileResultSchema.safeParse({ success: "true" }).success,
    ).toBe(false);
  });
});

describe("candidateErrorResultSchema", () => {
  it("accepts an error result", () => {
    expect(
      candidateErrorResultSchema.safeParse({ error: "Something went wrong" }).success,
    ).toBe(true);
  });

  it("rejects missing error", () => {
    expect(candidateErrorResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string error", () => {
    expect(candidateErrorResultSchema.safeParse({ error: 42 }).success).toBe(false);
  });
});

describe("candidateLanguageResultSchema", () => {
  it("accepts a success result", () => {
    expect(
      candidateLanguageResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts a failure result with error", () => {
    expect(
      candidateLanguageResultSchema.safeParse({ success: false, error: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(
      candidateLanguageResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});

describe("educationStateResultSchema", () => {
  it("accepts a success result", () => {
    expect(
      educationStateResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts a failure result with error", () => {
    expect(
      educationStateResultSchema.safeParse({ success: false, error: "Invalid degree" }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(educationStateResultSchema.safeParse({}).success).toBe(false);
  });
});

describe("candidateActionErrorResultSchema", () => {
  it("accepts a result with error", () => {
    expect(
      candidateActionErrorResultSchema.safeParse({ error: "" }).success,
    ).toBe(true);
  });

  it("accepts a result with a non-empty error", () => {
    expect(
      candidateActionErrorResultSchema.safeParse({ error: "Action failed" }).success,
    ).toBe(true);
  });

  it("rejects missing error", () => {
    expect(candidateActionErrorResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordResultSchema — z.union of 3 variants
// ---------------------------------------------------------------------------

describe("changePasswordResultSchema", () => {
  it("accepts success variant", () => {
    expect(
      changePasswordResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error variant with error string", () => {
    expect(
      changePasswordResultSchema.safeParse({ success: false, error: "Wrong password" }).success,
    ).toBe(true);
  });

  it("accepts fieldErrors variant", () => {
    expect(
      changePasswordResultSchema.safeParse({
        success: false,
        fieldErrors: { oldPassword: ["Incorrect"] },
      }).success,
    ).toBe(true);
  });

  it("accepts success:true with extra fields (Zod strips unknown)", () => {
    // z.union tries each variant; the success variant uses z.object({ success: z.literal(true) })
    // which strips unknown keys by default, so this passes.
    expect(
      changePasswordResultSchema.safeParse({ success: true, error: "extra" }).success,
    ).toBe(true);
  });

  it("rejects untyped success value", () => {
    expect(
      changePasswordResultSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Array schemas
// ---------------------------------------------------------------------------

describe("getCountryOptionsResultSchema", () => {
  it("accepts an array of options", () => {
    expect(
      getCountryOptionsResultSchema.safeParse([
        { id: 1, label: "Kuwait" },
        { id: 2, label: "Egypt" },
      ]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(getCountryOptionsResultSchema.safeParse([]).success).toBe(true);
  });

  it("rejects items with missing id", () => {
    expect(
      getCountryOptionsResultSchema.safeParse([{ label: "Kuwait" }]).success,
    ).toBe(false);
  });

  it("rejects items with non-number id", () => {
    expect(
      getCountryOptionsResultSchema.safeParse([{ id: "abc", label: "Kuwait" }]).success,
    ).toBe(false);
  });

  it("rejects non-array input", () => {
    expect(getCountryOptionsResultSchema.safeParse("not-array").success).toBe(false);
  });
});

describe("getUniversityOptionsResultSchema", () => {
  it("accepts an array of options", () => {
    expect(
      getUniversityOptionsResultSchema.safeParse([
        { id: 10, label: "KU" },
        { id: 11, label: "AUK" },
      ]).success,
    ).toBe(true);
  });
});

describe("getBankOptionsResultSchema", () => {
  it("accepts an array of options", () => {
    expect(
      getBankOptionsResultSchema.safeParse([{ id: 1, label: "NBK" }]).success,
    ).toBe(true);
  });
});

describe("getDegreeOptionsResultSchema", () => {
  it("accepts an array of uuid-based options", () => {
    expect(
      getDegreeOptionsResultSchema.safeParse([
        { id: "uuid-1", label: "Bachelor" },
      ]).success,
    ).toBe(true);
  });

  it("rejects items with number id (string expected)", () => {
    expect(
      getDegreeOptionsResultSchema.safeParse([{ id: 1, label: "Bachelor" }]).success,
    ).toBe(false);
  });
});

describe("getMajorOptionsResultSchema", () => {
  it("accepts an array of uuid-based options", () => {
    expect(
      getMajorOptionsResultSchema.safeParse([
        { id: "uuid-abc", label: "CS" },
      ]).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// candidateNoteOutputSchema
// ---------------------------------------------------------------------------

describe("candidateNoteOutputSchema", () => {
  it("accepts a valid note", () => {
    expect(candidateNoteOutputSchema.safeParse(makeValidNote()).success).toBe(true);
  });

  it("accepts nullable createdBy", () => {
    expect(
      candidateNoteOutputSchema.safeParse(makeValidNote({ createdBy: null })).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = makeValidNote();
    expect(candidateNoteOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number createdBy", () => {
    expect(
      candidateNoteOutputSchema.safeParse(makeValidNote({ createdBy: "abc" as any })).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailOutputSchema
// ---------------------------------------------------------------------------

describe("candidateDetailOutputSchema", () => {
  it("accepts a valid candidate detail", () => {
    expect(candidateDetailOutputSchema.safeParse(makeValidDetail()).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      candidateDetailOutputSchema.safeParse(
        makeValidDetail({
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
        }),
      ).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = makeValidDetail();
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number id", () => {
    expect(
      candidateDetailOutputSchema.safeParse(makeValidDetail({ id: "abc" as any })).success,
    ).toBe(false);
  });

  it("rejects non-integer hourlyRate (number should be fine though)", () => {
    // hourlyRate is z.number().nullable() — float is fine
    expect(
      candidateDetailOutputSchema.safeParse(makeValidDetail({ hourlyRate: 15.75 })).success,
    ).toBe(true);
  });

  it("rejects non-string email", () => {
    expect(
      candidateDetailOutputSchema.safeParse(makeValidDetail({ email: 123 as any })).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailResultOutputSchema — composite
// ---------------------------------------------------------------------------

describe("candidateDetailResultOutputSchema", () => {
  it("accepts a valid result with candidate + notes", () => {
    const result: CandidateDetailResult = {
      candidate: makeValidDetail(),
      notes: [makeValidNote(), makeValidNote({ uuid: "note_2" })],
    };
    expect(candidateDetailResultOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts a result with null candidate", () => {
    const result: CandidateDetailResult = {
      candidate: null,
      notes: [],
    };
    expect(candidateDetailResultOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects missing candidate field", () => {
    const parsed = candidateDetailResultOutputSchema.safeParse({
      notes: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing notes field", () => {
    const parsed = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid note inside the array", () => {
    const parsed = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
      notes: [{ uuid: 123, text: "Note", type: "T", createdBy: null, createdAt: "now" }],
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addNoteResultOutputSchema — discriminated union
// ---------------------------------------------------------------------------

describe("addNoteResultOutputSchema", () => {
  it("accepts a success result", () => {
    const result: AddNoteResult = { success: true };
    expect(addNoteResultOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts an error result", () => {
    const result: AddNoteResult = { success: false, error: "Note not found" };
    expect(addNoteResultOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(addNoteResultOutputSchema.safeParse({ error: "err" }).success).toBe(false);
  });

  it("accepts success:true with error field (Zod strips unknown)", () => {
    // discriminatedUnion — the success:true variant is z.object({ success: z.literal(true) })
    // which strips unknown keys by default.
    expect(addNoteResultOutputSchema.safeParse({ success: true, error: "extra" }).success).toBe(true);
  });
});
