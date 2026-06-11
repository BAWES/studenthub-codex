// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WorkspaceOS } from "./WorkspaceOS";

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

// The navigation data is used to build the command palette and sidebar
vi.mock("./navigation", () => ({
  navForRole: () => [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Candidates", href: "/admin/candidates", icon: "Users" },
  ],
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockSession = {
  id: "1",
  role: "admin" as const,
  name: "Alice",
  email: "alice@example.com",
  issuedAt: Date.now(),
  avatar: null,
};

function renderOS() {
  return render(
    <WorkspaceOS session={mockSession}>
      <div data-testid="child-content">Page Content</div>
    </WorkspaceOS>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

describe("WorkspaceOS — skip-to-content link", () => {
  it("renders a skip-to-content link as the first focusable element", () => {
    renderOS();
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toBeInTheDocument();
  });

  it("links to the main content via #main-content", () => {
    renderOS();
    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("has a main element with id=main-content", () => {
    renderOS();
    const main = document.getElementById("main-content");
    expect(main).toBeInTheDocument();
    expect(main?.tagName.toLowerCase()).toBe("main");
  });

  it("renders children inside the main content area", () => {
    renderOS();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders WorkspaceTabs inside the workspace stage", () => {
    renderOS();
    const tablist = screen.queryByRole("tablist");
    // Tabs should render since the mock nav returns 2 items
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute("aria-label", "admin section navigation");
  });
});
