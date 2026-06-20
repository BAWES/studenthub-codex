import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — inline factory, no external references
// ---------------------------------------------------------------------------

vi.mock("@/modules/company/company-settings/actions", () => ({
  list: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(() => Promise.resolve({})),
}));

import { listAdminCompanySettings, getAdminCompanySettings, updateAdminCompanySettings } from "../actions";
import * as companySettingsActions from "@/modules/company/company-settings/actions";

describe("listAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns items when the module returns data", async () => {
    vi.mocked(companySettingsActions.list).mockResolvedValue({
      items: [{ company_id: 1, company_name: "Test Corp" }],
    });

    const result = await listAdminCompanySettings();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].company_id).toBe(1);
  });

  it("returns empty items when module returns empty", async () => {
    vi.mocked(companySettingsActions.list).mockResolvedValue({ items: [] });

    const result = await listAdminCompanySettings();
    expect(result.items).toEqual([]);
  });
});

describe("getAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns settings for a valid company ID", async () => {
    vi.mocked(companySettingsActions.get).mockResolvedValue({
      company_id: 1,
      company_name: "Acme Corp",
    });

    const result = await getAdminCompanySettings(1);
    expect(result).not.toBeNull();
    expect(result!.company_id).toBe(1);
  });

  it("returns null for non-existent company", async () => {
    vi.mocked(companySettingsActions.get).mockResolvedValue(null);

    const result = await getAdminCompanySettings(999);
    expect(result).toBeNull();
  });
});

describe("updateAdminCompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when module update succeeds", async () => {
    vi.mocked(companySettingsActions.update).mockResolvedValue({
      operation: "success",
      message: "Company settings updated successfully",
      data: { company_id: 1, company_name: "Acme Corp" },
    });

    const result = await updateAdminCompanySettings(1, { companyName: "Updated Corp" });

    expect(result.operation).toBe("success");
    expect(vi.mocked(companySettingsActions.update)).toHaveBeenCalledWith(1, { companyName: "Updated Corp" });
  });

  it("returns error when module update fails", async () => {
    vi.mocked(companySettingsActions.update).mockResolvedValue({
      operation: "error",
      message: "Company not found",
    });

    const result = await updateAdminCompanySettings(999, {});

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Company not found");
  });
});
