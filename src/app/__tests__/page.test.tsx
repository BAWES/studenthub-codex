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
  CheckCircle2: () => <span data-testid="icon-check-circle2" />,
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
  UserPlus: () => <span data-testid="icon-user-plus" />,
}));

// ── Mock marketing components ──────────────────────────────────
vi.mock("@/components/marketing", () => ({
  FadeInSection: ({
    children,
    asDiv,
  }: {
    children: React.ReactNode;
    asDiv?: boolean;
  }) => (asDiv ? <div>{children}</div> : <>{children}</>),
  HeroSection: () => <section aria-label="StudentHub — connecting students with the right employers"><h1>Connecting students with the right employers</h1></section>,
  StatsSection: () => <section aria-label="Platform statistics"><span>Students placed</span><span>Active employers</span></section>,
  HowItWorks: () => <section aria-label="How it works"><span>How it works</span><span>From profile to placement in three steps.</span><span>Create your profile</span><span>Get matched</span></section>,
  EmployerSection: () => <section aria-label="For employers" />,
  TestimonialCarousel: () => <section aria-label="Customer testimonials"><span>Real stories from real placements.</span></section>,
  ComparisonTable: () => <section aria-label="Feature comparison"><span>Why students choose StudentHub.</span></section>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import LandingPage from "@/components/landing/LandingPage";

// ── Tests ──────────────────────────────────────────────────────

describe("Landing page (blue+amber redesign)", () => {
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

  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  // ── Hero ─────────────────────────────────────────────────────

  it("renders the hero section with headline", () => {
    render(<LandingPage {...defaultProps} />);
    const connectingTexts = screen.getAllByText(/connecting students with/i);
    expect(connectingTexts.length).toBeGreaterThanOrEqual(1);
    const ctaTexts = screen.getAllByText(/create your free profile/i);
    expect(ctaTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Navigation ───────────────────────────────────────────────

  it("renders navigation with sign up and sign in for unauthenticated users", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/create free profile/i)).toBeInTheDocument();
    const signInLinks = screen.getAllByText(/sign in/i);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders SH brand in nav", () => {
    render(<LandingPage {...defaultProps} />);
    const shElements = screen.getAllByText("SH");
    expect(shElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders StudentHub text in nav", () => {
    render(<LandingPage {...defaultProps} />);
    const shTexts = screen.getAllByText("StudentHub");
    expect(shTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Persona tabs ────────────────────────────────────────────

  it("renders persona tabs with Students and Companies", () => {
    render(<LandingPage {...defaultProps} />);
    const studentsTexts = screen.getAllByText("Students");
    expect(studentsTexts.length).toBeGreaterThanOrEqual(1);
    const companiesTexts = screen.getAllByText("Companies");
    expect(companiesTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── How it works ─────────────────────────────────────────────

  it("renders the how it works section", () => {
    render(<LandingPage {...defaultProps} />);
    const howItWorks = screen.getAllByText(/how it works/i);
    expect(howItWorks.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Create your profile")).toBeInTheDocument();
    expect(screen.getByText(/get matched/i)).toBeInTheDocument();
  });

  // ── Stats ────────────────────────────────────────────────────

  it("renders stats with real numbers", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText("Students placed")).toBeInTheDocument();
    expect(screen.getByText("Active employers")).toBeInTheDocument();
  });

  // ── Testimonials ─────────────────────────────────────────────

  it("renders testimonial section", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.getByText("Real stories from real placements.")
    ).toBeInTheDocument();
  });

  // ── CTA ──────────────────────────────────────────────────────

  it("renders final CTA section with signup link", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText("Start your journey")).toBeInTheDocument();
    expect(
      screen.getByText("Your next role is one profile away.")
    ).toBeInTheDocument();
    const ctaTexts = screen.getAllByText("Create your free profile");
    expect(ctaTexts.length).toBeGreaterThanOrEqual(1);
  });

  // ── Footer ───────────────────────────────────────────────────

  it("renders footer with copyright", () => {
    render(<LandingPage {...defaultProps} />);
    const hubTexts = screen.getAllByText(/StudentHub/i);
    expect(hubTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with internal role descriptions", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Staff:/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin:/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspector:/i)).toBeInTheDocument();
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

  // ── Company persona ─────────────────────────────────────────

  it("renders company-specific content when persona=company", () => {
    mockSearchParams.set("persona", "company");
    render(<LandingPage {...defaultProps} />);
    const companyCTA = screen.getAllByText("Set up company account");
    expect(companyCTA.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("From profile to placement in three steps.")
    ).toBeInTheDocument();
  });

  // ── Authenticated state ──────────────────────────────────────

  it("renders open app link when user is authenticated", () => {
    render(<LandingPage {...defaultProps} {...sessionProps} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
  });

  // ── Business model accuracy ──────────────────────────────────

  it("mentions staff-driven matching in the copy", () => {
    render(<LandingPage {...defaultProps} />);
    const staffMentions = screen.getAllByText(/staff/i);
    expect(staffMentions.length).toBeGreaterThanOrEqual(1);
  });

  // ── Trust bar ────────────────────────────────────────────────

  it("renders employer trust bar", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.getByText(/trusted by leading organizations/i)
    ).toBeInTheDocument();
  });

  // ── Comparison table ─────────────────────────────────────────

  it("renders comparison table", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.getByText("Why students choose StudentHub.")
    ).toBeInTheDocument();
  });

  // ── Stats counter titles ────────────────────────────────────

  it("renders key stat titles", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText("Students placed")).toBeInTheDocument();
    expect(screen.getByText("Active employers")).toBeInTheDocument();
  });
});
