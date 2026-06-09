import { describe, it, expect } from "vitest";
import {
  listComplianceRecordsSchema,
  getComplianceRecordSchema,
  createComplianceRecordSchema,
  updateComplianceRecordSchema,
  approveComplianceSchema,
  denyComplianceSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// listComplianceRecordsSchema
// ---------------------------------------------------------------------------

describe("listComplianceRecordsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listComplianceRecordsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.type).toBe("all");
    }
  });

  it("accepts type filter", () => {
    const r = listComplianceRecordsSchema.safeParse({ type: "company" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.type).toBe("company");
  });

  it("accepts status filter", () => {
    const r = listComplianceRecordsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const r = listComplianceRecordsSchema.safeParse({ type: "invalid" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("getComplianceRecordSchema", () => {
  it("accepts valid id + type", () => {
    const r = getComplianceRecordSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = getComplianceRecordSchema.safeParse({ type: "company" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const r = getComplianceRecordSchema.safeParse({
      id: "42",
      type: "invalid",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("createComplianceRecordSchema", () => {
  it("accepts valid company data", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_approved_to_hire).toBe(false);
    }
  });

  it("accepts all fields", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
      company_email: "info@acme.example.com",
      company_approved_to_hire: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_name", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = createComplianceRecordSchema.safeParse({
      type: "company",
      company_name: "Acme Corp",
      company_email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateComplianceRecordSchema
// ---------------------------------------------------------------------------

describe("updateComplianceRecordSchema", () => {
  it("accepts valid company update", () => {
    const r = updateComplianceRecordSchema.safeParse({
      id: "42",
      type: "company",
      company_approved_to_hire: true,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_approved_to_hire).toBe(true);
  });

  it("rejects missing id", () => {
    const r = updateComplianceRecordSchema.safeParse({
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const r = updateComplianceRecordSchema.safeParse({
      id: "42",
      type: "id_request",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// approveComplianceSchema
// ---------------------------------------------------------------------------

describe("approveComplianceSchema", () => {
  it("accepts valid company approve", () => {
    const r = approveComplianceSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid id_request approve", () => {
    const r = approveComplianceSchema.safeParse({
      id: "uuid-12345",
      type: "id_request",
    });
    expect(r.success).toBe(true);
  });

  it("rejects candidate type", () => {
    const r = approveComplianceSchema.safeParse({
      id: "42",
      type: "candidate",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = approveComplianceSchema.safeParse({ type: "company" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// denyComplianceSchema
// ---------------------------------------------------------------------------

describe("denyComplianceSchema", () => {
  it("accepts valid deny with reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "Missing documentation",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty reason", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects reason over 2000 chars", () => {
    const r = denyComplianceSchema.safeParse({
      id: "42",
      type: "company",
      reason: "x".repeat(2001),
    });
    expect(r.success).toBe(false);
  });
});
