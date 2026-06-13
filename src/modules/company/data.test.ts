import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Company data functions — Prisma query logic tested with mocked client.
// We mock prisma delegates (findMany) to verify filtering, mapping, sorting,
// and edge cases (null companies, empty results).
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: { findMany: vi.fn() },
    store: { findMany: vi.fn() },
    mall: { findMany: vi.fn() },
    brand: { findMany: vi.fn() },
  },
}));

const {
  getCompanySelectOptions,
  getCompanyContactsRows,
  getCompanyStoresRows,
  getCompanyMallsAndBrands,
} = await import("./data");

const MOCK_UUID = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// getCompanySelectOptions
// ===========================================================================

describe("getCompanySelectOptions", () => {
  it("returns companies sorted alphabetically by name", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 3, company: { company_name: "Zeta Corp" } },
      { company_id: 1, company: { company_name: "Alpha Ltd" } },
      { company_id: 2, company: { company_name: "Beta Inc" } },
    ] as any[]);

    const result = await getCompanySelectOptions(MOCK_UUID);

    expect(result).toEqual([
      { id: 1, name: "Alpha Ltd" },
      { id: 2, name: "Beta Inc" },
      { id: 3, name: "Zeta Corp" },
    ]);
  });

  it("filters out entries with null company_id", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: null, company: null },
      { company_id: 5, company: { company_name: "Valid Co" } },
    ] as any[]);

    const result = await getCompanySelectOptions(MOCK_UUID);
    expect(result).toEqual([{ id: 5, name: "Valid Co" }]);
  });

  it("returns empty array when no linked contacts", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    const result = await getCompanySelectOptions(MOCK_UUID);
    expect(result).toEqual([]);
  });

  it("passes correct Prisma query", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    await getCompanySelectOptions(MOCK_UUID);
    expect(prisma.company_contact.findMany).toHaveBeenCalledWith({
      where: { contact_uuid: MOCK_UUID, allow_access: true },
      select: { company_id: true, company: { select: { company_name: true } } },
    });
  });
});

// ===========================================================================
// getCompanyContactsRows
// ===========================================================================

describe("getCompanyContactsRows", () => {
  it("returns mapped contacts for linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany)
      .mockResolvedValueOnce([
        { company_id: 10 },
        { company_id: 20 },
      ] as any[])
      .mockResolvedValueOnce([
        {
          company_contact_uuid: "uuid-1",
          contact_position: "Manager",
          allow_access: true,
          contact: { contact_name: "Alice", contact_email: "alice@co.com" },
          company: { company_name: "Alpha Co" },
        },
        {
          company_contact_uuid: "uuid-2",
          contact_position: null,
          allow_access: false,
          contact: null,
          company: null,
        },
      ] as any[]);

    const result = await getCompanyContactsRows(MOCK_UUID);

    expect(result).toEqual([
      { id: "uuid-1", name: "Alice", email: "alice@co.com", position: "Manager", companyName: "Alpha Co", allowAccess: true },
      { id: "uuid-2", name: "—", email: "—", position: "—", companyName: "—", allowAccess: false },
    ]);
  });

  it("skips second query when no linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    const result = await getCompanyContactsRows(MOCK_UUID);
    expect(result).toEqual([]);
    expect(prisma.company_contact.findMany).toHaveBeenCalledTimes(1);
  });

  it("uses allow_access filter on first query", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    await getCompanyContactsRows(MOCK_UUID);
    expect(prisma.company_contact.findMany).toHaveBeenNthCalledWith(1, {
      where: { contact_uuid: MOCK_UUID, allow_access: true },
      select: { company_id: true },
    });
  });
});

// ===========================================================================
// getCompanyStoresRows
// ===========================================================================

describe("getCompanyStoresRows", () => {
  it("returns mapped stores with joined data", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 7 },
    ] as any[]);
    vi.mocked(prisma.store.findMany).mockResolvedValue([
      {
        store_id: 101,
        store_name: "Downtown Branch",
        store_location: "Floor 1",
        brand: { brand_name_en: "Nike" },
        mall: { mall_name_en: "Avenues Mall" },
        company: { company_name: "Sports Co" },
        contact: { contact_name: "John" },
      },
      {
        store_id: 102,
        store_name: "City Center",
        store_location: "",
        brand: null,
        mall: null,
        company: null,
        contact: null,
      },
    ] as any[]);

    const result = await getCompanyStoresRows(MOCK_UUID);

    expect(result).toEqual([
      { id: 101, name: "Downtown Branch", location: "Floor 1", mallName: "Avenues Mall", brandName: "Nike", companyName: "Sports Co", managerName: "John" },
      { id: 102, name: "City Center", location: "", mallName: "—", brandName: "—", companyName: "—", managerName: "—" },
    ]);
  });

  it("returns empty array when no linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    const result = await getCompanyStoresRows(MOCK_UUID);
    expect(result).toEqual([]);
    expect(prisma.company_contact.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.store.findMany).not.toHaveBeenCalled();
  });

  it("queries stores with deleted: 0 filter", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 3 },
    ] as any[]);
    vi.mocked(prisma.store.findMany).mockResolvedValue([]);
    await getCompanyStoresRows(MOCK_UUID);
    expect(prisma.store.findMany).toHaveBeenCalledWith({
      where: { company_id: { in: [3] }, deleted: 0 },
      select: expect.any(Object),
      orderBy: { store_updated_at: "desc" },
    });
  });
});

// ===========================================================================
// getCompanyMallsAndBrands
// ===========================================================================

describe("getCompanyMallsAndBrands", () => {
  it("filters brands by linked company IDs", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 1 },
      { company_id: 3 },
    ] as any[]);
    vi.mocked(prisma.mall.findMany).mockResolvedValue([]);
    vi.mocked(prisma.brand.findMany).mockResolvedValue([]);

    await getCompanyMallsAndBrands(MOCK_UUID);

    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: { company_id: { in: [1, 3] } },
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    });
  });

  it("passes undefined where when no linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);
    vi.mocked(prisma.mall.findMany).mockResolvedValue([]);
    vi.mocked(prisma.brand.findMany).mockResolvedValue([]);

    await getCompanyMallsAndBrands(MOCK_UUID);

    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: undefined,
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    });
  });

  it("filters out null company_ids for brand query", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: null },
      { company_id: 5 },
    ] as any[]);
    vi.mocked(prisma.mall.findMany).mockResolvedValue([]);
    vi.mocked(prisma.brand.findMany).mockResolvedValue([]);

    await getCompanyMallsAndBrands(MOCK_UUID);

    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: { company_id: { in: [5] } },
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    });
  });

  it("returns mapped malls and brands", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 1 },
    ] as any[]);
    vi.mocked(prisma.mall.findMany).mockResolvedValue([
      { mall_uuid: "m-1", mall_name_en: "Avenues Mall" },
    ] as any[]);
    vi.mocked(prisma.brand.findMany).mockResolvedValue([
      { brand_uuid: "b-1", brand_name_en: "Zara" },
    ] as any[]);

    const result = await getCompanyMallsAndBrands(MOCK_UUID);

    expect(result).toEqual({
      malls: [{ uuid: "m-1", name: "Avenues Mall" }],
      brands: [{ uuid: "b-1", name: "Zara" }],
    });
  });
});
