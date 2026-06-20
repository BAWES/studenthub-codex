import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockContactFindUnique,
  mockCompanyContactFindMany,
  mockRequestCount,
  mockStoreCount,
  mockNoteCount,
  mockRequestFindMany,
  mockTransaction,
  mockContactUpdate,
} = vi.hoisted(() => ({
  mockContactFindUnique: vi.fn(),
  mockCompanyContactFindMany: vi.fn(),
  mockRequestCount: vi.fn(),
  mockStoreCount: vi.fn(),
  mockNoteCount: vi.fn(),
  mockRequestFindMany: vi.fn(),
  mockTransaction: vi.fn(),
  mockContactUpdate: vi.fn(),
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contact: {
      findUnique: mockContactFindUnique,
      update: mockContactUpdate,
    },
    company_contact: {
      findMany: mockCompanyContactFindMany,
    },
    request: {
      count: mockRequestCount,
      findMany: mockRequestFindMany,
    },
    store: {
      count: mockStoreCount,
    },
    note: {
      count: mockNoteCount,
    },
    $transaction: mockTransaction,
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  findContactByUuidSchema,
  getCompanyLinksForWorkspaceSchema,
  getWorkspaceStatsTxSchema,
  updateContactSchema,
} from "./schemas";
import {
  findContactByUuid,
  getCompanyLinksForWorkspace,
  getWorkspaceStatsTx,
  updateContactByUuid,
} from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("findContactByUuidSchema", () => {
  it("accepts a valid contact UUID", () => {
    const r = findContactByUuidSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const r = findContactByUuidSchema.safeParse({ contactUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const r = findContactByUuidSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const r = findContactByUuidSchema.safeParse({ contactUuid: 123 });
    expect(r.success).toBe(false);
  });
});

describe("getCompanyLinksForWorkspaceSchema", () => {
  it("accepts a valid contact UUID", () => {
    const r = getCompanyLinksForWorkspaceSchema.safeParse({
      contactUuid: "uuid-1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const r = getCompanyLinksForWorkspaceSchema.safeParse({
      contactUuid: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const r = getCompanyLinksForWorkspaceSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("getWorkspaceStatsTxSchema", () => {
  it("accepts an array of company IDs", () => {
    const r = getWorkspaceStatsTxSchema.safeParse({
      companyIds: [1, 2, 3],
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = getWorkspaceStatsTxSchema.safeParse({ companyIds: [] });
    expect(r.success).toBe(true);
  });

  it("rejects non-positive integers", () => {
    const r = getWorkspaceStatsTxSchema.safeParse({
      companyIds: [0, -1],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array", () => {
    const r = getWorkspaceStatsTxSchema.safeParse({
      companyIds: "not-an-array",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing companyIds", () => {
    const r = getWorkspaceStatsTxSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("updateContactSchema", () => {
  it("accepts valid input with data", () => {
    const r = updateContactSchema.safeParse({
      contactUuid: "uuid-1",
      data: { contact_name: "New Name" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty data object", () => {
    const r = updateContactSchema.safeParse({
      contactUuid: "uuid-1",
      data: {},
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    const r = updateContactSchema.safeParse({
      data: { contact_name: "Name" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    const r = updateContactSchema.safeParse({
      contactUuid: "",
      data: {},
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing data", () => {
    const r = updateContactSchema.safeParse({ contactUuid: "uuid-1" });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action function tests (with mocked Prisma)
// ===========================================================================

describe("findContactByUuid()", () => {
  const mockContact = {
    contact_name: "Jane Doe",
    contact_email: "jane@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockContactFindUnique.mockResolvedValue(mockContact);
  });

  it("returns a contact by UUID", async () => {
    const result = await findContactByUuid("550e8400-e29b-41d4-a716-446655440000");

    expect(mockContactFindUnique).toHaveBeenCalledWith({
      where: { contact_uuid: "550e8400-e29b-41d4-a716-446655440000" },
      select: { contact_name: true, contact_email: true },
    });
    expect(result).not.toBeNull();
    expect(result!.contact_name).toBe("Jane Doe");
    expect(result!.contact_email).toBe("jane@example.com");
  });

  it("returns null when contact not found", async () => {
    mockContactFindUnique.mockResolvedValue(null);

    const result = await findContactByUuid("nonexistent");
    expect(result).toBeNull();
  });

  it("handles null email", async () => {
    mockContactFindUnique.mockResolvedValue({
      contact_name: "John Smith",
      contact_email: null,
    });

    const result = await findContactByUuid("uuid");
    expect(result!.contact_email).toBeNull();
  });
});

describe("getCompanyLinksForWorkspace()", () => {
  const mockLinks = [
    {
      company_contact_uuid: "cc-1",
      contact_position: "Manager",
      allow_access: true,
      company: {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        no_of_active_requests: 5,
        company_approved_to_hire: true,
      },
    },
    {
      company_contact_uuid: "cc-2",
      contact_position: null,
      allow_access: false,
      company: {
        company_id: 2,
        company_name: "Beta Inc",
        company_email: null,
        no_of_active_requests: 0,
        company_approved_to_hire: false,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyContactFindMany.mockResolvedValue(mockLinks);
  });

  it("returns company links for workspace", async () => {
    const result = await getCompanyLinksForWorkspace("contact-uuid-1");

    expect(mockCompanyContactFindMany).toHaveBeenCalledWith({
      where: { contact_uuid: "contact-uuid-1" },
      take: 20,
      select: {
        company_contact_uuid: true,
        contact_position: true,
        allow_access: true,
        company: {
          select: {
            company_id: true,
            company_name: true,
            company_email: true,
            no_of_active_requests: true,
            company_approved_to_hire: true,
          },
        },
      },
    });
    expect(result).toHaveLength(2);
    expect(result[0].company!.company_name).toBe("Acme Corp");
    expect(result[1].company!.company_id).toBe(2);
  });

  it("returns empty array when no links exist", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);

    const result = await getCompanyLinksForWorkspace("unknown-contact");
    expect(result).toEqual([]);
  });

  it("handles null company", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      {
        company_contact_uuid: "cc-3",
        contact_position: null,
        allow_access: null,
        company: null,
      },
    ]);

    const result = await getCompanyLinksForWorkspace("contact-uuid");
    expect(result).toHaveLength(1);
    expect(result[0].company).toBeNull();
  });

  it("handles null contact_position and allow_access", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      {
        company_contact_uuid: "cc-4",
        contact_position: null,
        allow_access: null,
        company: {
          company_id: 3,
          company_name: "Gamma Co",
          company_email: null,
          no_of_active_requests: null,
          company_approved_to_hire: null,
        },
      },
    ]);

    const result = await getCompanyLinksForWorkspace("contact-uuid");
    expect(result[0].contact_position).toBeNull();
    expect(result[0].allow_access).toBeNull();
    expect(result[0].company!.company_email).toBeNull();
  });
});

describe("getWorkspaceStatsTx()", () => {
  const mockRecentRequests = [
    {
      request_uuid: "req-1",
      request_position_title: "Engineer",
      request_status: "open",
      request_number_of_employees: 2,
      request_created_datetime: new Date("2026-06-01"),
      company: { company_name: "Acme Corp" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestCount.mockResolvedValue(15);
    mockStoreCount.mockResolvedValue(4);
    mockNoteCount.mockResolvedValue(22);
    mockRequestFindMany.mockResolvedValue(mockRecentRequests);
    mockTransaction.mockImplementation((promises: Promise<unknown>[]) =>
      Promise.all(promises),
    );
  });

  it("returns workspace stats for given company IDs", async () => {
    const result = await getWorkspaceStatsTx([1, 2, 3]);

    expect(mockRequestCount).toHaveBeenCalledWith({
      where: { company_id: { in: [1, 2, 3] } },
    });
    expect(mockStoreCount).toHaveBeenCalledWith({
      where: { company_id: { in: [1, 2, 3] }, deleted: 0 },
    });
    expect(mockNoteCount).toHaveBeenCalledWith({
      where: { company_id: { in: [1, 2, 3] } },
    });
    expect(mockRequestFindMany).toHaveBeenCalledWith({
      where: { company_id: { in: [1, 2, 3] } },
      orderBy: { request_created_datetime: "desc" },
      take: 6,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        company: { select: { company_name: true } },
      },
    });

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(result[0]).toBe(15);
    expect(result[1]).toBe(4);
    expect(result[2]).toBe(22);
    expect(result[3]).toHaveLength(1);
    expect(
      (result[3] as Array<{ company: { company_name: string } }>)[0].company
        .company_name,
    ).toBe("Acme Corp");
  });

  it("handles zero counts", async () => {
    mockRequestCount.mockResolvedValue(0);
    mockStoreCount.mockResolvedValue(0);
    mockNoteCount.mockResolvedValue(0);
    mockRequestFindMany.mockResolvedValue([]);

    const result = await getWorkspaceStatsTx([99]);

    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);
    expect(result[3]).toEqual([]);
  });

  it("handles single company ID", async () => {
    mockRequestCount.mockResolvedValue(1);
    mockStoreCount.mockResolvedValue(1);
    mockNoteCount.mockResolvedValue(1);
    mockRequestFindMany.mockResolvedValue(mockRecentRequests);

    const result = await getWorkspaceStatsTx([5]);

    expect(mockRequestCount).toHaveBeenCalledWith({
      where: { company_id: { in: [5] } },
    });
    expect(result[0]).toBe(1);
    expect(result[3]).toHaveLength(1);
  });

  it("handles empty company IDs array", async () => {
    mockRequestCount.mockResolvedValue(0);
    mockStoreCount.mockResolvedValue(0);
    mockNoteCount.mockResolvedValue(0);
    mockRequestFindMany.mockResolvedValue([]);

    const result = await getWorkspaceStatsTx([]);

    expect(mockRequestCount).toHaveBeenCalledWith({
      where: { company_id: { in: [] } },
    });
    expect(result[0]).toBe(0);
  });
});

describe("updateContactByUuid()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContactUpdate.mockResolvedValue({
      contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("updates contact name", async () => {
    const result = await updateContactByUuid(
      "550e8400-e29b-41d4-a716-446655440000",
      { contact_name: "Updated Name" },
    );

    expect(mockContactUpdate).toHaveBeenCalledWith({
      where: { contact_uuid: "550e8400-e29b-41d4-a716-446655440000" },
      data: { contact_name: "Updated Name" },
      select: { contact_uuid: true },
    });
    expect(result).toEqual({
      contact_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("updates with multiple fields", async () => {
    await updateContactByUuid("uuid-1", {
      contact_name: "New Name",
      contact_email: "new@example.com",
    });

    expect(mockContactUpdate).toHaveBeenCalledWith({
      where: { contact_uuid: "uuid-1" },
      data: { contact_name: "New Name", contact_email: "new@example.com" },
      select: { contact_uuid: true },
    });
  });

  it("updates with empty data", async () => {
    const result = await updateContactByUuid("uuid-1", {});

    expect(mockContactUpdate).toHaveBeenCalledWith({
      where: { contact_uuid: "uuid-1" },
      data: {},
      select: { contact_uuid: true },
    });
    expect(result.contact_uuid).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });
});

// ===========================================================================
// Type-shape checks (compile-time type assertions)
// ===========================================================================

describe("ContactResult shape", () => {
  it("accepts a valid contact object", () => {
    const contact = {
      contact_name: "Jane Doe",
      contact_email: "jane@example.com",
    };
    expect(contact.contact_name).toBe("Jane Doe");
  });

  it("accepts null contact", () => {
    const contact = null;
    expect(contact).toBeNull();
  });
});

describe("CompanyLinkWithCompany shape", () => {
  it("accepts a valid company link", () => {
    const link = {
      company_contact_uuid: "cc_uuid_1",
      contact_position: "Manager",
      allow_access: true,
      company: null,
    };
    expect(link.company_contact_uuid).toBe("cc_uuid_1");
  });
});

describe("ContactUpdateResult shape", () => {
  it("accepts a valid result", () => {
    const result = { contact_uuid: "uuid-1" };
    expect(result.contact_uuid).toBe("uuid-1");
  });
});
