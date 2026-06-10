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
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
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
import CandidateLandingContent from "../CandidateLandingContent";
import type { CandidateLandingContentProps } from "../CandidateLandingContent";

describe("Candidate landing page (/for-candidates)", () => {
  const defaultProps: CandidateLandingContentProps = { session: null };

  it("renders the hero section with candidate headline", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    // HeroSection renders h1 with persona-specific content
    expect(
      screen.getByRole("heading", { level: 1, name: /your next placement/i })
    ).toBeInTheDocument();
  });

  it("renders navigation with sign up and sign in links", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /studenthub public navigation/i })
    ).toBeInTheDocument();
    const createLinks = screen.getAllByText(/create free profile/i);
    expect(createLinks.length).toBeGreaterThanOrEqual(1);
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders pain-point section with three candidate problems", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText(/candidate pain points and solutions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/can't get hired without experience/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a single job for years gives you a thin CV/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/compliance paperwork is a nightmare/i)
    ).toBeInTheDocument();
  });

  it("renders the stats strip with candidate metrics", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    expect(screen.getByLabelText(/candidate stats/i)).toBeInTheDocument();
    expect(screen.getByText("1,200+")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders the feature grid", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    expect(screen.getByLabelText("Key features")).toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText("Customer testimonials")
    ).toBeInTheDocument();
  });

  it("renders the final CTA with candidate proof text", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    const ctaSection = screen.getByLabelText(/get started as a candidate/i);
    expect(
      within(ctaSection).getByText(/1,200\+ active student placements/i)
    ).toBeInTheDocument();
  });

  it("renders footer with sign up and sign in links", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    const footerLinks = screen.getAllByText(/sign up as candidate/i);
    expect(footerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders open app links when user is authenticated", () => {
    const session = { id: "1", email: "user@test.com", role: "candidate", name: "Test" };
    render(<CandidateLandingContent {...defaultProps} session={session} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    const nav = screen.getByRole("navigation", {
      name: /studenthub public navigation/i,
    });
    expect(
      within(nav).queryByText(/create free profile/i)
    ).not.toBeInTheDocument();
  });

  // ── Skip-to-content link ───────────────────────────────────

  it("renders a skip-to-content link as the first focusable element", () => {
    const { container } = render(<CandidateLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
    expect(container.firstChild).toBe(link);
  });

  it("skip-to-content link targets #main-content", () => {
    render(<CandidateLandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("main element has id=main-content for skip-link target", () => {
    const { container } = render(<CandidateLandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });
});
