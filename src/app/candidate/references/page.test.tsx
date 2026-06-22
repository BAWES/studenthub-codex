import { describe, it, expect } from "vitest";
import {
  referenceItemOutputSchema,
  referenceListOutputSchema,
  referenceActionResultOutputSchema,
} from "./schemas";

describe("candidate references page — data contract", () => {
  it("referenceItemOutputSchema validates a valid reference", () => {
    const r = referenceItemOutputSchema.safeParse({
      reference_uuid: "ref-1",
      candidate_id: 42,
      name: "Ahmed Al-Sabah",
      company: "Tech Corp",
      position: "Manager",
      phone: "+965****5678",
      email: "ahmed@corp.com",
      relationship: "Colleague",
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("Ahmed Al-Sabah");
  });

  it("referenceItemOutputSchema rejects missing reference_uuid", () => {
    const r = referenceItemOutputSchema.safeParse({ name: "Test" });
    expect(r.success).toBe(false);
  });

  it("referenceListOutputSchema validates an array", () => {
    const r = referenceListOutputSchema.safeParse([{
      reference_uuid: "r1", candidate_id: null, name: "N", company: null,
      position: null, phone: null, email: null, relationship: null,
      created_at: null, updated_at: null,
    }]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.length).toBe(1);
  });

  it("referenceListOutputSchema rejects non-array", () => {
    const r = referenceListOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("referenceActionResultOutputSchema validates success", () => {
    const r = referenceActionResultOutputSchema.safeParse({ success: true, referenceUuid: "ref-uuid" });
    expect(r.success).toBe(true);
  });

  it("referenceActionResultOutputSchema validates failure", () => {
    const r = referenceActionResultOutputSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });
});
