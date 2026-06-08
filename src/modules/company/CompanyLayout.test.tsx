import { describe, it, expect, vi } from "vitest";

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: Parameters<typeof mockRequireRoleCapability>) => {
    mockRequireRoleCapability(...args);
    return Promise.resolve({
      role: "company",
      id: "1",
      name: "Test User",
      email: "test@test.com",
      issuedAt: Date.now(),
    });
  },
}));

vi.mock("@/modules/workspace/WorkspaceOS", () => ({
  WorkspaceOS: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/modules/workspace/RoleLayoutShell", () => ({
  RoleLayoutShell: ({ children }: { children: React.ReactNode }) => children,
}));

const { CompanyLayout } = await import("./index");

describe("CompanyLayout", () => {
  it("renders without crashing", async () => {
    const result = await CompanyLayout({ children: "child" });
    expect(result).toBeDefined();
  });

  it("calls requireRoleCapability with company role and company.read.linked capability", async () => {
    mockRequireRoleCapability.mockClear();
    await CompanyLayout({ children: "child" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("company", "company.read.linked");
  });

  it("exports dynamic as force-dynamic", async () => {
    const mod = await import("./CompanyLayout");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("is re-exported from barrel", () => {
    expect(CompanyLayout).toBeDefined();
    expect(CompanyLayout.name).toBe("CompanyLayout");
  });
});
