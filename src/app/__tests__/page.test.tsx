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

  beforeEach(() => {
    mockReplace.mockClear();
    // Ensure search params are empty per default
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  it("renders headline and CTA button", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /your institution/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get started/i })
    ).toBeInTheDocument();
  });

  it("renders TrustBar with correct text", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText(/trusted by/i)).toBeInTheDocument();
    expect(screen.getByText(/5,000/i)).toBeInTheDocument();
  });

  it("renders all 3 FeatureGrid items with icons and headings", () => {
    render(<LandingContent {...defaultProps} />);

    // Feature 1: integrated workflow
    expect(screen.getByText(/integrated/i)).toBeInTheDocument();

    // Feature 2: smart compliance
    expect(screen.getByText(/smart compliance/i)).toBeInTheDocument();

    // Feature 3: real-time insights
    expect(screen.getByText(/real.time insights/i)).toBeInTheDocument();
  });

  it("renders StatsCounter with correct count badges", () => {
    render(<LandingContent {...defaultProps} />);
    // CoreStats + marketing stats rendered
    const stats = screen.getAllByText(/5,000|\d+%/);
    expect(stats.length).toBeGreaterThan(0);
  });

  it("renders the hero section with CTAs", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText(/get started/i)).toBeInTheDocument();
    expect(screen.getByText(/learn more/i)).toBeInTheDocument();
  });

  it("does not render login form when user is not authenticated", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
  });

  it("redirects to dashboard when user is authenticated", () => {
    const session = { user: { role: "admin" } } as any;
    render(<LandingContent {...defaultProps} session={session} />);
    expect(mockReplace).toHaveBeenCalledWith("/workspace");
  });
});
