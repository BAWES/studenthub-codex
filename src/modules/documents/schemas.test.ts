import { describe, it, expect } from "vitest";
import {
  documentItemSchema,
  documentDetailSchema,
  listDocumentsResultSchema,
  uploadDocumentResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validDocumentItem = () => ({
  file_uuid: "550e8400-e29b-41d4-a716-446655440000",
  company_id: 1,
  file_title: "Employment Contract",
  file_description: "Signed employment contract for new hire",
  file_name: "contract.pdf",
  file_type: "application/pdf",
  file_size: 102400,
  file_s3_path: "documents/contract.pdf",
  file_created_datetime: new Date("2026-06-14"),
});

const validDocumentItemMinimal = () => ({
  file_uuid: "550e8400-e29b-41d4-a716-446655440000",
  company_id: null,
  file_title: "Contract",
  file_description: null,
  file_name: null,
  file_type: null,
  file_size: null,
  file_s3_path: null,
  file_created_datetime: new Date("2026-06-14"),
});

// ---------------------------------------------------------------------------
// documentItemSchema
// ---------------------------------------------------------------------------

describe("documentItemSchema", () => {
  it("accepts a full document item", () => {
    const r = documentItemSchema.safeParse(validDocumentItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal document item (nullable fields set to null)", () => {
    const r = documentItemSchema.safeParse(validDocumentItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = documentItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = documentItemSchema.safeParse({
      ...validDocumentItem(),
      file_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing file_uuid", () => {
    const r = documentItemSchema.safeParse({
      ...validDocumentItem(),
      file_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing file_title", () => {
    const r = documentItemSchema.safeParse({
      ...validDocumentItem(),
      file_title: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string file_title when provided", () => {
    const r = documentItemSchema.safeParse({
      ...validDocumentItem(),
      file_title: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-null file_type when not a string", () => {
    const r = documentItemSchema.safeParse({
      ...validDocumentItem(),
      file_type: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// documentDetailSchema
// ---------------------------------------------------------------------------

describe("documentDetailSchema", () => {
  it("accepts a full document item", () => {
    const r = documentDetailSchema.safeParse(validDocumentItem());
    expect(r.success).toBe(true);
  });

  it("accepts null (document not found)", () => {
    const r = documentDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = documentDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDocumentsResultSchema
// ---------------------------------------------------------------------------

describe("listDocumentsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [validDocumentItem(), validDocumentItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty documents array", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listDocumentsResultSchema.safeParse({ documents: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [],
      total: "not-a-number",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number page", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [],
      total: 0,
      page: "first",
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid document items in the array", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [{ file_uuid: 123 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listDocumentsResultSchema.safeParse({
      documents: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// uploadDocumentResultSchema
// ---------------------------------------------------------------------------

describe("uploadDocumentResultSchema", () => {
  it("accepts a full upload result", () => {
    const r = uploadDocumentResultSchema.safeParse({
      file_uuid: "550e8400-e29b-41d4-a716-446655440000",
      file_s3_path: "documents/contract.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a result with null s3 path", () => {
    const r = uploadDocumentResultSchema.safeParse({
      file_uuid: "550e8400-e29b-41d4-a716-446655440000",
      file_s3_path: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = uploadDocumentResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string file_uuid", () => {
    const r = uploadDocumentResultSchema.safeParse({
      file_uuid: 123,
      file_s3_path: null,
    });
    expect(r.success).toBe(false);
  });
});
