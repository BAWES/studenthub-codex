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

vi.mock("./navigation", () => ({
  navForRole: (role: string) => {
    if (role === "admin") {
      return [
        { label: "Overview", href: "/admin", icon: () => <svg data-testid="icon-overview" /> },
        { label: "Candidates", href: "/admin/candidates", icon: () => <svg data-testid="icon-candidates" /> },
        { label: "Requests", href: "/admin/requests", icon: () => <svg data-testid="icon-requests" /> },
        { label: "Companies", href: "/admin/companies", icon: () => <svg data-testid="icon-companies" /> },
      ];
    }
    return [];
  },
}));

function mockPath(value: string) {
  mockPathname = value;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Opens many tabs with sequential hrefs (used by MultiTabConsumer). */
function openMany(openTab: (href: string, label: string, icon?: string | null) => void, baseHref: string, count: number) {
  for (let i = 0; i < count; i++) {
    openTab(`${baseHref}/${i}`, `Tab ${i + 1}`, null);
  }
}

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

/** Helper: renders a TabProvider with a button that fills tab slots. */
function TabFiller({ baseHref, count }: { baseHref: string; count: number }) {
  const { openTab } = useTabs();
  return (
    <button
      data-testid="tab-filler"
      onClick={() => openMany(openTab, baseHref, count)}
    >
      Fill {count}
    </button>
  );
}

function renderWithFiller(
  role: "admin" | "staff" | "candidate",
  count: number,
  initialPath = "/admin",
) {
  mockPath(initialPath);
  return render(
    <TabProvider role={role}>
      <TabBar role={role} />
      <TabFiller baseHref={`/${role}/tabs`} count={count} />
    </TabProvider>,
  );
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

describe("TabContext — tab limit (max 12)", () => {
  it("allows up to 12 tabs", () => {
    renderWithFiller("admin", 12);
    fireEvent.click(screen.getByTestId("tab-filler"));
    // 12 tabs + home = 13 total (home is pinned, always present)
    expect(getTabElements().length).toBe(13);
    expect(screen.getByRole("tab", { name: /^Tab 1$/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^Tab 12$/i })).toBeInTheDocument();
  });

  it("removes the oldest unpinned tab when opening the 13th", () => {
    renderWithFiller("admin", 13);
    fireEvent.click(screen.getByTestId("tab-filler"));
    // 12 tabs + home = 13 total
    expect(getTabElements().length).toBe(13);
    // Tab 1 should be evicted (oldest unpinned)
    expect(screen.queryByRole("tab", { name: /^Tab 1$/i })).not.toBeInTheDocument();
    // Tab 2 through Tab 13 should be present
    expect(screen.getByRole("tab", { name: /^Tab 2$/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^Tab 13$/i })).toBeInTheDocument();
  });

  it("does not evict pinned tabs", () => {
    function PinThenFill() {
      const { openTab, pinTab } = useTabs();
      return (
        <button
          data-testid="pin-and-fill"
          onClick={() => {
            openTab("/admin/pinned-1", "Pinned 1", null);
            pinTab("/admin/pinned-1");
            openMany(openTab, "/admin/tabs", 13);
          }}
        >
          Pin+fill
        </button>
      );
    }
    mockPath("/admin");
    render(
      <TabProvider role="admin">
        <TabBar role="admin" />
        <PinThenFill />
      </TabProvider>,
    );
    fireEvent.click(screen.getByTestId("pin-and-fill"));
    // 1 home + 1 pinned + 12 unpinned (one evicted) = 14
    expect(getTabElements().length).toBe(14);
    // Pinned tab survives (aria-label includes "(pinned)" suffix)
    expect(screen.getByRole("tab", { name: /Pinned 1/i })).toBeInTheDocument();
    // Tab 1 (oldest unpinned) is evicted
    expect(screen.queryByRole("tab", { name: /^Tab 1$/i })).not.toBeInTheDocument();
    // Tab 13 was still added
    expect(screen.getByRole("tab", { name: /^Tab 13$/i })).toBeInTheDocument();
  });

  it("home tab is always preserved", () => {
    renderWithFiller("admin", 14);
    fireEvent.click(screen.getByTestId("tab-filler"));
    // 12 tabs + home = 13 — two evicted
    expect(getTabElements().length).toBe(13);
    expect(getTab("Overview")).toBeInTheDocument();
    // Tab 1 and Tab 2 evicted (oldest)
    expect(screen.queryByRole("tab", { name: /^Tab 1$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /^Tab 2$/i })).not.toBeInTheDocument();
    // The last tabs survive
    expect(screen.getByRole("tab", { name: /^Tab 14$/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TabBar "+" button menu (STU-4142)
// ---------------------------------------------------------------------------

describe('TabBar "+" button — tab creation menu', () => {
  it('shows the "+" button with aria-label "Open new tab"', () => {
    renderWithProvider("admin");
    const addBtn = screen.getByLabelText("Open new tab");
    expect(addBtn).toBeInTheDocument();
  });

  it("opens a dropdown menu on click", () => {
    renderWithProvider("admin");
    const addBtn = screen.getByLabelText("Open new tab");
    fireEvent.click(addBtn);

    // Menu should now be visible with role="menu"
    const menu = document.querySelector(".workspaceTabMenu");
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute("role", "menu");
  });

  it("displays nav items inside the menu", () => {
    renderWithProvider("admin");
    fireEvent.click(screen.getByLabelText("Open new tab"));

    // Menu items should include the mock nav items
    const menuItems = document.querySelectorAll(".workspaceTabMenuItem");
    expect(menuItems.length).toBeGreaterThan(0);
    expect(screen.getByRole("menuitem", { name: "Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Requests" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Companies" })).toBeInTheDocument();
  });

  it("creates a new tab when a menu item is clicked", () => {
    renderWithProvider("admin");
    expect(getTab("Candidates")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Open new tab"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Candidates" }));

    expect(getTab("Candidates")).toBeInTheDocument();
  });

  it("closes the menu after a menu item is clicked", () => {
    renderWithProvider("admin");
    fireEvent.click(screen.getByLabelText("Open new tab"));
    expect(document.querySelector(".workspaceTabMenu")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Candidates" }));

    expect(document.querySelector(".workspaceTabMenu")).not.toBeInTheDocument();
  });

  it("toggles the menu on repeated clicks", () => {
    renderWithProvider("admin");
    const addBtn = screen.getByLabelText("Open new tab");

    fireEvent.click(addBtn);
    expect(document.querySelector(".workspaceTabMenu")).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(document.querySelector(".workspaceTabMenu")).not.toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(document.querySelector(".workspaceTabMenu")).toBeInTheDocument();
  });

  it("applies active class to the '+' button when menu is open", () => {
    renderWithProvider("admin");
    const addBtn = screen.getByLabelText("Open new tab");

    expect(addBtn.className).not.toContain("active");

    fireEvent.click(addBtn);
    expect(addBtn.className).toContain("active");

    fireEvent.click(addBtn);
    expect(addBtn.className).not.toContain("active");
  });
});
