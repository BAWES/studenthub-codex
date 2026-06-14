import { describe, it, expect } from "vitest";
import {
  getWorkspaceSchema,
  updateWorkspaceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getWorkspaceSchema
// ---------------------------------------------------------------------------
describe("getWorkspaceSchema", () => {
  it("accepts valid input", () => {
    expect(
      getWorkspaceSchema.safeParse({ contactUuid: "uuid-12345-abcde" }).success,
    ).toBe(true);
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
  it("accepts valid input with only contactUuid", () => {
    expect(
      updateWorkspaceSchema.safeParse({ contactUuid: "uuid-12345-abcde" }).success,
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        contactUuid: "uuid-12345-abcde",
        contact_name: "John Doe",
        contact_email: "john@example.com",
      }).success,
    ).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    expect(updateWorkspaceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    expect(updateWorkspaceSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects non-string contactUuid", () => {
    expect(updateWorkspaceSchema.safeParse({ contactUuid: 123 }).success).toBe(false);
  });

  it("rejects empty contact_name", () => {
    expect(
      updateWorkspaceSchema.safeParse({ contactUuid: "uuid-123", contact_name: "" }).success,
    ).toBe(false);
  });

  it("rejects contact_name exceeding 255 chars", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        contactUuid: "uuid-123",
        contact_name: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects invalid contact_email", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        contactUuid: "uuid-123",
        contact_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects contact_email exceeding 225 chars", () => {
    expect(
      updateWorkspaceSchema.safeParse({
        contactUuid: "uuid-123",
        contact_email: "a".repeat(216) + "@toolongdomain.com",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string contact_name", () => {
    expect(
      updateWorkspaceSchema.safeParse({ contactUuid: "uuid-123", contact_name: 42 }).success,
    ).toBe(false);
  });
});
