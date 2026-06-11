// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mock next/navigation ───────────────────────────────────────
const mockReplace = vi.fn();
const mockSearchParams = new Map<string, string>();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
    toString: () => "",
    forEach: (
      cb: (value: string, key: string) => void,
    ) => mockSearchParams.forEach((value, key) => cb(value, key)),
    delete: (key: string) => mockSearchParams.delete(key),
  }),
  useRouter: () => ({ replace: mockReplace }),
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
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// ── Mock lucide-react icons ───────────────────────────────────
vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  UserRound: () => <span data-testid="icon-user" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  Building2: () => <span data-testid="icon-building" />,
  Shield: () => <span data-testid="icon-shield" />,
  ClipboardCheck: () => <span data-testid="icon-clipboard" />,
  Zap: () => <span data-testid="icon-zap" />,
  Globe: () => <span data-testid="icon-globe" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Layers: () => <span data-testid="icon-layers" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  Command: () => <span data-testid="icon-command" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Search: () => <span data-testid="icon-search" />,
  PanelRightOpen: () => <span data-testid="icon-panel-right" />,
  GraduationCap: () => <span data-testid="icon-graduation-cap" />,
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  Menu: () => <span data-testid="icon-menu" />,
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  ArrowDown: () => <span data-testid="icon-arrow-down" />,
  Clock: () => <span data-testid="icon-clock" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  Timer: () => <span data-testid="icon-timer" />,
  Bell: () => <span data-testid="icon-bell" />,
  MessageSquare: () => <span data-testid="icon-message-square" />,
  FileText: () => <span data-testid="icon-file-text" />,
  Quote: () => <span data-testid="icon-quote" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  Star: () => <span data-testid="icon-star" />,
  PieChart: () => <span data-testid="icon-pie-chart" />,
  GitMerge: () => <span data-testid="icon-git-merge" />,
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  UsersRound: () => <span data-testid="icon-users-round" />,
  Users: () => <span data-testid="icon-users" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  Minus: () => <span data-testid="icon-minus" />,
  Award: () => <span data-testid="icon-award" />,
  Target: () => <span data-testid="icon-target" />,
}));

// ── Mock ThemeToggle ──────────────────────────────────────────
vi.mock("@/modules/theme/ThemeToggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" aria-label="Toggle theme" />,
}));

// ── Mock GlassPanel ───────────────────────────────────────────
vi.mock("@/components/ui/glass-panel", () => ({
  GlassPanel: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} data-glass-panel="" {...props}>
      {children}
    </div>
  ),
}));

// ── Mock marketing sub-components ─────────────────────────────
vi.mock("@/components/marketing", () => ({
  HeroSection: () => <section aria-label="StudentHub — connecting students with the right employers" className="shHeroGradientDramatic" data-testid="hero-section" />,
  StatsSection: () => <section aria-label="Platform statistics" data-testid="stats-section" />,
  HowItWorks: () => (
    <div>
      <p>How it works</p>
      <h2>From profile to placement in three steps.</h2>
      <h3>Create your profile</h3>
      <h3>Get matched</h3>
      <h3>Get hired</h3>
    </div>
  ),
  EmployerSection: () => <section aria-label="For employers" data-testid="employer-section" />,
  TestimonialCarousel: () => <section aria-label="Customer testimonials" data-testid="testimonial-carousel" />,
  ComparisonTable: () => <section aria-label="Feature comparison" data-testid="comparison-table" />,
  PersonaSwitcher: ({ active, onChange }: { active: string; onChange: (p: any) => void }) => (
    <div role="tablist" data-testid="persona-switcher" data-active={active}>
      <button onClick={() => onChange("candidate")}>Candidate</button>
      <button onClick={() => onChange("company")}>Company</button>
    </div>
  ),
  FadeInSection: ({ children, asDiv, className, ...rest }: any) => {
    const Tag = asDiv ? "div" : "section";
    return <Tag className={className} {...rest}>{children}</Tag>;
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import LandingContent from "../LandingContent";
import type { LandingContentProps } from "../LandingContent";

// ── Tests ──────────────────────────────────────────────────────

describe("Landing page (two-sided marketplace redesign)", () => {
  const defaultProps: LandingContentProps = {
    session: null,
  };

  const sessionProps: LandingContentProps = {
    session: {
      id: "test-123",
      email: "test@example.com",
      role: "candidate",
      name: "Test User",
    },
  };

  beforeEach(() => {
    mockReplace.mockClear();
    // Ensure search params are empty per default
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  it("renders the hero section", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByTestId("hero-section")
    ).toBeInTheDocument();
  });

  it("renders navigation with sign up and sign in links for unauthenticated users", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /StudentHub public navigation/i })
    ).toBeInTheDocument();
    // Nav CTA for candidate mode
    expect(screen.getByText("Create free candidate profile")).toBeInTheDocument();
    // "Sign in" appears in nav and footer
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the how it works section", () => {
    render(<LandingContent {...defaultProps} />);
    const howItWorksEls = screen.getAllByText("How it works");
    expect(howItWorksEls.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Create your profile")).toBeInTheDocument();
    expect(screen.getByText("Get matched")).toBeInTheDocument();
    expect(screen.getByText("Get hired")).toBeInTheDocument();
  });

  it("renders the stats section", () => {
    render(<LandingContent {...defaultProps} />);
    const stats = document.querySelector("section[aria-label='Platform statistics']");
    expect(stats).toBeInTheDocument();
  });

  it("does not render the old feature grid (replaced by HowItWorks)", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.queryByLabelText("Key features")).not.toBeInTheDocument();
    expect(screen.queryByText(/smart role discovery/i)).not.toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText("Customer testimonials")
    ).toBeInTheDocument();
  });

  it("renders the final CTA section with description", () => {
    render(<LandingContent {...defaultProps} />);
    const descriptions = screen.getAllByText(/Kuwait/i);
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with sign up link", () => {
    render(<LandingContent {...defaultProps} />);
    const footerLinks = screen.getAllByText(/sign up/i);
    expect(footerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with internal role descriptions", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText(/Staff:/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin:/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspector:/i)).toBeInTheDocument();
  });

  // ── Skip-to-content link ───────────────────────────────────

  it("renders a skip-to-content link", () => {
    render(<LandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
  });

  it("skip-to-content link targets #main-content", () => {
    render(<LandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link.className).toContain("skipLink");
  });

  it("main element has id=main-content for skip-link target", () => {
    const { container } = render(<LandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });

  it("renders open app links when user is authenticated", () => {
    render(<LandingContent {...defaultProps} session={sessionProps.session} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/create free candidate profile/i)).not.toBeInTheDocument();
  });

  describe("Navigation styling", () => {
    it("renders nav with shGlassNav class", () => {
      render(<LandingContent {...defaultProps} />);
      const nav = document.querySelector("nav");
      expect(nav?.className).toContain("shGlassNav");
    });

    it("renders nav inner wrapper with shGlassNavInner class", () => {
      render(<LandingContent {...defaultProps} />);
      const nav = document.querySelector("nav");
      const inner = nav?.querySelector('[class*="shGlassNavInner"]');
      expect(inner).toBeTruthy();
    });

    it("renders SH brand mark in nav", () => {
      render(<LandingContent {...defaultProps} />);
      const nav = document.querySelector("nav");
      const shSpan = nav?.querySelector('[class*="font-bold text-white"]');
      expect(shSpan?.textContent).toBe("SH");
    });
  });

  describe("Mobile viewport responsiveness", () => {
    it("renders max-sm responsive width constraints on main container", () => {
      render(<LandingContent {...defaultProps} />);
      const main = document.querySelector("main");
      expect(main?.className).toContain("max-sm");
    });

    it("renders final CTA section with gradient background", () => {
      render(<LandingContent {...defaultProps} />);
      const heroGradient = document.querySelector('[class*="shHeroGradientDramatic"]');
      expect(heroGradient).toBeTruthy();
    });
  });
});
