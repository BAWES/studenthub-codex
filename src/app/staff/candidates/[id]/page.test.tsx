import { describe, it, expect, vi } from "vitest";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "staff" }),
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
}));

describe("StaffCandidateDetailPage", () => {
  it("redirects to candidate search with valid ID", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "42" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith(
      "/staff/candidates?candidate=42&tabs=42",
    );
  });

  it("redirects to candidate list when ID is not a valid number", async () => {
    mockRedirect.mockClear();
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "abc" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/staff/candidates");
  });

  it("redirects to candidate list when ID is zero", async () => {
    mockRedirect.mockClear();
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "0" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/staff/candidates");
  });

  it("redirects to candidate list when ID is negative", async () => {
    mockRedirect.mockClear();
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "-1" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/staff/candidates");
  });
});
