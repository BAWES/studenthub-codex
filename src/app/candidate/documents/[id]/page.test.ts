import { describe, it, expect } from "vitest";
import { documentDetailSchema } from "./schemas";

describe("candidate/documents/[id] — data contract", () => {
  it("documentDetailSchema validates a valid document detail item", () => {
    const r = documentDetailSchema.safeParse({
      type: "cv",
      label: "CV / Resume",
      filePath: "/uploads/candidates/1/cv_abc123.pdf",
      fileUrl: "/uploads/candidates/1/cv_abc123.pdf",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("cv");
      expect(r.data.label).toBe("CV / Resume");
    }
  });

  it("documentDetailSchema validates with null file fields (not uploaded)", () => {
    const r = documentDetailSchema.safeParse({
      type: "photo",
      label: "Personal Photo",
      filePath: null,
      fileUrl: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.filePath).toBeNull();
      expect(r.data.fileUrl).toBeNull();
    }
  });

  it("documentDetailSchema rejects missing required fields", () => {
    const r = documentDetailSchema.safeParse({
      type: "cv",
    });
    expect(r.success).toBe(false);
  });

  it("documentDetailSchema rejects invalid document type", () => {
    const r = documentDetailSchema.safeParse({
      type: "invalid_type",
      label: "Test",
      filePath: null,
      fileUrl: null,
    });
    expect(r.success).toBe(false);
  });

  it("documentDetailSchema rejects non-string label", () => {
    const r = documentDetailSchema.safeParse({
      type: "cv",
      label: 123,
      filePath: null,
      fileUrl: null,
    });
    expect(r.success).toBe(false);
  });
});
