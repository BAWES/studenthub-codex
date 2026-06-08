import { describe, it, expect, vi } from "vitest";

const mockRequireRoleCapability = vi.hoisted(() => vi.fn());

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: Parameters<typeof mockRequireRoleCapability>) => {
    mockRequireRoleCapability(...args);
    return Promise.resolve({
      role: "candidate",
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

const { CandidateLayout } = await import("./index");

describe("CandidateLayout", () => {
  it("renders without crashing", async () => {
    const result = await CandidateLayout({ children: "child" });
    expect(result).toBeDefined();
  });

  it("calls requireRoleCapability with candidate role and candidate.read.own capability", async () => {
    mockRequireRoleCapability.mockClear();
    await CandidateLayout({ children: "child" });
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("exports dynamic as force-dynamic", async () => {
    const mod = await import("./CandidateLayout");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("is re-exported from barrel", () => {
    expect(CandidateLayout).toBeDefined();
    expect(CandidateLayout.name).toBe("CandidateLayout");
  });
});
