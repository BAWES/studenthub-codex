// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TabProvider, useTabs } from "./TabContext";
import { TabBar } from "./TabBar";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
let mockPathname = "/admin";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

function mockPath(value: string) {
  mockPathname = value;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A consumer that opens/closes/pins a single tab. Uses unique testId suffix. */
function TabConsumer({ label, href, id }: { label: string; href: string; id: string }) {
  const { openTab, closeTab, pinTab, setActive } = useTabs();
  return (
    <div>
      <button data-testid={`open-${id}`} onClick={() => openTab(href, label, "User")}>
        Open {label}
      </button>
      <button data-testid={`close-${id}`} onClick={() => closeTab(href)}>
        Close {label}
      </button>
      <button data-testid={`pin-${id}`} onClick={() => pinTab(href)}>
        Toggle Pin
      </button>
      <button data-testid={`set-active-${id}`} onClick={() => setActive(href)}>
        Set Active
      </button>
    </div>
  );
}

function renderWithProvider(
  role: "admin" | "staff" | "candidate",
  initialPath = "/admin",
) {
  mockPath(initialPath);
  return render(
    <TabProvider role={role}>
      <TabBar role={role} />
      <TabConsumer label="Candidates" href={`/${role}/candidates`} id="candidates" />
      <TabConsumer label="Requests" href={`/${role}/requests`} id="requests" />
    </TabProvider>,
  );
}

function getTab(label: string) {
  return screen.queryByRole("tab", { name: new RegExp(label, "i") });
}

function getTabElements() {
  return screen.queryAllByRole("tab");
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  mockPath("/admin");
  mockPush.mockClear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TabProvider — home tab", () => {
  it("renders a pinned Overview home tab for admin", () => {
    renderWithProvider("admin");
    expect(getTabElements().length).toBeGreaterThanOrEqual(1);
    const overview = getTab("Overview");
    expect(overview).toBeInTheDocument();
    expect(overview).toHaveAttribute("aria-selected", "true");
  });

  it("renders a pinned Overview home tab for candidate", () => {
    renderWithProvider("candidate", "/candidate");
    const overview = getTab("Overview");
    expect(overview).toBeInTheDocument();
    expect(overview).toHaveAttribute("aria-selected", "true");
  });

  it("has correct tablist aria-label for admin", () => {
    renderWithProvider("admin");
    const nav = screen.getByRole("tablist");
    expect(nav).toHaveAttribute("aria-label", "admin workspace tabs");
  });
});

describe("TabProvider — opening tabs", () => {
  it("opens a new tab when openTab is called", () => {
    renderWithProvider("admin");
    expect(getTab("Candidates")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("open-candidates"));
    expect(getTab("Candidates")).toBeInTheDocument();
  });

  it("does not duplicate tabs on repeated open calls", () => {
    renderWithProvider("admin");
    const btn = screen.getByTestId("open-candidates");

    fireEvent.click(btn);
    fireEvent.click(btn);

    const candidatesTabs = getTabElements().filter(
      (t) => t.textContent?.includes("Candidates"),
    );
    expect(candidatesTabs).toHaveLength(1);
  });
});

describe("TabBar — close tab", () => {
  it("removes a tab when close is clicked", () => {
    renderWithProvider("admin");

    // Open a tab first
    fireEvent.click(screen.getByTestId("open-candidates"));
    expect(getTab("Candidates")).toBeInTheDocument();

    // Close it via the close button in the tab bar
    const closeBtn = screen.getByLabelText("Close Candidates tab");
    fireEvent.click(closeBtn);
    expect(getTab("Candidates")).not.toBeInTheDocument();
  });

  it("does not close the pinned Overview home tab", () => {
    renderWithProvider("admin");
    const overview = getTab("Overview");
    expect(overview).toBeInTheDocument();

    // The home tab should not have a close button
    const homeClose = screen.queryByLabelText("Close Overview tab");
    expect(homeClose).not.toBeInTheDocument();
  });

  it("does not show close button on a pinned tab", () => {
    renderWithProvider("admin");

    // Open a tab and pin it
    fireEvent.click(screen.getByTestId("open-candidates"));
    fireEvent.click(screen.getByTestId("pin-candidates"));

    // It should have a pin icon but no close
    expect(screen.queryByLabelText("Close Candidates tab")).not.toBeInTheDocument();
  });
});

describe("TabBar — pin tab", () => {
  it("shows unpin label after pinning a tab", () => {
    renderWithProvider("admin");

    // Open a tab then pin it
    fireEvent.click(screen.getByTestId("open-candidates"));
    fireEvent.click(screen.getByTestId("pin-candidates"));

    // The pin button toggled — now says Unpin
    expect(screen.queryByLabelText("Unpin tab")).toBeInTheDocument();
  });
});

describe("TabBar — set active tab", () => {
  it("marks the active tab based on pathname", () => {
    renderWithProvider("admin", "/admin/candidates");
    const overview = getTab("Overview");
    expect(overview).toHaveAttribute("aria-selected", "false");
  });

  it("navigates when a tab is clicked", () => {
    renderWithProvider("admin");

    // Open a tab
    fireEvent.click(screen.getByTestId("open-candidates"));
    const tabBtn = screen.getByLabelText("Navigate to Candidates");
    fireEvent.click(tabBtn);

    expect(mockPush).toHaveBeenCalledWith("/admin/candidates");
  });
});

describe("TabContext — localStorage persistence", () => {
  it("persists tabs to localStorage", () => {
    renderWithProvider("admin");

    // Open a tab
    fireEvent.click(screen.getByTestId("open-candidates"));
    expect(getTab("Candidates")).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem("sh-workspace-tabs") || "[]");
    expect(saved.length).toBeGreaterThanOrEqual(1);
    const candidatesTab = saved.find(
      (t: { href: string }) => t.href === "/admin/candidates",
    );
    expect(candidatesTab).toBeDefined();
    expect(candidatesTab.label).toBe("Candidates");
  });

  it("restores tabs from localStorage on mount", () => {
    // Pre-populate localStorage
    const preloaded = [
      { id: "/admin/candidates", label: "Candidates", href: "/admin/candidates", icon: "Users", pinned: false, role: "admin" },
    ];
    localStorage.setItem("sh-workspace-tabs", JSON.stringify(preloaded));

    renderWithProvider("admin");
    expect(getTab("Candidates")).toBeInTheDocument();
  });
});

describe("TabBar — empty state", () => {
  it("renders at least the home tab when no other tabs are open", () => {
    renderWithProvider("admin");
    expect(getTabElements().length).toBeGreaterThanOrEqual(1);
  });
});

describe("TabBar — drag reorder", () => {
  it("supports draggable attribute on non-home tabs", () => {
    renderWithProvider("admin");

    // Open a tab
    fireEvent.click(screen.getByTestId("open-candidates"));
    const candidatesTab = getTab("Candidates");
    expect(candidatesTab).toHaveAttribute("draggable", "true");
  });

  it("home tab is not draggable", () => {
    renderWithProvider("admin");
    const overview = getTab("Overview");
    expect(overview).toHaveAttribute("draggable", "false");
  });
});
