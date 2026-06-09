// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mock next/navigation ────────────────────────────────────────
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
vi.mock("lucide-react", () => {
  const icon = (testId: string) => ({ className, ...rest }: Record<string, unknown>) =>
    <span data-testid={testId} className={className as string} {...rest} />;
  return {
    ArrowUpRight: icon("icon-arrow-up-right"),
    BarChart3: icon("icon-bar-chart-3"),
    Bell: icon("icon-bell"),
    Building2: icon("icon-building-2"),
    Check: icon("icon-check"),
    CheckCircle2: icon("icon-check-circle-2"),
    ChevronLeft: icon("icon-chevron-left"),
    ChevronRight: icon("icon-chevron-right"),
    ClipboardCheck: icon("icon-clipboard-check"),
    Clock: icon("icon-clock"),
    CreditCard: icon("icon-credit-card"),
    FileText: icon("icon-file-text"),
    Globe: icon("icon-globe"),
    Layers: icon("icon-layers"),
    MessageSquare: icon("icon-message-square"),
    Minus: icon("icon-minus"),
    Quote: icon("icon-quote"),
    Search: icon("icon-search"),
    Shield: icon("icon-shield"),
    ShieldCheck: icon("icon-shield-check"),
    Sparkles: icon("icon-sparkles"),
    Star: icon("icon-star"),
    UserRound: icon("icon-user-round"),
    UsersRound: icon("icon-users-round"),
    X: icon("icon-x"),
    Zap: icon("icon-zap"),
  };
});

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
      id: "user_1",
      email: "test@test.com",
      role: "candidate",
      name: "Test User",
    },
  };

  describe("Navigation", () => {
    it("renders the StudentHub brand in the nav", () => {
      render(<LandingContent {...defaultProps} />);
      const brands = screen.getAllByText("StudentHub");
      expect(brands.length).toBeGreaterThanOrEqual(1);
      expect(brands[0].tagName).toBe("STRONG");
    });

    it("renders sign in and persona CTA links", () => {
      render(<LandingContent {...defaultProps} />);
      const ctaLinks = screen.getAllByText("Create free candidate profile");
      expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
      const signInLinks = screen.getAllByText("Sign in");
      expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders Open app link in nav when session exists", () => {
      render(<LandingContent {...sessionProps} />);
      const openAppLinks = screen.getAllByText("Open app");
      expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
      // Nav-level CTA switches to "Open app", but bottom CTA still shows persona CTA
      expect(screen.queryAllByText("Get started").length).toBe(0);
      expect(screen.getByText("Create your free candidate profile")).toBeTruthy();
    });

    it("renders the theme toggle", () => {
      render(<LandingContent {...defaultProps} />);
      expect(screen.getByTestId("theme-toggle")).toBeTruthy();
    });
  });

  describe("Hero section", () => {
    it("renders the hero headline", () => {
      render(<LandingContent {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toBeTruthy();
    });

    it("renders the product tagline / eyebrow text", () => {
      render(<LandingContent {...defaultProps} />);
      const eyebrow = document.querySelector('[class*="Eyebrow"]');
      expect(eyebrow?.textContent).toBeTruthy();
    });

    it("renders CTA buttons in the hero", () => {
      render(<LandingContent {...defaultProps} />);
      const ctas = screen.getAllByText(/Get started|Sign in/);
      expect(ctas.length).toBeGreaterThanOrEqual(1);
    });

    it("renders platform goal pills", () => {
      render(<LandingContent {...defaultProps} />);
      const goals = screen.getByLabelText("Key benefits for candidates");
      expect(goals).toBeTruthy();
    });
  });

  describe("Feature grid", () => {
    it("renders feature cards with icons", () => {
      render(<LandingContent {...defaultProps} />);
      const icons = screen.getAllByTestId(/^icon-/);
      expect(icons.length).toBeGreaterThanOrEqual(5);
    });

    it("renders feature headings per role", () => {
      render(<LandingContent {...defaultProps} />);
      const page = document.body.textContent || "";
      expect(page.toLowerCase()).toContain("candidate");
      expect(page.toLowerCase()).toContain("admin");
      expect(page.toLowerCase()).toContain("staff");
    });
  });

  describe("Marketing sections", () => {
    it("renders substantial content (more than 500 chars)", () => {
      render(<LandingContent {...defaultProps} />);
      const page = document.body.textContent || "";
      expect(page.length).toBeGreaterThan(500);
    });

    it("renders an action-oriented CTA or navigation links", () => {
      render(<LandingContent {...defaultProps} />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Visual quality", () => {
    it("maintains a responsive layout wrapper", () => {
      render(<LandingContent {...defaultProps} />);
      const main = document.querySelector("main");
      expect(main).toBeTruthy();
      expect(main!.className).toContain("min-h");
    });

    it("includes proper aria labels for accessibility", () => {
      render(<LandingContent {...defaultProps} />);
      const labelledSections = document.querySelectorAll("[aria-label]");
      expect(labelledSections.length).toBeGreaterThanOrEqual(2);
    });
  });
});
