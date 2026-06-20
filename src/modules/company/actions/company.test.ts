import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockRandomUUID,
  mockCompanyContactFindMany,
  mockCompanyContactFindUnique,
  mockCompanyContactCreate,
  mockCompanyContactUpdate,
  mockContactFindUnique,
  mockContactCreate,
  mockCompanyContactCount,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRandomUUID: vi.fn(),
  mockCompanyContactFindMany: vi.fn(),
  mockCompanyContactFindUnique: vi.fn(),
  mockCompanyContactCreate: vi.fn(),
  mockCompanyContactUpdate: vi.fn(),
  mockContactFindUnique: vi.fn(),
  mockContactCreate: vi.fn(),
  mockCompanyContactCount: vi.fn(),
}));

// ── Mock dependencies ───────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findMany: mockCompanyContactFindMany,
      findUnique: mockCompanyContactFindUnique,
      create: mockCompanyContactCreate,
      update: mockCompanyContactUpdate,
      count: mockCompanyContactCount,
    },
    contact: {
      findUnique: mockContactFindUnique,
      create: mockContactCreate,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("node:crypto", () => ({
  default: { randomUUID: mockRandomUUID },
  randomUUID: mockRandomUUID,
}));

// ── Imports (after mocks) ──────────────────────────────────
import {
  listCompanyContacts,
  getCompanyContact,
  createCompanyContact,
  updateCompanyContact,
  listCompanyContactsRows,
} from "./company";

// ===========================================================================
// listCompanyContacts()
// ===========================================================================
describe("listCompanyContacts()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("lists contacts with default pagination", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      {
        company_contact_uuid: "cc-1",
        company_id: 1,
        contact_position: "Manager",
        allow_access: true,
        contact: { contact_name: "Jane Doe", contact_email: "jane@example.com" },
        company: { company_name: "Test Corp" },
      },
    ]);
    mockCompanyContactCount.mockResolvedValue(1);

    const result = await listCompanyContacts({});

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockCompanyContactFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { updated_at: "desc" },
      skip: 0,
      take: 20,
      select: expect.any(Object),
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].contact_name).toBe("Jane Doe");
  });

  it("filters by company_id when provided", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);
    mockCompanyContactCount.mockResolvedValue(0);

    await listCompanyContacts({ company_id: 5 });

    expect(mockCompanyContactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: 5 },
      }),
    );
  });

  it("applies pagination offset correctly", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);
    mockCompanyContactCount.mockResolvedValue(0);

    await listCompanyContacts({ page: 3, limit: 10 });

    expect(mockCompanyContactFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("returns empty result when no contacts exist", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);
    mockCompanyContactCount.mockResolvedValue(0);

    const result = await listCompanyContacts({});

    expect(result.contacts).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws on invalid input (negative page)", async () => {
    await expect(listCompanyContacts({ page: -1 })).rejects.toThrow();
  });

  it("throws on invalid input (limit over 100)", async () => {
    await expect(listCompanyContacts({ limit: 999 })).rejects.toThrow();
  });
});

// ===========================================================================
// getCompanyContact()
// ===========================================================================
describe("getCompanyContact()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns a contact when found", async () => {
    mockCompanyContactFindUnique.mockResolvedValue({
      company_contact_uuid: "cc-1",
      contact_uuid: "contact-1",
      company_id: 1,
      contact_position: "Manager",
      allow_access: true,
      created_at: new Date("2025-01-01"),
      updated_at: new Date("2025-01-02"),
      contact: { contact_name: "Jane Doe", contact_email: "jane@example.com" },
      company: { company_name: "Test Corp" },
    });

    const result = await getCompanyContact("cc-1");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result).not.toBeNull();
    expect(result!.company_contact_uuid).toBe("cc-1");
    expect(result!.contact_name).toBe("Jane Doe");
    expect(result!.company_name).toBe("Test Corp");
  });

  it("returns null when contact not found", async () => {
    mockCompanyContactFindUnique.mockResolvedValue(null);

    const result = await getCompanyContact("nonexistent-uuid");

    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getCompanyContact("")).rejects.toThrow();
  });

  it("handles contacts without relations (null fields)", async () => {
    mockCompanyContactFindUnique.mockResolvedValue({
      company_contact_uuid: "cc-2",
      contact_uuid: "contact-2",
      company_id: null,
      contact_position: null,
      allow_access: null,
      created_at: new Date("2025-01-01"),
      updated_at: new Date("2025-01-02"),
      contact: null,
      company: null,
    });

    const result = await getCompanyContact("cc-2");

    expect(result).not.toBeNull();
    expect(result!.contact_name).toBeNull();
    expect(result!.company_name).toBeNull();
    expect(result!.allow_access).toBeNull();
  });
});

// ===========================================================================
// createCompanyContact()
// ===========================================================================
describe("createCompanyContact()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockRandomUUID
      .mockReturnValueOnce("contact-uuid-new")
      .mockReturnValueOnce("cc-uuid-new");
  });

  it("creates a new contact and links to company", async () => {
    mockContactFindUnique.mockResolvedValue(null);
    mockContactCreate.mockResolvedValue({ contact_uuid: "contact-uuid-new" });
    mockCompanyContactCreate.mockResolvedValue({ company_contact_uuid: "cc-uuid-new" });

    const result = await createCompanyContact({
      company_id: 1,
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockContactFindUnique).toHaveBeenCalledWith({
      where: { contact_email: "jane@example.com" },
      select: { contact_uuid: true },
    });
    expect(mockContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_uuid: "contact-uuid-new",
          contact_name: "Jane Doe",
        }),
      }),
    );
    expect(mockCompanyContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          company_id: 1,
          contact_uuid: "contact-uuid-new",
        }),
      }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/contacts");
    expect(result.company_contact_uuid).toBe("cc-uuid-new");
  });

  it("reuses existing contact when email already exists", async () => {
    mockContactFindUnique.mockResolvedValue({ contact_uuid: "existing-contact-uuid" });
    mockCompanyContactCreate.mockResolvedValue({ company_contact_uuid: "cc-uuid-reuse" });
    mockRandomUUID.mockReset();
    mockRandomUUID.mockReturnValue("cc-uuid-reuse");

    const result = await createCompanyContact({
      company_id: 1,
      contact_name: "Jane Doe",
      contact_email: "existing@example.com",
    });

    // Should NOT create a new contact
    expect(mockContactCreate).not.toHaveBeenCalled();
    // Should link using the existing contact's UUID
    expect(mockCompanyContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_uuid: "existing-contact-uuid",
        }),
      }),
    );
    expect(result.company_contact_uuid).toBe("cc-uuid-reuse");
  });

  it("creates contact without email", async () => {
    mockContactCreate.mockResolvedValue({ contact_uuid: "contact-no-email" });
    mockCompanyContactCreate.mockResolvedValue({ company_contact_uuid: "cc-no-email" });

    const result = await createCompanyContact({
      company_id: 10,
      contact_name: "Bob Smith",
    });

    // Should NOT look up by email
    expect(mockContactFindUnique).not.toHaveBeenCalled();
    // Should create contact without email
    expect(mockContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_name: "Bob Smith",
        }),
      }),
    );
    // Should NOT include contact_email in contact creation
    const createCallData = mockContactCreate.mock.calls[0][0].data;
    expect(createCallData).not.toHaveProperty("contact_email");
    expect(result.company_contact_uuid).toBe("cc-no-email");
  });

  it("includes optional fields when provided", async () => {
    mockContactFindUnique.mockResolvedValue(null);
    mockContactCreate.mockResolvedValue({ contact_uuid: "contact-full" });
    mockCompanyContactCreate.mockResolvedValue({ company_contact_uuid: "cc-full" });

    await createCompanyContact({
      company_id: 1,
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
      contact_position: "Manager",
      allow_access: true,
    });

    expect(mockCompanyContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_position: "Manager",
          allow_access: true,
        }),
      }),
    );
  });

  it("defaults allow_access to false when not provided", async () => {
    mockContactCreate.mockResolvedValue({ contact_uuid: "contact-default" });
    mockCompanyContactCreate.mockResolvedValue({ company_contact_uuid: "cc-default" });

    await createCompanyContact({
      company_id: 1,
      contact_name: "Jane Doe",
    });

    expect(mockCompanyContactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          allow_access: false,
        }),
      }),
    );
  });

  it("throws on missing company_id", async () => {
    await expect(
      createCompanyContact({ contact_name: "John" } as any),
    ).rejects.toThrow();
  });

  it("throws on empty contact_name", async () => {
    await expect(
      createCompanyContact({ company_id: 1, contact_name: "" }),
    ).rejects.toThrow();
  });

  it("throws on invalid email format", async () => {
    await expect(
      createCompanyContact({
        company_id: 1,
        contact_name: "John",
        contact_email: "not-an-email",
      }),
    ).rejects.toThrow();
  });

  it("throws on negative company_id", async () => {
    await expect(
      createCompanyContact({ company_id: -1, contact_name: "John" }),
    ).rejects.toThrow();
  });
});

// ===========================================================================
// updateCompanyContact()
// ===========================================================================
describe("updateCompanyContact()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCompanyContactUpdate.mockResolvedValue({ company_contact_uuid: "cc-1" });
  });

  it("updates contact position", async () => {
    const result = await updateCompanyContact({
      uuid: "cc-1",
      contact_position: "Senior Manager",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(mockCompanyContactUpdate).toHaveBeenCalledWith({
      where: { company_contact_uuid: "cc-1" },
      data: expect.objectContaining({
        contact_position: "Senior Manager",
        updated_at: expect.any(Date),
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/contacts");
    expect(result.company_contact_uuid).toBe("cc-1");
  });

  it("updates allow_access", async () => {
    await updateCompanyContact({
      uuid: "cc-1",
      allow_access: false,
    });

    expect(mockCompanyContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          allow_access: false,
        }),
      }),
    );
  });

  it("updates both position and access together", async () => {
    await updateCompanyContact({
      uuid: "cc-1",
      contact_position: "Director",
      allow_access: true,
    });

    expect(mockCompanyContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contact_position: "Director",
          allow_access: true,
        }),
      }),
    );
  });

  it("throws on empty UUID", async () => {
    await expect(
      updateCompanyContact({ uuid: "", contact_position: "Manager" }),
    ).rejects.toThrow();
  });

  it("throws on missing UUID", async () => {
    await expect(
      updateCompanyContact({} as any),
    ).rejects.toThrow();
  });

  it("does not pass undefined fields to prisma update", async () => {
    await updateCompanyContact({ uuid: "cc-1" });

    expect(mockCompanyContactUpdate).toHaveBeenCalledWith({
      where: { company_contact_uuid: "cc-1" },
      data: expect.objectContaining({
        updated_at: expect.any(Date),
      }),
    });
    // Should NOT include contact_position or allow_access in the data
    const callData = mockCompanyContactUpdate.mock.calls[0][0].data;
    expect(Object.keys(callData)).toEqual(["updated_at"]);
  });
});

// ===========================================================================
// listCompanyContactsRows()
// ===========================================================================
describe("listCompanyContactsRows()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("lists contacts for a given contact UUID", async () => {
    // First call: find linked companies
    mockCompanyContactFindMany
      .mockResolvedValueOnce([
        { company_id: 1 },
        { company_id: 2 },
      ])
      // Second call: find contacts for those companies
      .mockResolvedValueOnce([
        {
          company_contact_uuid: "cc-1",
          contact_position: "Manager",
          allow_access: true,
          contact: { contact_name: "Jane Doe", contact_email: "jane@example.com" },
          company: { company_name: "Test Corp" },
        },
        {
          company_contact_uuid: "cc-2",
          contact_position: "HR Lead",
          allow_access: false,
          contact: { contact_name: "Bob Smith", contact_email: null },
          company: { company_name: "Another Co" },
        },
      ]);

    const result = await listCompanyContactsRows("contact-uuid-1");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Jane Doe");
    expect(result[1].name).toBe("Bob Smith");
    expect(result[1].allowAccess).toBe(false);
  });

  it("returns empty array when contact has no linked companies", async () => {
    mockCompanyContactFindMany.mockResolvedValueOnce([]);

    const result = await listCompanyContactsRows("contact-with-no-links");

    expect(result).toEqual([]);
    // Should not make the second findMany call
    expect(mockCompanyContactFindMany).toHaveBeenCalledTimes(1);
  });

  it("filters to only allow_access=true linked companies", async () => {
    mockCompanyContactFindMany
      .mockResolvedValueOnce([
        { company_id: 1 },
        { company_id: null }, // null company_id should be filtered
      ])
      .mockResolvedValueOnce([]);

    await listCompanyContactsRows("contact-uuid-1");

    // First call should only return allow_access=true entries
    const firstCall = mockCompanyContactFindMany.mock.calls[0];
    expect(firstCall[0].where.allow_access).toBe(true);

    // Only company_id=1 should be in the IN clause (null filtered out)
    const secondCall = mockCompanyContactFindMany.mock.calls[1];
    expect(secondCall[0].where.company_id.in).toEqual([1]);
  });

  it("throws on empty contact UUID", async () => {
    await expect(listCompanyContactsRows("")).rejects.toThrow();
  });
});
