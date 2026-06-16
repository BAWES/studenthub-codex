import { describe, it, expect } from "vitest";
import {
  certificationItemOutputSchema,
  certificationListOutputSchema,
  certificationActionResultOutputSchema,
} from "./schemas";

describe("candidate certifications page — data contract", () => {
  it("certificationItemOutputSchema validates a valid item", () => {
    const r = certificationItemOutputSchema.safeParse({
      certification_id: 1,
      certification_name: "PMP",
      issuing_organization: "PMI",
      issue_date: new Date("2024-01-01"),
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.certification_name).toBe("PMP");
  });

  it("certificationItemOutputSchema rejects missing certification_id", () => {
    const r = certificationItemOutputSchema.safeParse({ certification_name: "Test" });
    expect(r.success).toBe(false);
  });

  it("certificationListOutputSchema validates a list", () => {
    const r = certificationListOutputSchema.safeParse([{
      certification_id: 1, certification_name: "PMP",
      issuing_organization: "PMI", issue_date: null, expiry_date: null,
      credential_id: null, credential_url: null, description: null,
      created_at: null, updated_at: null,
    }]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(1);
  });

  it("certificationListOutputSchema rejects non-array", () => {
    const r = certificationListOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("certificationActionResultOutputSchema validates success", () => {
    const r = certificationActionResultOutputSchema.safeParse({ success: true, certificationId: 1 });
    expect(r.success).toBe(true);
  });

  it("certificationActionResultOutputSchema validates failure", () => {
    const r = certificationActionResultOutputSchema.safeParse({ success: false, error: "Error" });
    expect(r.success).toBe(true);
  });
});
