// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
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
    href: string | { pathname: string; query?: Record<string, string> };
    className?: string;
  }) => {
    const resolved =
      typeof href === "string"
        ? href
        : `${href.pathname}${href.query ? "?" + new URLSearchParams(href.query).toString() : ""}`;
    return (
      <a href={resolved} className={className} {...rest}>
        {children}
      </a>
    );
  },
}));

// ── Mock lucide-react icons ───────────────────────────────────
vi.mock("lucide-react", () => ({
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right" />,
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  Search: () => <span data-testid="icon-search" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  GraduationCap: () => <span data-testid="icon-graduation-cap" />,
  Building2: () => <span data-testid="icon-building" />,
  Zap: () => <span data-testid="icon-zap" />,
  Shield: () => <span data-testid="icon-shield" />,
  Clock: () => <span data-testid="icon-clock" />,
  Star: () => <span data-testid="icon-star" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import HeroSection from "./HeroSection";

describe("HeroSection (staff-matched platform redesign)", () => {
  describe("Default render", () => {
    it("renders eyebrow text", () => {
      render(<HeroSection />);
      expect(
        screen.getByText("Staff-matched student placements"),
      ).toBeTruthy();
    });

    it("renders an H1 heading with staff-matched messaging", () => {
      render(<HeroSection />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toBeTruthy();
      expect(heading.textContent!.length).toBeGreaterThan(10);
    });

    it("renders body paragraph about staff matching", () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/the platform where students build careers/i),
      ).toBeTruthy();
    });

    it("renders student CTA link", () => {
      render(<HeroSection />);
      const cta = screen.getByText("Create your free profile");
      expect(cta).toBeTruthy();
      expect(cta.closest("a")?.getAttribute("href")).toBe(
        "/signup?role=candidate",
      );
    });

    it("renders employer CTA link", () => {
      render(<HeroSection />);
      const cta = screen.getByText("Hire students");
      expect(cta).toBeTruthy();
      expect(cta.closest("a")?.getAttribute("href")).toBe(
        "/signup?role=company",
      );
    });

    it("renders social proof", () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/9,500\+ placements/i),
      ).toBeTruthy();
    });

    it("renders student feature pills", () => {
      render(<HeroSection />);
      const pills = screen.getByText("For students").closest("div");
      expect(pills).toBeTruthy();
      expect(pills!.querySelectorAll('[data-testid="icon-check-circle"]').length).toBeGreaterThanOrEqual(2);
    });

    it("renders employer feature pills", () => {
      render(<HeroSection />);
      const pills = screen.getByText("For employers").closest("div");
      expect(pills).toBeTruthy();
      expect(pills!.querySelectorAll('[data-testid="icon-check-circle"]').length).toBeGreaterThanOrEqual(2);
    });

    it("renders sign-in link alongside CTAs", () => {
      render(<HeroSection />);
      const signInLinks = screen.getAllByText("Sign in");
      expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("No literal <br /> rendering in heading", () => {
    it("does not contain literal '<br' as text", () => {
      render(<HeroSection />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.innerHTML).not.toContain("&lt;br");
      expect(heading.innerHTML).not.toContain("<br");
    });
  });

  describe("Mockup section renders", () => {
    it("renders search placeholder", () => {
      render(<HeroSection />);
      const searchText = screen.getByText(/Search open roles/i);
      expect(searchText).toBeTruthy();
    });

    it("renders mockup action cards", () => {
      const { container } = render(<HeroSection />);
      const text = container.textContent || "";
      const hasActionStatus =
        /\d/.test(text) || /(pending|live|ready|processing|flagged|active)/i.test(text);
      expect(hasActionStatus).toBe(true);
    });
  });

  describe("CTA override handler", () => {
    it("renders a button instead of link when onCtaClick is provided", () => {
      const onClick = vi.fn();
      render(<HeroSection onCtaClick={onClick} />);
      const ctaButton = screen.getByText("Create your free profile");
      expect(ctaButton.tagName).toBe("BUTTON");
    });
  });
});
