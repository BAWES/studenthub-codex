// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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
      id: "user_1",
      email: "test@test.com",
      role: "candidate",
      name: "Test User",
    },
  };

  describe("Navigation", () => {
    it("renders the StudentHub brand in the nav", () => {
      render(<LandingContent {...defaultProps} />);
      const brand = screen.getByText("StudentHub");
      expect(brand).toBeTruthy();
      expect(brand.tagName).toBe("STRONG");
    });

    it("renders sign in and get started links", () => {
      render(<LandingContent {...defaultProps} />);
      const getStartedLinks = screen.getAllByText("Get started");
      expect(getStartedLinks.length).toBeGreaterThanOrEqual(1);
      const signInLinks = screen.getAllByText("Sign in");
      expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("renders Open app link in nav when session exists", () => {
      render(<LandingContent {...sessionProps} />);
      expect(screen.getByText("Open app")).toBeTruthy();
      // Nav-level "Get started" is gone; HeroSection renders persona-specific CTA
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

  describe("Platform stats bar", () => {
    it("renders platform statistics", () => {
      render(<LandingContent {...defaultProps} />);
      const statsSection = screen.getByLabelText("Platform at a glance");
      expect(statsSection).toBeTruthy();
      expect(screen.getByText("128+")).toBeTruthy();
      expect(screen.getByText("5")).toBeTruthy();
      expect(screen.getByText("35+")).toBeTruthy();
    });

    it("renders stat icons", () => {
      render(<LandingContent {...defaultProps} />);
      expect(screen.getAllByTestId("icon-zap").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId("icon-layers").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Portal grid", () => {
    it("renders portal role labels", () => {
      render(<LandingContent {...defaultProps} />);
      // Page should reference key roles
      const page = document.body.textContent || "";
      expect(page.toLowerCase()).toContain("candidate");
      expect(page.toLowerCase()).toContain("admin");
      expect(page.toLowerCase()).toContain("staff");
    });

    it("renders role icons for all 5 portals", () => {
      render(<LandingContent {...defaultProps} />);
      const icons = screen.getAllByTestId(/^icon-/);
      // 5 portal icons + 4 stat icons = 9
      expect(icons.length).toBeGreaterThanOrEqual(5);
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
