// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mock next/navigation (useRouter, useSearchParams) ────────
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
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
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Layers: () => <span data-testid="icon-layers" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Command: () => <span data-testid="icon-command" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Search: () => <span data-testid="icon-search" />,
  PanelRightOpen: () => <span data-testid="icon-panel-right" />,
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right" />,
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  Clock: () => <span data-testid="icon-clock" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  Bell: () => <span data-testid="icon-bell" />,
  MessageSquare: () => <span data-testid="icon-message-square" />,
  FileText: () => <span data-testid="icon-file-text" />,
  Quote: () => <span data-testid="icon-quote" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  Star: () => <span data-testid="icon-star" />,
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  UsersRound: () => <span data-testid="icon-users-round" />,
  Check: () => <span data-testid="icon-check" />,
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
import LandingContent from "../LandingContent";
import type { LandingContentProps } from "../LandingContent";

// ── Tests ──────────────────────────────────────────────────────

describe("Landing page (marketing redesign)", () => {
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

  it("renders the hero section with candidate headline", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /your next placement/i })
    ).toBeInTheDocument();
    // CTA text appears in both nav and hero — use getAllByText
    const ctaElements = screen.getAllByText(/create (your )?free candidate profile/i);
    expect(ctaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders navigation with sign up and sign in links for unauthenticated users", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /StudentHub public navigation/i })
    ).toBeInTheDocument();
    // "Create free student profile" appears in nav
    const navCta = screen.getAllByText(/create free student profile/i);
    expect(navCta.length).toBeGreaterThanOrEqual(1);
    // "Sign in" appears in nav hero and footer — use getAllByText
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the feature grid section", () => {
    render(<LandingContent {...defaultProps} />);
    // FeatureGrid has an aria-label "Key features" section
    const featureSection = screen.getByLabelText("Key features");
    expect(featureSection).toBeInTheDocument();
    // Candidate features include "Smart role discovery"
    expect(screen.getByText(/smart role discovery/i)).toBeInTheDocument();
  });

  it("renders the testimonial carousel", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByLabelText("Customer testimonials")
    ).toBeInTheDocument();
  });

  it("renders the final CTA section with proof text", () => {
    render(<LandingContent {...defaultProps} />);
    // Candidate proof text mentions candidates placed
    const proofTexts = screen.getAllByText(/candidates placed this year/i);
    expect(proofTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with sign up and sign in links", () => {
    render(<LandingContent {...defaultProps} />);
    const footerLinks = screen.getAllByText(/sign up as candidate/i);
    expect(footerLinks.length).toBeGreaterThanOrEqual(1);
  });

  // ── Skip-to-content link ───────────────────────────────────

  it("renders a skip-to-content link as the first focusable element", () => {
    const { container } = render(<LandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
    // Must be the very first child inside the fragment
    expect(container.firstChild).toBe(link);
  });

  it("skip-to-content link targets #main-content", () => {
    render(<LandingContent {...defaultProps} />);
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
    // Has sr-only + focus:not-sr-only pattern
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("main element has id=main-content for skip-link target", () => {
    const { container } = render(<LandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });

  it("renders open app links when user is authenticated", () => {
    const session = { user: { role: "admin" } } as any;
    render(<LandingContent {...defaultProps} session={session} />);
    // Authenticated users see "Open app" links instead of signup CTAs
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    // No signup CTAs for authenticated users
    expect(screen.queryByText(/create free candidate profile/i)).not.toBeInTheDocument();
  });

  describe("Glass navigation styling", () => {
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
      const brandMark = screen.getByText("SH");
      expect(brandMark).toBeTruthy();
    });
  });

  describe("Mobile viewport responsiveness", () => {
    it("renders max-sm responsive width constraints on main container", () => {
      render(<LandingContent {...defaultProps} />);
      const main = document.querySelector("main");
      expect(main?.className).toContain("max-sm");
    });

    it("renders final CTA section with shHeroGradientDramatic", () => {
      render(<LandingContent {...defaultProps} />);
      const gradients = document.querySelectorAll(".shHeroGradientDramatic");
      // One in HeroSection, one in final CTA
      expect(gradients.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Snapshot — landing page full layout", () => {
    it("renders consistently with unauthenticated state", () => {
      const { container } = render(<LandingContent {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it("renders consistently with authenticated state", () => {
      const { container } = render(<LandingContent {...sessionProps} />);
      expect(container).toMatchSnapshot();
    });
  });
});
