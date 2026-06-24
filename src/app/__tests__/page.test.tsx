// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";

// ── Mock next/link ──────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ children, href, className, ...rest }: any) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// ── Mock lucide-react ──────────────────────────────────────────
vi.mock("lucide-react", () => ({
  UserRound: () => <span data-testid="icon-user" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  Building2: () => <span data-testid="icon-building" />,
  Shield: () => <span data-testid="icon-shield" />,
  ClipboardCheck: () => <span data-testid="icon-clipboard" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── Mock shadcn components ─────────────────────────────────────
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, asChild, ...rest }: any) => (
    <button data-variant={variant} data-size={size} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// ── Mock ThemeToggle ────────────────────────────────────────────
vi.mock("@/modules/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">🌓</button>,
}));

// ── Mock PortalCards ────────────────────────────────────────────
vi.mock("@/app/PortalCards", () => ({
  default: () => <section aria-label="StudentHub portals">PortalCards</section>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ────────────────────────────────────────────
import LandingPage from "@/components/landing/LandingPage";
import Home from "@/app/page";

// ── Tests ────────────────────────────────────────────────────────

describe("Landing page (clean auth)", () => {
  const defaultProps = {
    session: null,
  };

  const sessionProps = {
    session: {
      id: "test-123",
      email: "test@example.com",
      role: "candidate",
      name: "Test User",
    },
  };

  // ── Hero ─────────────────────────────────────────────────────

  it("renders the hero section with headline", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.getByText(/staff-matched placements/i)
    ).toBeInTheDocument();
  });

  it("renders StudentHub text in nav", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("StudentHub");
  });

  it("renders sign in for unauthenticated users", () => {
    render(<LandingPage {...defaultProps} />);
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders SH brand", () => {
    render(<LandingPage {...defaultProps} />);
    const shElements = screen.getAllByText("SH");
    expect(shElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders StudentHub text", () => {
    render(<LandingPage {...defaultProps} />);
    const shTexts = screen.getAllByText("StudentHub");
    expect(shTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── No persona tabs (stripped) ───────────────────────────────

  it("does NOT render persona tabs (Students/Companies)", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Students");
    expect(container.textContent).not.toContain("Companies");
  });

  // ── No marketing sections (stripped) ─────────────────────────

  it("does NOT render how it works section", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Create your profile");
  });

  it("does NOT render testimonial carousel", async () => {
    const { container } = render(await Home());
    expect(
      container.textContent
    ).not.toContain("Real stories from real placements.");
  });

  it("does NOT render comparison table", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Why students choose StudentHub.");
  });

  it("does NOT render employer trust bar", async () => {
    const { container } = render(await Home());
    expect(
      container.textContent
    ).not.toContain("Trusted by leading organizations");
  });

  // ── Hero content ─────────────────────────────────────────────

  it("renders placement feature badges", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("Staff-recruited matching");
    expect(container.textContent).toContain("End-to-end workflows");
    expect(container.textContent).toContain("Real-time pay and compliance");
  });

  it("does NOT render employer trust bar", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText(/trusted by leading organizations/i)
    ).not.toBeInTheDocument();
  });

  // ── No footer (stripped) ─────────────────────────────────────

  it("does NOT render footer with role descriptions", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText(/Staff:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Admin:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Inspector:/i)).not.toBeInTheDocument();
  });

  // ── Skip-to-content ─────────────────────────────────────────

  it("renders a skip-to-content link", () => {
    render(<LandingPage {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
  });

  it("skip-to-content link targets #main-content", () => {
    render(<LandingPage {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("main element has id=main-content", () => {
    const { container } = render(<LandingPage {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });

  // ── Authenticated state ──────────────────────────────────────

  it("shows workspace link when user is authenticated", () => {
    render(<LandingPage {...sessionProps} />);
    expect(screen.getByText(/go to workspace/i)).toBeInTheDocument();
  });

  it("shows welcome back when user is authenticated", () => {
    render(<LandingPage {...sessionProps} />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
