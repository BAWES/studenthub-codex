import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockRevalidatePath,
  mockRandomUUID,
  mockContactFindUnique,
  mockContactCreate,
  mockCompanyContactCreate,
  mockCompanyContactDelete,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRandomUUID: vi.fn(),
  mockContactFindUnique: vi.fn(),
  mockContactCreate: vi.fn(),
  mockCompanyContactCreate: vi.fn(),
  mockCompanyContactDelete: vi.fn(),
}));

// ── Mock dependencies ───────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contact: {
      findUnique: mockContactFindUnique,
      create: mockContactCreate,
    },
    company_contact: {
      create: mockCompanyContactCreate,
      delete: mockCompanyContactDelete,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// Must be hoisted to module scope to affect crypto import
vi.mock("node:crypto", () => ({
  default: {
    randomUUID: mockRandomUUID,
  },
  randomUUID: mockRandomUUID,
}));

// ── Imports (after mocks) ───────────────────────────────────
import { addCompanyContact, removeCompanyContact } from "./contacts";

// ===========================================================================
// addCompanyContact()
// ===========================================================================
describe("addCompanyContact()", () => {
  const validFormData = new FormData();
  validFormData.set("companyId", "42");
  validFormData.set("name", "Jane Doe");
  validFormData.set("email", "jane@example.com");
  validFormData.set("position", "Manager");
  validFormData.set("phone", "+965 5000 0000");
  validFormData.set("allowAccess", "1");

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockRandomUUID.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
  });

  it("creates a new contact and links it to the company", async () => {
    mockContactFindUnique.mockResolvedValue(null);
    mockContactCreate.mockResolvedValue({
      contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    mockCompanyContactCreate.mockResolvedValue({
      company_contact_uuid: "cc-uuid-1",
    });

    const result = await addCompanyContact({ error: "" }, validFormData);

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "company",
      "company.write.linked",
    );

    expect(mockContactFindUnique).toHaveBeenCalledWith({
      where: { contact_email: "jane@example.com" },
      select: { contact_uuid: true },
    });

    expect(mockContactCreate).toHaveBeenCalledWith({
      data: {
        contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
        contact_name: "Jane Doe",
        contact_email: "jane@example.com",
        contact_created_at: expect.any(Date),
        contact_updated_at: expect.any(Date),
      },
    });

    expect(mockCompanyContactCreate).toHaveBeenCalledWith({
      data: {
        company_contact_uuid: expect.any(String),
        contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
        company_id: 42,
        contact_position: "Manager",
        allow_access: true,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/contacts");
    expect(result).toEqual({ error: "" });
  });

  it("reuses existing contact when email already exists", async () => {
    mockContactFindUnique.mockResolvedValue({
      contact_uuid: "existing-uuid-123",
    });
    mockCompanyContactCreate.mockResolvedValue({
      company_contact_uuid: "cc-uuid-2",
    });

    const result = await addCompanyContact({ error: "" }, validFormData);

    // Should NOT create a new contact
    expect(mockContactCreate).not.toHaveBeenCalled();

    // Should use existing contact's UUID
    expect(mockCompanyContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_uuid: "existing-uuid-123",
        }),
      }),
    );

    expect(result).toEqual({ error: "" });
  });

  it("creates contact without email (no lookup)", async () => {
    const formDataNoEmail = new FormData();
    formDataNoEmail.set("companyId", "10");
    formDataNoEmail.set("name", "Bob Smith");
    // In real forms, all optional fields are always present as empty strings
    formDataNoEmail.set("email", "");
    formDataNoEmail.set("position", "");
    formDataNoEmail.set("phone", "");
    formDataNoEmail.set("allowAccess", "");

    mockContactCreate.mockResolvedValue({
      contact_uuid: "new-uuid-no-email",
    });
    mockCompanyContactCreate.mockResolvedValue({
      company_contact_uuid: "cc-uuid-3",
    });

    const result = await addCompanyContact({ error: "" }, formDataNoEmail);

    // Should NOT look up by email (empty string is falsy)
    expect(mockContactFindUnique).not.toHaveBeenCalled();

    // Should create contact without email
    expect(mockContactCreate).toHaveBeenCalledWith({
      data: {
        contact_uuid: expect.any(String),
        contact_name: "Bob Smith",
        contact_created_at: expect.any(Date),
        contact_updated_at: expect.any(Date),
      },
    });

    expect(result).toEqual({ error: "" });
  });

  it("returns validation error when name is missing", async () => {
    const formDataMissingName = new FormData();
    formDataMissingName.set("companyId", "42");
    formDataMissingName.set("name", "");

    const result = await addCompanyContact(
      { error: "" },
      formDataMissingName,
    );

    expect(result.error).not.toBe("");
    // Should not touch Prisma or revalidate on validation failure
    expect(mockContactFindUnique).not.toHaveBeenCalled();
    expect(mockContactCreate).not.toHaveBeenCalled();
    expect(mockCompanyContactCreate).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns validation error when companyId is missing", async () => {
    const formDataNoCompany = new FormData();
    formDataNoCompany.set("name", "Jane Doe");

    const result = await addCompanyContact(
      { error: "" },
      formDataNoCompany,
    );

    expect(result.error).not.toBe("");
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("includes optional fields when empty strings", async () => {
    const formData = new FormData();
    formData.set("companyId", "42");
    formData.set("name", "Jane Doe");
    formData.set("email", "");
    formData.set("position", "");
    formData.set("phone", "");
    formData.set("allowAccess", "");

    mockContactCreate.mockResolvedValue({
      contact_uuid: "uuid-optional",
    });
    mockCompanyContactCreate.mockResolvedValue({
      company_contact_uuid: "cc-uuid-4",
    });

    const result = await addCompanyContact({ error: "" }, formData);

    expect(result).toEqual({ error: "" });
    // Contact created without email (empty string treated as empty optional)
    expect(mockContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_name: "Jane Doe",
        }),
      }),
    );
  });

  it("rejects invalid email format", async () => {
    const formDataInvalidEmail = new FormData();
    formDataInvalidEmail.set("companyId", "42");
    formDataInvalidEmail.set("name", "Jane Doe");
    formDataInvalidEmail.set("email", "not-an-email");

    const result = await addCompanyContact(
      { error: "" },
      formDataInvalidEmail,
    );

    expect(result.error).not.toBe("");
    expect(mockContactFindUnique).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// removeCompanyContact()
// ===========================================================================
describe("removeCompanyContact()", () => {
  const validFormData = new FormData();
  validFormData.set("companyContactUuid", "cc-uuid-to-delete");

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockCompanyContactDelete.mockResolvedValue({
      company_contact_uuid: "cc-uuid-to-delete",
    });
  });

  it("deletes a company contact link by UUID", async () => {
    const result = await removeCompanyContact({ error: "" }, validFormData);

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "company",
      "company.write.linked",
    );

    expect(mockCompanyContactDelete).toHaveBeenCalledWith({
      where: { company_contact_uuid: "cc-uuid-to-delete" },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/contacts");
    expect(result).toEqual({ error: "" });
  });

  it("returns error when companyContactUuid is missing", async () => {
    const emptyForm = new FormData();

    const result = await removeCompanyContact({ error: "" }, emptyForm);

    expect(result.error).toBe("Invalid contact.");
    expect(mockCompanyContactDelete).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when companyContactUuid is empty string", async () => {
    const formEmptyUuid = new FormData();
    formEmptyUuid.set("companyContactUuid", "");

    const result = await removeCompanyContact(
      { error: "" },
      formEmptyUuid,
    );

    expect(result.error).toBe("Invalid contact.");
    expect(mockCompanyContactDelete).not.toHaveBeenCalled();
  });

  it("returns error when companyContactUuid is whitespace-only", async () => {
    const formWhitespace = new FormData();
    formWhitespace.set("companyContactUuid", "   ");

    const result = await removeCompanyContact(
      { error: "" },
      formWhitespace,
    );

    expect(result.error).toBe("Invalid contact.");
    expect(mockCompanyContactDelete).not.toHaveBeenCalled();
  });
});
