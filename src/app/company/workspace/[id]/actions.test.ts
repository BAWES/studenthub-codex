import { describe, it, expect } from "vitest";
import {
  getWorkspaceSchema,
  updateWorkspaceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getWorkspaceSchema
// ---------------------------------------------------------------------------

describe("getWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getWorkspaceSchema.safeParse({
      contactUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty string UUID", () => {
    const result = getWorkspaceSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    const result = getWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null contactUuid", () => {
    const result = getWorkspaceSchema.safeParse({ contactUuid: null });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateWorkspaceSchema
// ---------------------------------------------------------------------------

describe("updateWorkspaceSchema", () => {
  it("accepts contactUuid with contact_name update", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
      contact_name: "Updated Contact Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("abc-123");
      expect(result.data.contact_name).toBe("Updated Contact Name");
      expect(result.data.contact_email).toBeUndefined();
    }
  });

  it("accepts contactUuid with contact_email update", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
      contact_email: "updated@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contact_email).toBe("updated@example.com");
    }
  });

  it("accepts contactUuid with all fields", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
      contact_name: "New Name",
      contact_email: "new@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts contactUuid only (no optional fields)", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    const result = updateWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    const result = updateWorkspaceSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
      contact_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty contact_name", () => {
    const result = updateWorkspaceSchema.safeParse({
      contactUuid: "abc-123",
      contact_name: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("WorkspaceData shape", () => {
  it("defines the expected fields", () => {
    const workspace: import("./schemas").WorkspaceData = {
      contact: {
        contact_name: "John Doe",
        contact_email: "john@example.com",
      },
      metrics: [
        { label: "Companies", value: 3, note: "Linked companies" },
      ],
      companies: [
        { id: "cc-uuid-1", title: "Acme Corp", subtitle: "Admin", meta: "Access allowed" },
      ],
      requests: [
        { id: "req-uuid-1", title: "Software Engineer", subtitle: "Acme Corp", meta: "Active" },
      ],
    };
    expect(workspace.contact?.contact_name).toBe("John Doe");
    expect(workspace.metrics).toHaveLength(1);
    expect(workspace.companies).toHaveLength(1);
    expect(workspace.requests).toHaveLength(1);
  });
});

describe("UpdateWorkspaceResult shape", () => {
  it("defines the expected fields", () => {
    const result: import("./schemas").UpdateWorkspaceResult = {
      contactUuid: "abc-123",
    };
    expect(result.contactUuid).toBe("abc-123");
  });
});
