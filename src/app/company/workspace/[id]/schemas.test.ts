import { describe, it, expect } from "vitest";
import { getWorkspaceSchema, updateWorkspaceSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getWorkspaceSchema
// ---------------------------------------------------------------------------
describe("getWorkspaceSchema", () => {
  const validInput = { contactUuid: "550e8400-e29b-41d4-a716-446655440000" };

  it("accepts valid input", () => {
    expect(getWorkspaceSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(getWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(getWorkspaceSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects non-string contactUuid", () => {
    expect(getWorkspaceSchema.safeParse({ contactUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkspaceSchema
// ---------------------------------------------------------------------------
describe("updateWorkspaceSchema", () => {
  const validInput = { contactUuid: "550e8400-e29b-41d4-a716-446655440000" };

  it("accepts valid input with only required fields", () => {
    expect(updateWorkspaceSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_name: "John Doe",
        contact_email: "john@example.com",
      }).success,
    ).toBe(true);
  });

  it("accepts partial update with contact_name only", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_name: "Jane Doe",
      }).success,
    ).toBe(true);
  });

  it("accepts partial update with contact_email only", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_email: "jane@example.com",
      }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(updateWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(updateWorkspaceSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects contact_name exceeding max length", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_name: "A".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects contact_email exceeding max length", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_email: `${"a".repeat(216)}@example.com`,
      }).success,
    ).toBe(false);
  });

  it("rejects empty contact_name", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        ...validInput,
        contact_name: "",
      }).success,
    ).toBe(false);
  });
});
