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
  ArrowUpRight: () => <span data-testid="icon-arrow-up-right" />,
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  Search: () => <span data-testid="icon-search" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import HeroSection from "./HeroSection";
import type { Persona } from "./HeroSection";

// ── All 5 personas ────────────────────────────────────────────
const ALL_PERSONAS: Persona[] = ["candidate", "staff", "company", "admin", "inspector"];

describe("HeroSection (OS glass redesign)", () => {
  describe("Default render", () => {
    it("renders with candidate persona by default", () => {
      render(<HeroSection />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toBeTruthy();
      expect(screen.getByText("StudentHub for candidates")).toBeTruthy();
    });

    it("renders aria-label for the section with correct persona plural", () => {
      render(<HeroSection />);
      const section = document.querySelector("section");
      expect(section?.getAttribute("aria-label")).toBe("StudentHub for candidates — hero");
    });
  });

  describe("All 5 personas render persona-specific content", () => {
    ALL_PERSONAS.forEach((persona) => {
      it(`renders the correct eyebrow for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        // Each persona has a unique eyebrow prefix
        const prefix = `StudentHub for ${persona === "company" ? "companies" : persona === "candidate" ? "candidates" : persona === "admin" ? "admins" : persona === "inspector" ? "inspectors" : "staff"}`;
        expect(screen.getByText(prefix)).toBeTruthy();
      });

      it(`renders a visible H1 for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading.textContent).toBeTruthy();
        expect(heading.textContent!.length).toBeGreaterThan(5);
      });

      it(`renders CTA button for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const ctaLink = screen.getByRole("link", { name: /profile|access|account/i });
        expect(ctaLink).toBeTruthy();
        expect(ctaLink.getAttribute("href")).toBeTruthy();
      });

      it(`renders social proof for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        // Proof contains numbers or percentage signs
        const proofEl = document.querySelector('[class*="Proof"]');
        expect(proofEl?.textContent).toBeTruthy();
      });

      it(`renders persona-specific feature pills for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const pillsContainer = screen.getByLabelText(
          `Key benefits for ${persona === "staff" ? "staff" : `${persona}s`}`,
        );
        expect(pillsContainer).toBeTruthy();
        expect(pillsContainer.children.length).toBeGreaterThanOrEqual(2);
      });

      it(`renders sign-in link alongside CTA for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const signInLinks = screen.getAllByText("Sign in");
        expect(signInLinks.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Mockup section renders for all personas", () => {
    ALL_PERSONAS.forEach((persona) => {
      it(`renders mockup search placeholder for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const searchTexts = screen.getAllByText(/Search|Review|Find/i);
        expect(searchTexts.length).toBeGreaterThanOrEqual(1);
      });

      it(`renders mockup action cards for ${persona}`, () => {
        const { container } = render(<HeroSection persona={persona} />);
        // Action card statuses — numbers ($/counts), status words, or completion states
        const text = container.textContent || "";
        const hasActionStatus =
          /\d/.test(text) || /(pending|live|ready|processing|flagged|active)/i.test(text);
        expect(hasActionStatus).toBe(true);
      });
    });
  });

  describe("CTA override handler", () => {
    it("renders a button instead of link when onCtaClick is provided", () => {
      const onClick = vi.fn();
      render(<HeroSection onCtaClick={onClick} />);
      // The button with CTA text
      const ctaButton = screen.getByText("Create your free candidate profile");
      expect(ctaButton.tagName).toBe("BUTTON");
    });
  });
});
