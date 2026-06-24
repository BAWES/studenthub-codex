// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";

// ── Mock auth session ──────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  getSession: vi.fn(() => Promise.resolve(null)),
}));

// ── Mock next/navigation ───────────────────────────────────────
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
    toString: () => "",
    forEach: () => {},
  }),
  useRouter: () => ({ replace: vi.fn() }),
}));

// ── Mock next/link ─────────────────────────────────────────────
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

// ── Mock ThemeToggle ───────────────────────────────────────────
vi.mock("@/modules/theme/ThemeToggle", () => ({
  ThemeToggle: () => <span data-testid="theme-toggle" />,
}));

// ── Mock PortalCards ───────────────────────────────────────────
vi.mock("../PortalCards", () => ({
  default: () => <section aria-label="StudentHub portals" data-testid="portal-cards" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import page component ──────────────────────────────────────
import Home from "../page";

// ── Tests ──────────────────────────────────────────────────────
describe("Landing page (clean, no session)", () => {
  it("renders the hero headline", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("Staff-matched placements, streamlined.");
  });

  it("renders SH brand in nav", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("SH");
  });

  it("renders StudentHub text in nav", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("StudentHub");
  });

  it("renders Sign in buttons", async () => {
    const { container } = render(await Home());
    const signInLinks = container.querySelectorAll('a[href="/login"]');
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders ThemeToggle", async () => {
    render(await Home());
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("renders PortalCards", async () => {
    render(await Home());
    expect(screen.getByTestId("portal-cards")).toBeInTheDocument();
  });

  // ── No persona tabs (stripped) ─────────────────────────────

  it("does NOT render persona tabs (Students/Companies)", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Students");
    expect(container.textContent).not.toContain("Companies");
  });

  // ── No marketing sections (stripped) ─────────────────────────

  it("does NOT render how it works section", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Create your profile");
  });

  it("does NOT render testimonial carousel", async () => {
    const { container } = render(await Home());
    expect(
      container.textContent
    ).not.toContain("Real stories from real placements.");
  });

  it("does NOT render comparison table", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Why students choose StudentHub.");
  });

  it("does NOT render employer trust bar", async () => {
    const { container } = render(await Home());
    expect(
      container.textContent
    ).not.toContain("Trusted by leading organizations");
  });

  // ── Hero content ─────────────────────────────────────────────

  it("renders placement feature badges", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain("Staff-recruited matching");
    expect(container.textContent).toContain("End-to-end workflows");
    expect(container.textContent).toContain("Real-time pay and compliance");
  });

  it("renders the staff-matched tagline", async () => {
    const { container } = render(await Home());
    expect(container.textContent).toContain(
      "StudentHub connects staff recruiters with qualified candidates"
    );
  });

  it("does NOT render footer with role descriptions", async () => {
    const { container } = render(await Home());
    expect(container.textContent).not.toContain("Staff:");
    expect(container.textContent).not.toContain("Admin:");
    expect(container.textContent).not.toContain("Inspector:");
  });
});
