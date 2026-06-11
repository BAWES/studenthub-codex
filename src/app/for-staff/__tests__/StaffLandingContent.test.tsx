// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
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
import StaffLandingContent from "../StaffLandingContent";
import type { StaffLandingContentProps } from "../StaffLandingContent";

describe("Staff landing page (/for-staff)", () => {
  const defaultProps: StaffLandingContentProps = { session: null };

  it("renders the hero section with staff headline", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /your next placement/i })
    ).toBeInTheDocument();
  });

  it("renders navigation with sign up and sign in links", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /studenthub public navigation/i })
    ).toBeInTheDocument();
    const ctaElements = screen.getAllByText(/request staff access/i);
    expect(ctaElements.length).toBeGreaterThanOrEqual(1);
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders pain-point section with three staffing problems", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText(/staffing pain points and solutions/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/hours wasted matching/i)).toBeInTheDocument();
    expect(
      screen.getByText(/placement paperwork drowning/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/compliance deadlines that keep you up/i)
    ).toBeInTheDocument();
  });

  it("renders the stats strip with staffing metrics", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(screen.getByLabelText(/staffing stats/i)).toBeInTheDocument();
    expect(screen.getByText("350+")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("renders the feature grid section", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(screen.getByLabelText("Key features")).toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText("Customer testimonials")
    ).toBeInTheDocument();
  });

  it("renders the final CTA with staffing proof text", () => {
    render(<StaffLandingContent {...defaultProps} />);
    expect(screen.getByText(/350\+ agencies/i)).toBeInTheDocument();
  });

  it("renders footer with sign up and sign in links", () => {
    render(<StaffLandingContent {...defaultProps} />);
    const footerLinks = screen.getAllByText(/sign up as staff/i);
    expect(footerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders open app links when user is authenticated", () => {
    const session = { user: { role: "staff" } } as any;
    render(<StaffLandingContent {...defaultProps} session={session} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    // Nav should show Open app, not signup — HeroSection always renders its own CTA
    const nav = screen.getByRole("navigation", {
      name: /studenthub public navigation/i,
    });
    expect(
      within(nav).queryByText(/request staff access/i)
    ).not.toBeInTheDocument();
  });

  // ── Skip-to-content link ───────────────────────────────────

  it("renders a skip-to-content link as the first focusable element", () => {
    const { container } = render(<StaffLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
    expect(container.firstChild).toBe(link);
  });

  it("skip-to-content link targets #main-content", () => {
    render(<StaffLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("main element has id=main-content for skip-link target", () => {
    const { container } = render(<StaffLandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });
});
