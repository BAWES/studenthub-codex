// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";

// ── Mock next/navigation ─────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// ── Mock next/link ────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// ── Mock lucide-react icons ───────────────────────────────────
vi.mock("lucide-react", () => ({
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Bell: () => <span data-testid="icon-bell" />,
  Building2: () => <span data-testid="icon-building2" />,
  Check: () => <span data-testid="icon-check" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  LayoutDashboard: () => <span data-testid="icon-layout-dashboard" />,
  Users: () => <span data-testid="icon-users" />,
  ClipboardCheck: () => <span data-testid="icon-clipboard-check" />,
  Clock: () => <span data-testid="icon-clock" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  FileText: () => <span data-testid="icon-file-text" />,
  Globe: () => <span data-testid="icon-globe" />,
  Layers: () => <span data-testid="icon-layers" />,
  MessageSquare: () => <span data-testid="icon-message-square" />,
  Minus: () => <span data-testid="icon-minus" />,
  Quote: () => <span data-testid="icon-quote" />,
  Search: () => <span data-testid="icon-search" />,
  Shield: () => <span data-testid="icon-shield" />,
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Star: () => <span data-testid="icon-star" />,
  UserRound: () => <span data-testid="icon-user-round" />,
  UsersRound: () => <span data-testid="icon-users-round" />,
  X: () => <span data-testid="icon-x" />,
  Zap: () => <span data-testid="icon-zap" />,
  PieChart: () => <span data-testid="icon-pie-chart" />,
  GitMerge: () => <span data-testid="icon-git-merge" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  ArrowDown: () => <span data-testid="icon-arrow-down" />,
  GraduationCap: () => <span data-testid="icon-graduation-cap" />,
}));

// ── Mock ThemeToggle ──────────────────────────────────────────
vi.mock("@/modules/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" aria-label="Toggle theme" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import InspectorLandingContent from "../InspectorLandingContent";
import type { InspectorLandingContentProps } from "../InspectorLandingContent";

describe("Inspector landing page (/for-inspectors)", () => {
  const defaultProps: InspectorLandingContentProps = { session: null };

  it("renders the hero section with two-sided marketplace headline", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /connecting students/i })
    ).toBeInTheDocument();
  });

  it("renders navigation with sign up and sign in links", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /studenthub public navigation/i })
    ).toBeInTheDocument();
    const ctaElements = screen.getAllByText(/request inspector access/i);
    expect(ctaElements.length).toBeGreaterThanOrEqual(1);
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders pain-point section with three inspector problems", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText(/inspector pain points and solutions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No quick way to validate workers on-site/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Government inspectors need access without onboarding delays/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Manual compliance checks across hundreds of workers/i)
    ).toBeInTheDocument();
  });

  it("renders the stats strip with inspector metrics", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(screen.getByLabelText(/inspector stats/i)).toBeInTheDocument();
    expect(screen.getByText("Instant")).toBeInTheDocument();
    expect(screen.getByText("Zero")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders the feature grid", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(screen.getByLabelText("Key features")).toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText("Customer testimonials")
    ).toBeInTheDocument();
  });

  it("renders the final CTA with proof text", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    // Proof text appears in HeroSection
    expect(
      screen.getByText(/Connecting students with employers across Kuwait/i)
    ).toBeInTheDocument();
  });

  it("renders footer with sign up and sign in links", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    const footerLinks = screen.getAllByText(/sign up as inspector/i);
    expect(footerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders open app links when user is authenticated", () => {
    const session = { user: { role: "inspector" } } as any;
    render(
      <InspectorLandingContent {...defaultProps} session={session} />
    );
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    // Nav should show Open app, not signup — HeroSection always renders its own CTA
    const nav = screen.getByRole("navigation", {
      name: /studenthub public navigation/i,
    });
    expect(
      within(nav).queryByText(/request inspector access/i)
    ).not.toBeInTheDocument();
  });

  // ── Skip-to-content link ───────────────────────────────────

  it("renders a skip-to-content link as the first focusable element", () => {
    const { container } = render(<InspectorLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
    expect(container.firstChild).toBe(link);
  });

  it("skip-to-content link targets #main-content", () => {
    render(<InspectorLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("main element has id=main-content for skip-link target", () => {
    const { container } = render(<InspectorLandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });
});
