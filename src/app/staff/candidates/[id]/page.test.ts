import { describe, it, expect } from "vitest";
import {
  getCandidateSchema,
  addCandidateNoteSchema,
  candidateDetailOutputSchema,
  candidateDetailResultOutputSchema,
  candidateNoteOutputSchema,
  addNoteResultOutputSchema,
} from "./schemas";

/**
 * Page data-contract tests for staff/candidates/[id].
 *
 * The page validates a candidate ID and redirects to the candidate
 * tabs view. The routes's schemas.ts barrel-re-exports server-action
 * schemas from @/modules/candidates/schemas.
 *
 * Tests verify input validation and output shapes for the candidate
 * detail action and note-management actions.
 */

describe("staff/candidates/[id] — input schemas", () => {
  it("getCandidateSchema accepts valid candidate ID", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("getCandidateSchema rejects missing candidateId", () => {
    const r = getCandidateSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema rejects zero candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 0 });
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema rejects negative candidateId", () => {
    const r = getCandidateSchema.safeParse({ candidateId: -1 });
    expect(r.success).toBe(false);
  });

  it("getCandidateSchema coerces string to number", () => {
    const r = getCandidateSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });
});

describe("staff/candidates/[id] — addCandidateNoteSchema", () => {
  it("accepts valid note input", () => {
    const r = addCandidateNoteSchema.safeParse({
      candidateId: 1,
      noteText: "Follow up",
    });
    expect(r.success).toBe(true);
  });

  it("accepts note with custom type", () => {
    const r = addCandidateNoteSchema.safeParse({
      candidateId: 1,
      noteText: "Urgent",
      noteType: "Interview Note",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty note text", () => {
    const r = addCandidateNoteSchema.safeParse({
      candidateId: 1,
      noteText: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects whitespace-only note text", () => {
    const r = addCandidateNoteSchema.safeParse({
      candidateId: 1,
      noteText: "   ",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const r = addCandidateNoteSchema.safeParse({ noteText: "Hi" });
    expect(r.success).toBe(false);
  });
});

describe("staff/candidates/[id] — output schemas", () => {
  it("candidateDetailOutputSchema accepts full candidate object", () => {
    const r = candidateDetailOutputSchema.safeParse({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      phone: "+965 50000000",
      gender: 1,
      objective: "Find a job",
      intro: null,
      photoUrl: null,
      civilId: "123456789",
      hourlyRate: 10.5,
      countryId: null,
      universityId: null,
      birthDate: null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("candidateDetailOutputSchema rejects missing id", () => {
    const r = candidateDetailOutputSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(r.success).toBe(false);
  });

  it("candidateDetailOutputSchema rejects null input", () => {
    const r = candidateDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("candidateNoteOutputSchema accepts valid note", () => {
    const r = candidateNoteOutputSchema.safeParse({
      uuid: "abc-123",
      text: "Contacted",
      type: "Internal Note",
      createdBy: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("candidateNoteOutputSchema allows null createdBy", () => {
    const r = candidateNoteOutputSchema.safeParse({
      uuid: "abc-123",
      text: "Contacted",
      type: "Internal Note",
      createdBy: null,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("candidateDetailResultOutputSchema accepts full result", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
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
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      notes: [
        {
          uuid: "n1",
          text: "Note 1",
          type: "Internal Note",
          createdBy: 1,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("candidateDetailResultOutputSchema accepts null candidate", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("candidateDetailResultOutputSchema rejects missing notes array", () => {
    const r = candidateDetailResultOutputSchema.safeParse({
      candidate: null,
    });
    expect(r.success).toBe(false);
  });

  it("addNoteResultOutputSchema accepts success result", () => {
    const r = addNoteResultOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("addNoteResultOutputSchema accepts error result", () => {
    const r = addNoteResultOutputSchema.safeParse({
      success: false,
      error: "Candidate not found",
    });
    expect(r.success).toBe(true);
  });

  it("addNoteResultOutputSchema rejects empty object", () => {
    const r = addNoteResultOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("addNoteResultOutputSchema rejects null", () => {
    const r = addNoteResultOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
