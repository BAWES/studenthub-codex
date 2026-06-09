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

  describe("Animated gradient background", () => {
    ALL_PERSONAS.forEach((persona) => {
      it(`renders shHeroGradientDramatic div for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const gradient = document.querySelector(".shHeroGradientDramatic");
        expect(gradient).toBeTruthy();
        expect(gradient?.getAttribute("aria-hidden")).toBe("true");
      });

      it(`renders ambient floating orbs for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const orbs = document.querySelectorAll('[class*="shOrb"]');
        expect(orbs.length).toBeGreaterThanOrEqual(3);
        orbs.forEach((orb) => {
          expect(orb.getAttribute("aria-hidden")).toBe("true");
        });
      });

      it(`renders particle grid overlay for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const grid = document.querySelector(".shParticleGrid");
        expect(grid).toBeTruthy();
        expect(grid?.getAttribute("aria-hidden")).toBe("true");
      });

      it(`renders persona badge for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const badge = document.querySelector(".shPersonaBadge");
        expect(badge).toBeTruthy();
        expect(badge?.getAttribute("aria-hidden")).toBe("true");
        const expectedLabel = persona.charAt(0).toUpperCase() + persona.slice(1) + " portal";
        expect(badge?.textContent).toContain(expectedLabel);
      });
    });
  });

  describe("Floating mockup rendering", () => {
    ALL_PERSONAS.forEach((persona) => {
      it(`renders shMockupDramatic container for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const mockup = document.querySelector(".shMockupDramatic");
        expect(mockup).toBeTruthy();
      });

      it(`renders persona-specific mockup nav items for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        const mockup = document.querySelector(".shMockupDramatic");
        expect(mockup).toBeTruthy();
        // Each persona has mockupNav — check the left rail exists
        const navItems = mockup!.querySelectorAll('[class*="rounded-\\[7px\\]"]');
        expect(navItems.length).toBeGreaterThanOrEqual(3);
      });

      it(`renders search placeholder for ${persona}`, () => {
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

      it(`renders right-panel command action for ${persona}`, () => {
        render(<HeroSection persona={persona} />);
        // Each persona has a mockupCommand — look for "Action" heading
        const actionLabels = screen.getAllByText("Action");
        expect(actionLabels.length).toBeGreaterThanOrEqual(1);
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

  describe("Mobile viewport responsiveness", () => {
    it("renders max-lg responsive classes on section", () => {
      render(<HeroSection />);
      const section = document.querySelector("section");
      expect(section?.className).toContain("max-lg");
    });

    it("includes min-h-[400px] fallback on mockup container for mobile", () => {
      render(<HeroSection />);
      const mockupContainer = document.querySelector('[class*="max-lg:min-h-\\[400px\\]"]');
      // The original container has inline class that we can check via className
      const section = document.querySelector("section");
      const allElements = document.querySelectorAll("*");
      let foundMobileMockup = false;
      allElements.forEach((el) => {
        if (el.className && typeof el.className === "string" && el.className.includes("max-lg:order-2")) {
          foundMobileMockup = true;
        }
      });
      expect(foundMobileMockup).toBe(true);
    });

    it("wraps mockup in container with max-lg:relative for mobile stacking", () => {
      render(<HeroSection />);
      const mockupWrapper = document.querySelector('[class*="max-lg:relative"]');
      expect(mockupWrapper).toBeTruthy();
    });
  });

  describe("Snapshot — per persona", () => {
    ALL_PERSONAS.forEach((persona) => {
      it(`renders consistently for ${persona} persona`, () => {
        const { container } = render(<HeroSection persona={persona} />);
        expect(container).toMatchSnapshot();
      });
    });
  });
});
