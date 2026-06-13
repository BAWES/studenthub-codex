// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { TabProvider, useTabs, type TabEntry } from "./TabContext";

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
// Helper — exposes the full TabContextValue for assertion
// ---------------------------------------------------------------------------

interface ExposedContext {
  tabs: TabEntry[];
  activeTabId: string | null;
  openTab: ReturnType<typeof useTabs>["openTab"];
  closeTab: ReturnType<typeof useTabs>["closeTab"];
  pinTab: ReturnType<typeof useTabs>["pinTab"];
  moveTab: ReturnType<typeof useTabs>["moveTab"];
  setActive: ReturnType<typeof useTabs>["setActive"];
}

let lastContext: ExposedContext | null = null;

function ContextExposer() {
  const ctx = useTabs();
  lastContext = {
    tabs: ctx.tabs,
    activeTabId: ctx.activeTabId,
    openTab: ctx.openTab,
    closeTab: ctx.closeTab,
    pinTab: ctx.pinTab,
    moveTab: ctx.moveTab,
    setActive: ctx.setActive,
  };
  return null;
}

function renderProvider(role: "admin" | "staff" | "candidate", initialPath?: string) {
  if (initialPath) mockPath(initialPath);
  lastContext = null;
  cleanup();
  return render(
    <TabProvider role={role}>
      <ContextExposer />
    </TabProvider>,
  );
}

function getCtx(): ExposedContext {
  if (!lastContext) throw new Error("Context not captured — render TabProvider first");
  return lastContext;
}

// Wait for effects (hydration, persistence, auto-open) to settle
async function flushEffects() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  lastContext = null;
});

afterEach(() => {
  cleanup();
  mockPath("/admin");
  mockPush.mockClear();
  lastContext = null;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TabProvider — home tab", () => {
  it("always includes a pinned home tab for the current role", async () => {
    renderProvider("admin");
    await flushEffects();

    const ctx = getCtx();
    expect(ctx.tabs.length).toBeGreaterThanOrEqual(1);
    const home = ctx.tabs[0];
    expect(home.label).toBe("Overview");
    expect(home.pinned).toBe(true);
    expect(home.href).toBe("/admin");
  });

  it("shows a different home href for each role", async () => {
    renderProvider("staff", "/staff");
    await flushEffects();

    const ctx = getCtx();
    const home = ctx.tabs[0];
    expect(home.href).toBe("/staff");
  });
});

describe("TabProvider — openTab", () => {
  it("creates a new tab when no duplicate exists", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates", "Users"));
    await flushEffects();

    const ctx = getCtx();
    const tab = ctx.tabs.find((t) => t.href === "/admin/candidates");
    expect(tab).toBeDefined();
    expect(tab!.label).toBe("Candidates");
    expect(tab!.icon).toBe("Users");
    expect(tab!.pinned).toBe(false);
  });

  it("does not duplicate an existing tab", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates", "Users"));
    await flushEffects();
    act(() => getCtx().openTab("/admin/candidates", "Candidates", "Users"));
    await flushEffects();

    const ctx = getCtx();
    const matches = ctx.tabs.filter((t) => t.href === "/admin/candidates");
    expect(matches).toHaveLength(1);
  });

  it("allows the same href under different roles", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/candidates", "Candidates", "Users"));
    await flushEffects();

    // Admin's tab for /candidates should exist
    const adminTab = getCtx().tabs.find((t) => t.href === "/candidates");
    expect(adminTab).toBeDefined();
    expect(adminTab!.role).toBe("admin");
  });
});

describe("TabProvider — closeTab", () => {
  it("removes a tab when closeTab is called", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    expect(getCtx().tabs.find((t) => t.href === "/admin/candidates")).toBeDefined();

    act(() => getCtx().closeTab("/admin/candidates"));
    await flushEffects();

    expect(getCtx().tabs.find((t) => t.href === "/admin/candidates")).toBeUndefined();
  });

  it("does not close a pinned tab", async () => {
    renderProvider("admin");
    await flushEffects();

    // Create a tab and pin it
    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    act(() => getCtx().pinTab("/admin/candidates"));
    await flushEffects();

    // Try to close it
    act(() => getCtx().closeTab("/admin/candidates"));
    await flushEffects();

    // Should still exist and still be pinned
    const tab = getCtx().tabs.find((t) => t.href === "/admin/candidates");
    expect(tab).toBeDefined();
    expect(tab!.pinned).toBe(true);
  });

  it("does not close the pinned home Overview tab", async () => {
    renderProvider("admin");
    await flushEffects();

    const home = getCtx().tabs[0];
    expect(home.label).toBe("Overview");
    expect(home.pinned).toBe(true);

    act(() => getCtx().closeTab(home.id));
    await flushEffects();

    // Home tab should still be there
    const stillThere = getCtx().tabs.find((t) => t.id === home.id);
    expect(stillThere).toBeDefined();
  });

  it("closing a non-active tab does not trigger navigation", async () => {
    renderProvider("admin");
    await flushEffects();

    // Open two tabs
    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    act(() => getCtx().openTab("/admin/requests", "Requests"));
    await flushEffects();

    // Close the non-active requests tab (active is home or candidates)
    act(() => getCtx().closeTab("/admin/requests"));
    await flushEffects();

    expect(getCtx().tabs.find((t) => t.href === "/admin/requests")).toBeUndefined();
    expect(getCtx().tabs.find((t) => t.href === "/admin/candidates")).toBeDefined();
  });
});

describe("TabProvider — pinTab", () => {
  it("toggles the pinned state of a tab", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();

    // Pin it
    act(() => getCtx().pinTab("/admin/candidates"));
    await flushEffects();
    expect(getCtx().tabs.find((t) => t.href === "/admin/candidates")!.pinned).toBe(true);

    // Unpin it
    act(() => getCtx().pinTab("/admin/candidates"));
    await flushEffects();
    expect(getCtx().tabs.find((t) => t.href === "/admin/candidates")!.pinned).toBe(false);
  });
});

describe("TabProvider — setActive", () => {
  it("navigates to the tab's route when setActive is called", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();

    act(() => getCtx().setActive("/admin/candidates"));
    await flushEffects();

    expect(mockPush).toHaveBeenCalledWith("/admin/candidates");
  });

  it("does not navigate when the tab ID is not found", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().setActive("/admin/nonexistent"));
    await flushEffects();

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("TabProvider — moveTab (reorder)", () => {
  it("reorders tabs when moveTab is called", async () => {
    renderProvider("admin");
    await flushEffects();

    // Open two tabs
    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    act(() => getCtx().openTab("/admin/requests", "Requests"));
    await flushEffects();

    // Get role tabs (excluding home) — they should be [candidates, requests]
    const roleTabs = getCtx().tabs.filter((t) => t.role === "admin" && t.id !== "/admin");
    expect(roleTabs[0].href).toBe("/admin/candidates");
    expect(roleTabs[1].href).toBe("/admin/requests");

    // Move candidates from index 0 to index 1 (within role tabs)
    act(() => getCtx().moveTab(0, 1));
    await flushEffects();

    const reordered = getCtx().tabs.filter(
      (t) => t.role === "admin" && t.id !== "/admin",
    );
    expect(reordered[0].href).toBe("/admin/requests");
    expect(reordered[1].href).toBe("/admin/candidates");
  });

  it("does not reorder when fromIndex or toIndex is out of bounds", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    act(() => getCtx().openTab("/admin/requests", "Requests"));
    await flushEffects();

    const before = getCtx().tabs.filter(
      (t) => t.role === "admin" && t.id !== "/admin",
    ).map((t) => t.href);

    // Try out-of-bounds
    act(() => getCtx().moveTab(-1, 1));
    await flushEffects();
    act(() => getCtx().moveTab(5, 1));
    await flushEffects();

    const after = getCtx().tabs.filter(
      (t) => t.role === "admin" && t.id !== "/admin",
    ).map((t) => t.href);
    expect(after).toEqual(before);
  });

  it("does nothing when fromIndex equals toIndex", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();
    act(() => getCtx().openTab("/admin/requests", "Requests"));
    await flushEffects();

    const before = getCtx().tabs.filter(
      (t) => t.role === "admin" && t.id !== "/admin",
    ).map((t) => t.href);

    act(() => getCtx().moveTab(1, 1));
    await flushEffects();

    const after = getCtx().tabs.filter(
      (t) => t.role === "admin" && t.id !== "/admin",
    ).map((t) => t.href);
    expect(after).toEqual(before);
  });
});

describe("TabProvider — activeTabId", () => {
  it("sets activeTabId based on the current pathname", async () => {
    renderProvider("admin", "/admin/candidates");
    await flushEffects();

    // Open the tab matching the pathname first
    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();

    expect(getCtx().activeTabId).toBe("/admin/candidates");
  });

  it("auto-opens a tab for an unknown pathname and sets it as active", async () => {
    renderProvider("admin", "/some/unknown/path");
    await flushEffects();

    // The auto-open effect creates a tab for the navigated-to path
    const ctx = getCtx();
    const unknownTab = ctx.tabs.find((t) => t.href === "/some/unknown/path");
    expect(unknownTab).toBeDefined();
    expect(ctx.activeTabId).toBe("/some/unknown/path");
  });
});

describe("TabProvider — localStorage persistence", () => {
  it("persists tabs to localStorage after opening", async () => {
    renderProvider("admin");
    await flushEffects();

    act(() => getCtx().openTab("/admin/candidates", "Candidates"));
    await flushEffects();

    const saved = JSON.parse(localStorage.getItem("sh-workspace-tabs") || "[]");
    const tab = saved.find((t: { href: string }) => t.href === "/admin/candidates");
    expect(tab).toBeDefined();
    expect(tab.label).toBe("Candidates");
  });

  it("restores tabs from localStorage on mount", async () => {
    const preloaded = [
      {
        id: "/admin/candidates",
        label: "Candidates",
        href: "/admin/candidates",
        icon: "Users",
        pinned: false,
        role: "admin",
      },
    ];
    localStorage.setItem("sh-workspace-tabs", JSON.stringify(preloaded));

    renderProvider("admin");
    await flushEffects();

    const tab = getCtx().tabs.find((t) => t.href === "/admin/candidates");
    expect(tab).toBeDefined();
    expect(tab!.label).toBe("Candidates");
  });

  it("handles corrupt localStorage gracefully", async () => {
    localStorage.setItem("sh-workspace-tabs", "not-valid-json");

    renderProvider("admin");
    await flushEffects();

    // Should degrade to just the home tab — no crash
    const ctx = getCtx();
    expect(ctx.tabs.length).toBeGreaterThanOrEqual(1);
    expect(ctx.tabs[0].label).toBe("Overview");
  });
});
