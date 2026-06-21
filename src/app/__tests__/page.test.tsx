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
    forEach: (cb: (value: string, key: string) => void) =>
      mockSearchParams.forEach((value, key) => cb(value, key)),
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
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── Mock marketing components ──────────────────────────────────
vi.mock("@/components/marketing", () => ({
  HeroSection: () => (
    <section aria-label="StudentHub — connecting students with the right employers">
      <h1>Connecting students with the right employers</h1>
    </section>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Import component ──────────────────────────────────────────
import LandingPage from "@/components/landing/LandingPage";

// ── Tests ──────────────────────────────────────────────────────

describe("Landing page (clean auth)", () => {
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
    expect(
      screen.getByText(/connecting students with/i)
    ).toBeInTheDocument();
  });

  // ── Navigation ───────────────────────────────────────────────

  it("renders sign up and sign in for unauthenticated users", () => {
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

  // ── No persona tabs (stripped) ─────────────────────────────

  it("does NOT render persona tabs", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText("Students")).not.toBeInTheDocument();
    expect(screen.queryByText("Companies")).not.toBeInTheDocument();
  });

  // ── No marketing sections (stripped) ─────────────────────────

  it("does NOT render how it works section", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText("Create your profile")).not.toBeInTheDocument();
  });

  it("does NOT render testimonial carousel", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Real stories from real placements.")
    ).not.toBeInTheDocument();
  });

  it("does NOT render comparison table", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Why students choose StudentHub.")
    ).not.toBeInTheDocument();
  });

  it("does NOT render CTA section", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText("Start your journey")
    ).not.toBeInTheDocument();
  });

  it("does NOT render employer trust bar", () => {
    render(<LandingPage {...defaultProps} />);
    expect(
      screen.queryByText(/trusted by leading organizations/i)
    ).not.toBeInTheDocument();
  });

  // ── No footer (stripped) ─────────────────────────────────────

  it("does NOT render footer with role descriptions", () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.queryByText(/Staff:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Admin:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Inspector:/i)).not.toBeInTheDocument();
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

  // ── Authenticated state ──────────────────────────────────────

  it("shows open app link when user is authenticated", () => {
    render(<LandingPage {...defaultProps} {...sessionProps} />);
    const openAppLinks = screen.getAllByText(/open app/i);
    expect(openAppLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("redirects authenticated users to their role dashboard", () => {
    render(<LandingPage {...sessionProps} />);
    expect(mockReplace).toHaveBeenCalledWith("/candidate");
  });

  it("does NOT redirect unauthenticated users", () => {
    render(<LandingPage {...defaultProps} />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  // ── Redirect by role ─────────────────────────────────────────

  it.each([
    ["admin", "/admin"],
    ["staff", "/staff"],
    ["recruiter", "/staff"],
    ["student", "/candidate"],
    ["candidate", "/candidate"],
    ["company", "/employer"],
    ["employer", "/employer"],
    ["inspector", "/inspector"],
  ])("redirects role=%s to %s", (role, expectedPath) => {
    render(
      <LandingPage
        session={{
          id: "test-123",
          email: "test@example.com",
          role,
          name: "Test User",
        }}
      />
    );
    expect(mockReplace).toHaveBeenCalledWith(expectedPath);
  });
});
