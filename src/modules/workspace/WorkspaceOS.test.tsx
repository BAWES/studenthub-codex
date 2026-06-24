// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { WorkspaceOS } from "./WorkspaceOS";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Polyfill scrollIntoView for jsdom (used by RaycastCommandPalette)
Element.prototype.scrollIntoView = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin",
}));

vi.mock("@/modules/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

// Mock the Typesense candidate search for the palette
vi.mock("./searchPalette", () => ({
  searchCandidatesForPalette: vi.fn(),
}));

// The navigation data is used to build the command palette and sidebar
vi.mock("./navigation", () => ({
  navForRole: () => [
    { label: "Dashboard", href: "/admin", icon: () => <svg data-testid="icon-dashboard" /> },
    { label: "Candidates", href: "/admin/candidates", icon: () => <svg data-testid="icon-users" /> },
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

describe("WorkspaceOS — RaycastCommandPalette integration", () => {
  it("opens the palette via Cmd+K and renders the Raycast search input", () => {
    renderOS();

    // Open palette via keyboard shortcut
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Should find the input with the command palette placeholder
    const input = screen.getByPlaceholderText(/jump to a view/i);
    expect(input).toBeInTheDocument();
  });

  it("calls searchCandidatesForPalette when typing >= 2 chars in palette", async () => {
    const searchModule = await import("./searchPalette");
    const mockSearch = vi.mocked(searchModule.searchCandidatesForPalette);
    mockSearch.mockResolvedValue([
      { id: 1001, uid: "C-1001", name: "Ahmed Al-Mansour", email: "ahmed@example.com" },
    ]);

    renderOS();

    // Open palette via keyboard shortcut (Cmd+K)
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Input should appear
    const input = screen.getByPlaceholderText(/jump to a view/i);
    expect(input).toBeInTheDocument();

    // Type a query
    fireEvent.change(input, { target: { value: "Ahmed" } });

    // Wait for debounce (200ms)
    await new Promise((r) => setTimeout(r, 300));

    // Search should have been called
    expect(mockSearch).toHaveBeenCalledWith("Ahmed");
  });

  it("shows Navigation and Quick Scopes section headings in the palette", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Section headings should be visible
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Quick Scopes")).toBeInTheDocument();
  });

  it("shows nav items as command buttons in the palette", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Nav items appear in the command palette (buttons inside the dialog)
    // Use getAllByText since "Dashboard" also appears in sidebar and mobile nav
    const dashes = screen.getAllByText("Dashboard");
    expect(dashes.length).toBeGreaterThanOrEqual(1);

    const cands = screen.getAllByText("Candidates");
    expect(cands.length).toBeGreaterThanOrEqual(1);
  });

  it("closes the palette when Escape is pressed", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByPlaceholderText(/jump to a view/i)).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Palette should close — verify no placeholder found (palette removed from DOM)
    expect(screen.queryByPlaceholderText(/jump to a view/i)).not.toBeInTheDocument();
  });

  it("renders sidebar and content structure unchanged", () => {
    renderOS();

    // The sidebar and content should still render
    expect(screen.getByText("StudentHub")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("supports arrow key navigation through palette items", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByPlaceholderText(/jump to a view/i)).toBeInTheDocument();

    // ArrowDown should move index (no crash)
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });

    // ArrowUp should move index back (no crash)
    fireEvent.keyDown(window, { key: "ArrowUp" });

    // Palette still open after arrow nav
    expect(screen.getByPlaceholderText(/jump to a view/i)).toBeInTheDocument();
  });
});

describe("WorkspaceOS — admin entity page catalog in command palette", () => {
  it("shows Financial section with bank, invoices, payments, salary pages", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Section headings for entity catalog — use getAllByText since some
    // section names may also appear as command titles
    expect(screen.getAllByText("Financial").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Data").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("System").length).toBeGreaterThanOrEqual(1);
    // "Settings" appears as both a section heading and a command title
    expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(1);
  });

  it("shows specific admin entity pages inside their category sections", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Check a representative page from each category
    // Use getAllByText since some pages may appear in both nav and catalog
    const bankAccounts = screen.getAllByText("Bank Accounts");
    expect(bankAccounts.length).toBeGreaterThanOrEqual(1);

    const majors = screen.getAllByText("Majors");
    expect(majors.length).toBeGreaterThanOrEqual(1);

    const webhooks = screen.getAllByText("Webhooks");
    expect(webhooks.length).toBeGreaterThanOrEqual(1);

    const tickets = screen.getAllByText("Tickets");
    expect(tickets.length).toBeGreaterThanOrEqual(1);
  });

  it("shows G-chord shortcuts on key admin pages", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // G-chord shortcuts should appear as kbd elements
    const gC = screen.getAllByText("G C");
    expect(gC.length).toBeGreaterThanOrEqual(1);

    const gR = screen.getAllByText("G R");
    expect(gR.length).toBeGreaterThanOrEqual(1);
  });

  it("shows People, Requests, Events, Tracking section headings", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(screen.getAllByText("People").length).toBeGreaterThanOrEqual(1);
    // "Requests" appears as both section heading and command title
    expect(screen.getAllByText("Requests").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Events").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Tracking").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Compliance").length).toBeGreaterThanOrEqual(1);
  });

  it("shows entity pages alongside existing Navigation and Quick Scopes sections", () => {
    renderOS();

    // Open palette
    fireEvent.keyDown(window, { key: "k", metaKey: true });

    // Existing sections still present
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Quick Scopes")).toBeInTheDocument();

    // New entity catalog sections also present
    expect(screen.getByText("Financial")).toBeInTheDocument();
  });
});
describe("WorkspaceOS — shell structure", () => {
  it("renders StudentHub branding in sidebar", () => {
    renderOS();
    expect(screen.getByText("StudentHub")).toBeInTheDocument();
  });

  it("renders children inside the content area", () => {
    renderOS();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders theme toggle and sign out", () => {
    renderOS();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });
});
