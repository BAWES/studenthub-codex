// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WorkspaceShell } from "./WorkspaceShell";
import { WorkspaceOSContext } from "./WorkspaceOSContext";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin",
}));

vi.mock("@/modules/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("./navigation", () => ({
  navForRole: () => [
    { label: "Dashboard", href: "/admin", icon: () => <svg data-testid="icon-dashboard" /> },
    { label: "Candidates", href: "/admin/candidates", icon: () => <svg data-testid="icon-users" /> },
  ],
}));

// Full lucide-react mock with all icons used by dependencies (MetricCard, WorkspaceShell, etc.)
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    // Keep all real icons — only override the ones we need to customise in tests
    LogOut: () => <span data-testid="logout-icon" />,
  };
});

// ---------------------------------------------------------------------------
// Session fixture
// ---------------------------------------------------------------------------

const mockSession = {
  id: "1",
  role: "admin" as const,
  name: "Alice",
  email: "alice@example.com",
  issuedAt: Date.now(),
  avatar: null,
};

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WorkspaceShell — skip-to-content link and main-content id", () => {
  it("renders id=main-content on the outer main when standalone (not embedded)", () => {
    render(
      <WorkspaceShell
        session={mockSession}
        eyebrow="Test"
        title="Test Page"
        metrics={[]}
      >
        <p>content</p>
      </WorkspaceShell>,
    );

    const main = document.getElementById("main-content");
    expect(main).toBeInTheDocument();
    expect(main?.tagName.toLowerCase()).toBe("main");
  });

  it("renders a skip-to-content link when standalone", () => {
    render(
      <WorkspaceShell
        session={mockSession}
        eyebrow="Test"
        title="Test Page"
        metrics={[]}
      >
        <p>content</p>
      </WorkspaceShell>,
    );

    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("does NOT render id=main-content when embedded inside WorkspaceOS", () => {
    render(
      <WorkspaceOSContext.Provider value={{ embedded: true, session: mockSession }}>
        <WorkspaceShell
          session={mockSession}
          eyebrow="Test"
          title="Test Page"
          metrics={[]}
        >
          <p>content</p>
        </WorkspaceShell>
      </WorkspaceOSContext.Provider>,
    );

    const main = document.getElementById("main-content");
    expect(main).not.toBeInTheDocument();
  });

  it("wraps content in a <div> not a <main> when embedded (no nested main)", () => {
    const { container } = render(
      <WorkspaceOSContext.Provider value={{ embedded: true, session: mockSession }}>
        <WorkspaceShell
          session={mockSession}
          eyebrow="Test"
          title="Test Page"
          metrics={[]}
        >
          <p>content</p>
        </WorkspaceShell>
      </WorkspaceOSContext.Provider>,
    );

    // The top-level wrapper from WorkspaceShell when embedded should be a <div>,
    // not a <main>. A <main> nested inside another <main> (WorkspaceOS provides the outer one)
    // is invalid HTML.
    const topLevelElement = container.firstElementChild;
    expect(topLevelElement).not.toBeNull();
    expect(topLevelElement!.tagName.toLowerCase()).toBe("div");
    expect(topLevelElement!.className).toContain("block");
  });

  it("does NOT render a skip-to-content link when embedded inside WorkspaceOS", () => {
    render(
      <WorkspaceOSContext.Provider value={{ embedded: true, session: mockSession }}>
        <WorkspaceShell
          session={mockSession}
          eyebrow="Test"
          title="Test Page"
          metrics={[]}
        >
          <p>content</p>
        </WorkspaceShell>
      </WorkspaceOSContext.Provider>,
    );

    const links = screen.queryAllByRole("link", { name: /skip to content/i });
    expect(links).toHaveLength(0);
  });

  it("renders children content in both modes", () => {
    // Standalone
    const { unmount } = render(
      <WorkspaceShell
        session={mockSession}
        eyebrow="Test"
        title="Test Page"
        metrics={[]}
      >
        <p data-testid="child">Hello World</p>
      </WorkspaceShell>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello World");
    unmount();
    cleanup();

    // Embedded
    render(
      <WorkspaceOSContext.Provider value={{ embedded: true, session: mockSession }}>
        <WorkspaceShell
          session={mockSession}
          eyebrow="Test"
          title="Test Page"
          metrics={[]}
        >
          <p data-testid="child-embedded">Hello World Embedded</p>
        </WorkspaceShell>
      </WorkspaceOSContext.Provider>,
    );
    expect(screen.getByTestId("child-embedded")).toHaveTextContent("Hello World Embedded");
  });
});
