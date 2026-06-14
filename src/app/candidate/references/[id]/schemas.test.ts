import { describe, it, expect } from "vitest";
import {
  getReferenceEntrySchema,
  deleteReferenceEntrySchema,
  updateReferenceEntrySchema,
} from "./schemas";

describe("getReferenceEntrySchema", () => {
  it("accepts valid input", () => {
    expect(
      getReferenceEntrySchema.safeParse({ referenceUuid: "uuid-123" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing referenceUuid", () => {
    expect(getReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string referenceUuid", () => {
    expect(getReferenceEntrySchema.safeParse({ referenceUuid: "" }).success).toBe(false);
  });

  it("rejects non-string referenceUuid", () => {
    expect(getReferenceEntrySchema.safeParse({ referenceUuid: 123 }).success).toBe(false);
  });
});

describe("deleteReferenceEntrySchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteReferenceEntrySchema.safeParse({ referenceUuid: "uuid-456" }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(deleteReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty string referenceUuid", () => {
    expect(deleteReferenceEntrySchema.safeParse({ referenceUuid: "" }).success).toBe(false);
  });

  it("rejects non-string referenceUuid", () => {
    expect(deleteReferenceEntrySchema.safeParse({ referenceUuid: null }).success).toBe(false);
  });
});

describe("updateReferenceEntrySchema", () => {
  it("accepts valid input with required fields only", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "Jane Doe",
      }).success
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "Jane Doe",
        company: "Acme Corp",
        position: "Manager",
        phone: "+965 1234 5678",
        email: "jane@example.com",
        relationship: "Colleague",
      }).success
    ).toBe(true);
  });

  it("accepts valid input with optional fields as empty strings", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "Jane Doe",
        company: "",
        position: "",
        phone: "",
        email: "",
        relationship: "",
      }).success
    ).toBe(true);
  });

  it("rejects empty object", () => {
    expect(updateReferenceEntrySchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing referenceUuid", () => {
    expect(
      updateReferenceEntrySchema.safeParse({ name: "Jane Doe" }).success
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      updateReferenceEntrySchema.safeParse({ referenceUuid: "uuid-789" }).success
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "",
      }).success
    ).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "A".repeat(256),
      }).success
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: "Jane Doe",
        email: "bad-email",
      }).success
    ).toBe(false);
  });

  it("rejects non-string referenceUuid", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: 123,
        name: "Jane Doe",
      }).success
    ).toBe(false);
  });

  it("rejects non-string name", () => {
    expect(
      updateReferenceEntrySchema.safeParse({
        referenceUuid: "uuid-789",
        name: 123,
      }).success
    ).toBe(false);
  });
});
