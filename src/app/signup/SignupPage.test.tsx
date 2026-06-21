// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mock next/navigation ───────────────────────────────────────
const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// ── Mock next/link ────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ── Mock lucide-react icons ───────────────────────────────────
vi.mock("lucide-react", () => ({
  UserRound: () => <span data-testid="icon-user-round" />,
  Building2: () => <span data-testid="icon-building" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  UserPlus: () => <span data-testid="icon-user-plus" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Shield: () => <span data-testid="icon-shield" />,
}));

// ── Mock auth modules ─────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/modules/auth/registration", () => ({
  registerAction: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, type, disabled, className }: any) => (
    <button type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ref, ...props }: any) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

// ── Import after mocks ─────────────────────────────────────────
import { getSession } from "@/modules/auth/session";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SignupPage role param handling", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue(null);
  });

  it("renders role selection step when no role param is provided", async () => {
    const SignupPage = (await import("./page")).default;
    render(await SignupPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Create your StudentHub account")).toBeTruthy();
    expect(screen.getByText("I want to work")).toBeTruthy();
    expect(screen.getByText("I want to hire staff")).toBeTruthy();
  });

  it("renders the registration form directly when ?role=candidate is provided", async () => {
    const SignupPage = (await import("./page")).default;
    render(await SignupPage({ searchParams: Promise.resolve({ role: "candidate" }) }));

    // Should skip role selection and show the form
    expect(screen.getByText("Start your career journey")).toBeTruthy();
    expect(screen.queryByText("Create your StudentHub account")).toBeNull();
  });

  it("renders employer-specific content when ?role=company is provided", async () => {
    const SignupPage = (await import("./page")).default;
    render(await SignupPage({ searchParams: Promise.resolve({ role: "company" }) }));

    expect(screen.getByText("Start hiring with StudentHub")).toBeTruthy();
    expect(screen.queryByText("Create your StudentHub account")).toBeNull();
  });

  it("falls back to role selection when an invalid role param is provided", async () => {
    const SignupPage = (await import("./page")).default;
    render(await SignupPage({ searchParams: Promise.resolve({ role: "invalid-role" }) }));

    // Should show role selection as fallback
    expect(screen.getByText("Create your StudentHub account")).toBeTruthy();
    expect(screen.getByText("I want to work")).toBeTruthy();
    expect(screen.getByText("I want to hire staff")).toBeTruthy();
  });

  it("redirects to /app when user is already logged in", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "test-user-id",
      email: "test@example.com",
      role: "candidate",
      name: "Test User",
      issuedAt: Date.now(),
    });

    const SignupPage = (await import("./page")).default;
    render(await SignupPage({ searchParams: Promise.resolve({}) }));

    expect(mockRedirect).toHaveBeenCalledWith("/app");
  });

  describe("invite-only role params (staff, admin, inspector)", () => {
    it.each(["staff", "admin", "inspector"])(
      "shows invite-only message when ?role=%s is provided",
      async (role) => {
        const SignupPage = (await import("./page")).default;
        render(await SignupPage({ searchParams: Promise.resolve({ role }) }));

        expect(screen.getByText(/requires an invitation/i)).toBeTruthy();
        expect(screen.getByText("Return to home")).toBeTruthy();
        expect(screen.queryByText("Create your StudentHub account")).toBeNull();
        expect(screen.queryByText("Start your career journey")).toBeNull();
      },
    );

    it("shows the correct role label in invite-only message", async () => {
      const SignupPage = (await import("./page")).default;
      render(await SignupPage({ searchParams: Promise.resolve({ role: "staff" }) }));

      const matches = screen.getAllByText(/staff access/i);
      expect(matches.length).toBe(2); // eyebrow + title
    });

    it("renders a link back to the home page for invite-only roles", async () => {
      const SignupPage = (await import("./page")).default;
      const { container } = render(await SignupPage({ searchParams: Promise.resolve({ role: "admin" }) }));

      const homeLink = container.querySelector('a[href="/"]');
      expect(homeLink).toBeTruthy();
      expect(homeLink?.textContent).toMatch(/return to home/i);
    });
  });
});
