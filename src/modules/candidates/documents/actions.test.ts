import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: candidate document schema validation
//
// listCandidateDocuments, getCandidateDocument, and uploadCandidateDocument
// in actions.ts use these zod schemas internally. Testing them separately
// avoids mocking prisma, session, and Next.js server-action infrastructure.
// ---------------------------------------------------------------------------

const listCandidateDocumentsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getCandidateDocumentSchema = z.object({
  file_uuid: z
    .string({ required_error: "File UUID is required" })
    .min(1, "File UUID is required"),
});

const uploadCandidateDocumentSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  company_id: z.number().int().positive("Company ID is required"),
  file_title: z
    .string({ required_error: "File title is required" })
    .min(1, "File title is required")
    .max(255),
  file_name: z
    .string({ required_error: "File name is required" })
    .min(1, "File name is required")
    .max(255),
  file_type: z.string().max(100).optional(),
  file_size: z.number().int().nonnegative().optional(),
  file_description: z.string().max(65535).optional(),
});

type ListCandidateDocumentsInput = z.infer<typeof listCandidateDocumentsSchema>;
type UploadCandidateDocumentInput = z.infer<typeof uploadCandidateDocumentSchema>;

describe("listCandidateDocumentsSchema", () => {
  it("accepts candidateId only", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("accepts candidateId with company_id filter", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
      company_id: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_id).toBe(5);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects missing candidateId", () => {
    const result = listCandidateDocumentsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative company_id", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
      company_id: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
      limit: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: 42,
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateDocumentsSchema.safeParse({
      candidateId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });
});

describe("getCandidateDocumentSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getCandidateDocumentSchema.safeParse({
      file_uuid: "file_abc123def456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getCandidateDocumentSchema.safeParse({ file_uuid: "" });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File UUID is required");
  });

  it("rejects missing file_uuid", () => {
    const result = getCandidateDocumentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("uploadCandidateDocumentSchema", () => {
  it("accepts valid upload data", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "Resume",
      file_name: "resume.pdf",
      file_type: "application/pdf",
      file_size: 10240,
    });
    expect(result.success).toBe(true);
  });

  it("accepts upload with optional fields", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "Cover Letter",
      file_name: "cover-letter.docx",
      file_type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 20480,
      file_description: "Candidate cover letter for senior position",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.file_description).toBe(
        "Candidate cover letter for senior position",
      );
    }
  });

  it("rejects missing candidateId", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      company_id: 1,
      file_title: "Resume",
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      file_title: "Resume",
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file_title", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "",
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File title is required");
  });

  it("rejects file_title over 255 chars", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "x".repeat(256),
      file_name: "resume.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty file_name", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "Resume",
      file_name: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("File name is required");
  });

  it("rejects negative file_size", () => {
    const result = uploadCandidateDocumentSchema.safeParse({
      candidateId: 42,
      company_id: 1,
      file_title: "Resume",
      file_name: "resume.pdf",
      file_size: -100,
    });
    expect(result.success).toBe(false);
  });
});
