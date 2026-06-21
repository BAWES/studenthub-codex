import { describe, it, expect } from "vitest";
import {
  idCardDownloadSchema,
  buildIdCardDownloadUrl,
  validateAndBuildIdCardUrl,
  buildCvDownloadUrl,
  validateAndBuildCvUrl,
} from "./schemas";

describe("admin documents — ID card download schema", () => {
  it("accepts numeric candidate ID as number", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: 123 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(123);
    }
  });

  it("accepts numeric candidate ID as string", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: "456" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(456);
    }
  });

  it("rejects non-numeric candidate ID", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects zero candidate ID", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative candidate ID", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: -5 });
    expect(r.success).toBe(false);
  });

  it("rejects empty string candidate ID", () => {
    const r = idCardDownloadSchema.safeParse({ candidateId: "" });
    expect(r.success).toBe(false);
  });
});

describe("admin documents — ID card URL builders", () => {
  it("buildIdCardDownloadUrl constructs correct URL", () => {
    expect(buildIdCardDownloadUrl(789)).toBe("/api/candidates/789/id-card/pdf?format=pdf");
  });

  it("validateAndBuildIdCardUrl returns URL and filename", () => {
    const result = validateAndBuildIdCardUrl({ candidateId: 999 });
    expect(result.url).toBe("/api/candidates/999/id-card/pdf?format=pdf");
    expect(result.filename).toBe("id-card-candidate-999.pdf");
  });

  it("validateAndBuildIdCardUrl throws on invalid input", () => {
    expect(() => validateAndBuildIdCardUrl({ candidateId: -1 })).toThrow();
  });
});

describe("admin documents — CV URL builders", () => {
  it("buildCvDownloadUrl constructs correct URL", () => {
    expect(buildCvDownloadUrl(789)).toBe("/api/candidates/789/cv/pdf?format=pdf");
  });

  it("validateAndBuildCvUrl returns URL and filename", () => {
    const result = validateAndBuildCvUrl({ candidateId: 999 });
    expect(result.url).toBe("/api/candidates/999/cv/pdf?format=pdf");
    expect(result.filename).toBe("cv-candidate-999.pdf");
  });

  it("validateAndBuildCvUrl throws on invalid input", () => {
    expect(() => validateAndBuildCvUrl({ candidateId: -1 })).toThrow();
  });
});
