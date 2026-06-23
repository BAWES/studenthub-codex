// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mock getSession ─────────────────────────────────────
const mockGetSession = vi.hoisted(() => vi.fn());
vi.mock("@/modules/auth/session", () => ({
  getSession: mockGetSession,
}));

// ── Mock redirect (must throw like Next.js does) ─────────
const mockRedirect = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

// ── Mock SignupForm to capture props ────────────────────
vi.mock("@/modules/auth/SignupForm", () => ({
  SignupForm: (props: { defaultRole?: string }) => (
    <div data-testid="signup-form" data-default-role={props.defaultRole ?? ""} />
  ),
}));

// ── Mock lucide-react icons ──────────────────────────────
vi.mock("lucide-react", () => ({
  Shield: () => <span data-testid="icon-shield" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Dynamic import so mocks are in place before module loads
async function renderSignupPage(searchParams: { role?: string }) {
  const SignupPage = (await import("../page")).default;
  // Server components are async functions — render their result
  const element = await SignupPage({ searchParams: Promise.resolve(searchParams) });
  return render(element);
}

describe("SignupPage — ?role search param handling", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
    // Mock redirect to throw like Next.js does — prevents further rendering
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  describe("when ?role=candidate is in the URL", () => {
    it("passes defaultRole='candidate' to SignupForm", async () => {
      await renderSignupPage({ role: "candidate" });

      // Verify the form is rendered with correct defaultRole
      const form = screen.getByTestId("signup-form");
      expect(form).toHaveAttribute("data-default-role", "candidate");
    });

    it("does not redirect when user is not logged in", async () => {
      await renderSignupPage({ role: "candidate" });

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("when ?role=company is in the URL", () => {
    it("passes defaultRole='company' to SignupForm", async () => {
      await renderSignupPage({ role: "company" });

      const form = screen.getByTestId("signup-form");
      expect(form).toHaveAttribute("data-default-role", "company");
    });
  });

  describe("when no ?role param is present", () => {
    it("passes defaultRole undefined to SignupForm (falls back to role selection)", async () => {
      await renderSignupPage({});

      const form = screen.getByTestId("signup-form");
      expect(form).toHaveAttribute("data-default-role", "");
    });
  });

  describe("when ?role=invalid is in the URL", () => {
    it("passes defaultRole undefined to SignupForm for 'invalid' role", async () => {
      await renderSignupPage({ role: "invalid" });

      const form = screen.getByTestId("signup-form");
      expect(form).toHaveAttribute("data-default-role", "");
    });

    it("passes defaultRole 'admin' for 'admin' role (invite-only role, but still valid)", async () => {
      await renderSignupPage({ role: "admin" });

      const form = screen.getByTestId("signup-form");
      expect(form).toHaveAttribute("data-default-role", "admin");
    });
  });

  describe("when user is already logged in", () => {
    it("redirects to /app regardless of role param", async () => {
      mockGetSession.mockResolvedValue({
        user: { role: "admin", id: "123", name: "Test", email: "test@test.com", issuedAt: Date.now() },
      });

      // Expect the redirect error to be thrown
      await expect(
        renderSignupPage({ role: "candidate" }),
      ).rejects.toThrow("NEXT_REDIRECT");

      expect(mockRedirect).toHaveBeenCalledWith("/app");
    });
  });
});
