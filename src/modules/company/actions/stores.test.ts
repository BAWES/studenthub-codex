import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockRevalidatePath,
  mockStoreCreate,
  mockStoreUpdate,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockStoreCreate: vi.fn(),
  mockStoreUpdate: vi.fn(),
}));

// ── Mock dependencies ───────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      create: mockStoreCreate,
      update: mockStoreUpdate,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Imports (after mocks) ───────────────────────────────────
import { addCompanyStore, removeCompanyStore } from "./stores";

// ===========================================================================
// addCompanyStore()
// ===========================================================================
describe("addCompanyStore()", () => {
  const validFormData = new FormData();
  validFormData.set("companyId", "42");
  validFormData.set("storeName", "Main Branch");
  validFormData.set("storeLocation", "Kuwait City");
  validFormData.set("mallUuid", "mall-uuid-1");
  validFormData.set("brandUuid", "brand-uuid-1");

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockStoreCreate.mockResolvedValue({
      store_id: 1,
    });
  });

  it("creates a new store with all fields", async () => {
    const result = await addCompanyStore({ error: "" }, validFormData);

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "company",
      "company.write.linked",
    );

    expect(mockStoreCreate).toHaveBeenCalledWith({
      data: {
        company_id: 42,
        store_name: "Main Branch",
        store_location: "Kuwait City",
        mall_uuid: "mall-uuid-1",
        brand_uuid: "brand-uuid-1",
        store_created_at: expect.any(Date),
        store_updated_at: expect.any(Date),
      },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/stores");
    expect(result).toEqual({ error: "" });
  });

  it("creates a store with minimal fields (only required)", async () => {
    const minimalForm = new FormData();
    minimalForm.set("companyId", "10");
    minimalForm.set("storeName", "Mini Store");
    minimalForm.set("storeLocation", "");
    minimalForm.set("mallUuid", "");
    minimalForm.set("brandUuid", "");

    const result = await addCompanyStore({ error: "" }, minimalForm);

    expect(mockStoreCreate).toHaveBeenCalledWith({
      data: {
        company_id: 10,
        store_name: "Mini Store",
        store_location: "",
        mall_uuid: null,
        brand_uuid: null,
        store_created_at: expect.any(Date),
        store_updated_at: expect.any(Date),
      },
    });

    expect(result).toEqual({ error: "" });
  });

  it("returns validation error when storeName is missing", async () => {
    const formMissingName = new FormData();
    formMissingName.set("companyId", "42");
    formMissingName.set("storeName", "");

    const result = await addCompanyStore({ error: "" }, formMissingName);

    expect(result.error).not.toBe("");
    expect(mockStoreCreate).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns validation error when companyId is missing", async () => {
    const formNoCompany = new FormData();
    formNoCompany.set("storeName", "Branch");

    const result = await addCompanyStore({ error: "" }, formNoCompany);

    expect(result.error).not.toBe("");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("rejects storeName longer than 255 characters", async () => {
    const longNameForm = new FormData();
    longNameForm.set("companyId", "42");
    longNameForm.set("storeName", "x".repeat(256));

    const result = await addCompanyStore({ error: "" }, longNameForm);

    expect(result.error).not.toBe("");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("rejects non-numeric companyId", async () => {
    const formBadCompany = new FormData();
    formBadCompany.set("companyId", "abc");
    formBadCompany.set("storeName", "Branch");

    const result = await addCompanyStore({ error: "" }, formBadCompany);

    expect(result.error).not.toBe("");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("rejects zero companyId", async () => {
    const formZeroCompany = new FormData();
    formZeroCompany.set("companyId", "0");
    formZeroCompany.set("storeName", "Branch");

    const result = await addCompanyStore({ error: "" }, formZeroCompany);

    expect(result.error).not.toBe("");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("handles optional mallUuid and brandUuid as empty", async () => {
    const formNoMallBrand = new FormData();
    formNoMallBrand.set("companyId", "42");
    formNoMallBrand.set("storeName", "Branch");
    formNoMallBrand.set("storeLocation", "Area");
    formNoMallBrand.set("mallUuid", "");
    formNoMallBrand.set("brandUuid", "");

    mockStoreCreate.mockResolvedValue({ store_id: 2 });

    const result = await addCompanyStore({ error: "" }, formNoMallBrand);

    expect(mockStoreCreate).toHaveBeenCalledWith({
      data: {
        company_id: 42,
        store_name: "Branch",
        store_location: "Area",
        mall_uuid: null,
        brand_uuid: null,
        store_created_at: expect.any(Date),
        store_updated_at: expect.any(Date),
      },
    });

    expect(result).toEqual({ error: "" });
  });
});

// ===========================================================================
// removeCompanyStore()
// ===========================================================================
describe("removeCompanyStore()", () => {
  const validFormData = new FormData();
  validFormData.set("storeId", "99");

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockStoreUpdate.mockResolvedValue({
      store_id: 99,
    });
  });

  it("soft-deletes a store by ID", async () => {
    const result = await removeCompanyStore({ error: "" }, validFormData);

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "company",
      "company.write.linked",
    );

    expect(mockStoreUpdate).toHaveBeenCalledWith({
      where: { store_id: 99 },
      data: { deleted: 1, store_updated_at: expect.any(Date) },
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/stores");
    expect(result).toEqual({ error: "" });
  });

  it("returns error when storeId is missing", async () => {
    const emptyForm = new FormData();

    const result = await removeCompanyStore({ error: "" }, emptyForm);

    expect(result.error).toBe("Invalid store.");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when storeId is zero", async () => {
    const formZero = new FormData();
    formZero.set("storeId", "0");

    const result = await removeCompanyStore({ error: "" }, formZero);

    expect(result.error).toBe("Invalid store.");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("returns error when storeId is negative", async () => {
    const formNeg = new FormData();
    formNeg.set("storeId", "-5");

    const result = await removeCompanyStore({ error: "" }, formNeg);

    expect(result.error).toBe("Invalid store.");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("returns error when storeId is non-numeric", async () => {
    const formBad = new FormData();
    formBad.set("storeId", "abc");

    const result = await removeCompanyStore({ error: "" }, formBad);

    expect(result.error).toBe("Invalid store.");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });
});
