// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

  // ── Navigation ───────────────────────────────────────────────

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

  it("does NOT render persona tabs", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText("Students")).not.toBeInTheDocument();
    expect(screen.queryByText("Companies")).not.toBeInTheDocument();
  });

  // ── No marketing sections (stripped) ─────────────────────────

  it("does NOT render how it works section", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText("Create your profile")).not.toBeInTheDocument();
  });

  it("does NOT render testimonial carousel", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Real stories from real placements.")
    ).not.toBeInTheDocument();
  });

  it("does NOT render comparison table", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Why students choose StudentHub.")
    ).not.toBeInTheDocument();
  });

  it("does NOT render CTA section", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Start your journey")
    ).not.toBeInTheDocument();
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
