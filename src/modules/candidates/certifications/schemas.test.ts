import { describe, it, expect } from "vitest";
import {
  candidateCertificationItemSchema,
  listCandidateCertificationsResultSchema,
  candidateCertificationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateCertificationItemSchema
// ---------------------------------------------------------------------------

describe("candidateCertificationItemSchema", () => {
  const validItem = () => ({
    certification_id: 1,
    candidate_id: 123,
    certification_name: "AWS Certified",
    issuing_organization: "Amazon",
    issue_date: new Date("2026-01-01"),
    expiry_date: new Date("2029-01-01"),
    credential_id: "CRED-001",
    credential_url: "https://example.com/cred",
    description: "Cloud certification",
    deleted: 0,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  });

  it("accepts a valid certification item", () => {
    const r = candidateCertificationItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateCertificationItemSchema.safeParse({
      ...validItem(),
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing certification_id", () => {
    const { certification_id: _, ...rest } = validItem();
    expect(candidateCertificationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer deleted", () => {
    expect(
      candidateCertificationItemSchema.safeParse({ ...validItem(), deleted: "no" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateCertificationsResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateCertificationsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listCandidateCertificationsResultSchema.safeParse({
      items: [{
        certification_id: 1,
        candidate_id: 1,
        certification_name: "AWS",
        issuing_organization: "Amazon",
        issue_date: null,
        expiry_date: null,
        credential_id: null,
        credential_url: null,
        description: null,
        deleted: 0,
        created_at: null,
        updated_at: null,
      }],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listCandidateCertificationsResultSchema.safeParse({
      items: [], total: 0, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listCandidateCertificationsResultSchema.safeParse({
      items: [], total: -1, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateCertificationActionResultSchema
// ---------------------------------------------------------------------------

describe("candidateCertificationActionResultSchema", () => {
  it("accepts success with certificationId", () => {
    const r = candidateCertificationActionResultSchema.safeParse({ success: true, certificationId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects success without certificationId", () => {
    const r = candidateCertificationActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = candidateCertificationActionResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = candidateCertificationActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
