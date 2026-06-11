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
  Handshake: () => <span data-testid="icon-handshake" />,
  Fingerprint: () => <span data-testid="icon-fingerprint" />,
  Eye: () => <span data-testid="icon-eye" />,
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
import LandingContent from "../LandingContent";
import type { LandingContentProps } from "../LandingContent";

// ── Tests ──────────────────────────────────────────────────────

describe("Landing page (Zendesk coral redesign)", () => {
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
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  // ── Hero ─────────────────────────────────────────────────────

  it("renders the hero section with headline", () => {
    render(<LandingContent {...defaultProps} />);
    // Hero section: heading mentions staff recruiters (Dosu-verified business model)
    const staffRecruiter = screen.getAllByText(/staff recruiter/i);
    expect(staffRecruiter.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/create free profile/i)
    ).toBeInTheDocument();
  });

  // ── Navigation ───────────────────────────────────────────────

  it("renders navigation with sign up and sign in for unauthenticated users", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText("Get started")).toBeInTheDocument();
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders SH brand in nav", () => {
    render(<LandingContent {...defaultProps} />);
    const shElements = screen.getAllByText("SH");
    expect(shElements.length).toBeGreaterThanOrEqual(1);
    expect(shElements[0]).toHaveClass("font-bold", { exact: false });
  });

  it("renders StudentHub text in nav", () => {
    render(<LandingContent {...defaultProps} />);
    const shTexts = screen.getAllByText("StudentHub");
    expect(shTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── How it works ─────────────────────────────────────────────

  it("renders the how it works section", () => {
    render(<LandingContent {...defaultProps} />);
    const howItWorks = screen.getAllByText(/how it works/i);
    expect(howItWorks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Create your profile")).toBeInTheDocument();
    expect(screen.getByText(/get matched/i)).toBeInTheDocument();
  });

  // ── Stats ────────────────────────────────────────────────────

  it("renders stats with real numbers", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getAllByText("10,000+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("500+").length).toBeGreaterThanOrEqual(1);
  });

  // ── Features ─────────────────────────────────────────────────

  it("renders platform features section", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText("Platform features")).toBeInTheDocument();
    expect(screen.getByText("Staff-driven matching")).toBeInTheDocument();
    expect(screen.getByText("Smart search")).toBeInTheDocument();
    expect(screen.getByText("Timesheets")).toBeInTheDocument();
    expect(screen.getByText("Compliance")).toBeInTheDocument();
  });

  // ── Testimonials ─────────────────────────────────────────────

  it("renders testimonials section", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText("Real stories from real placements")).toBeInTheDocument();
  });

  // ── CTA ──────────────────────────────────────────────────────

  it("renders final CTA section", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText("Start your journey")).toBeInTheDocument();
    expect(screen.getByText("Your next role is one profile away.")).toBeInTheDocument();
    expect(screen.getByText("Create your free profile")).toBeInTheDocument();
  });

  // ── Footer ───────────────────────────────────────────────────

  it("renders footer with copyright", () => {
    render(<LandingContent {...defaultProps} />);
    const hubTexts = screen.getAllByText(/StudentHub/i);
    expect(hubTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with role descriptions", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText(/Staff portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspector portal/i)).toBeInTheDocument();
  });

  // ── Skip-to-content ─────────────────────────────────────────

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

  it("main element has id=main-content", () => {
    const { container } = render(<LandingContent {...defaultProps} />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
  });

  // ── Persona switching ────────────────────────────────────────

  it("renders persona toggle with both options", () => {
    render(<LandingContent {...defaultProps} />);
    expect(screen.getByText("I'm looking for work")).toBeInTheDocument();
    const hiringTexts = screen.getAllByText("I'm hiring");
    expect(hiringTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Company persona ─────────────────────────────────────────

  it("renders company-specific content when persona=company", () => {
    mockSearchParams.set("persona", "company");
    render(<LandingContent {...defaultProps} />);
    // "Set up company account" appears in hero CTA and CTA section
    const companyCTA = screen.getAllByText("Set up company account");
    expect(companyCTA.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("How hiring works")).toBeInTheDocument();
    expect(screen.getByText("Start hiring today")).toBeInTheDocument();
  });

  // ── Authenticated state ──────────────────────────────────────

  it("renders open app link when user is authenticated", () => {
    render(<LandingContent {...defaultProps} {...sessionProps} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Get started")).not.toBeInTheDocument();
  });

  // ── Business model accuracy (Dosu-verified) ──────────────────

  it("mentions staff-driven matching in the copy", () => {
    render(<LandingContent {...defaultProps} />);
    const staffMentions = screen.getAllByText(/staff/i);
    expect(staffMentions.length).toBeGreaterThanOrEqual(1);
  });

  // ── Trust bar ────────────────────────────────────────────────

  it("renders employer trust bar", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByText(/trusted by leading organizations/i)
    ).toBeInTheDocument();
  });

  // ── Comparison table ─────────────────────────────────────────

  it("renders comparison table", () => {
    render(<LandingContent {...defaultProps} />);
    expect(
      screen.getByText("Why StudentHub is different")
    ).toBeInTheDocument();
  });
});
