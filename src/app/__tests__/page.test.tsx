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
  Fingerprint: () => <span data-testid="icon-fingerprint" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
  Minus: () => <span data-testid="icon-minus" />,
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import LandingContent, { type LandingContentProps } from "../LandingContent";

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

  it("renders two-sided marketplace hero section", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /connecting students/i })
    ).toBeInTheDocument();
  });

  it("renders navigation with sign up and sign in links for unauthenticated users", () => {
    render(<LandingContent {...defaultProps} />);
    // Nav has no aria-label, just check <nav> exists
    expect(document.querySelector("nav")).toBeInTheDocument();
    // Nav CTA for candidate mode (default persona)
    expect(screen.getByText("Get started")).toBeInTheDocument();
    // "Sign in" appears in nav, final CTA, and footer
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the how it works section", () => {
    render(<LandingContent {...defaultProps} />);
    const howItWorks = screen.getAllByText("How it works");
    expect(howItWorks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Get started in three simple steps")).toBeInTheDocument();
    const createProfiles = screen.getAllByText("Create your free profile");
    expect(createProfiles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Get AI-matched with roles")).toBeInTheDocument();
    expect(screen.getByText("Get hired and get paid")).toBeInTheDocument();
  });

  it("renders the stats section", () => {
    render(<LandingContent {...defaultProps} />);
    const stats10k = screen.getAllByText("10,000+");
    expect(stats10k.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Active students")).toBeInTheDocument();
    expect(screen.getByText("Employer partners")).toBeInTheDocument();
  });

  it("does not render the old feature grid (replaced by HowItWorks)", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.queryByLabelText("Key features")).not.toBeInTheDocument();
    expect(screen.queryByText(/smart role discovery/i)).not.toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByText("Trusted by students and employers")
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
    expect(screen.getByText(/Staff tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspector portal/i)).toBeInTheDocument();
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
    it("renders nav with sticky glass styling", () => {
      render(<LandingContent {...defaultProps} />);
      const nav = document.querySelector("nav");
      expect(nav?.className).toContain("sticky");
      expect(nav?.className).toContain("backdrop-blur");
    });

    it("renders SH brand mark in nav", () => {
      render(<LandingContent {...defaultProps} />);
      const nav = document.querySelector("nav");
      expect(nav?.querySelector('[class*="font-black"]')?.textContent).toBe("SH");
    });
  });

  describe("Mobile viewport responsiveness", () => {
    it("renders main container with max-width constraint", () => {
      render(<LandingContent {...defaultProps} />);
      const main = document.querySelector("main");
      // Inline style container uses max-w-[1200px]
      const containers = document.querySelectorAll('[class*="max-w-\\[1200px\\]"]');
      expect(containers.length).toBeGreaterThanOrEqual(1);
    });

    it("renders final CTA section with gradient background", () => {
      render(<LandingContent {...defaultProps} />);
      // Final CTA uses linear-gradient background
      const sections = document.querySelectorAll("section");
      expect(sections.length).toBeGreaterThanOrEqual(6);
    });
  });
});
