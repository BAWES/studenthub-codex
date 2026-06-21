// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { humanize, useBreadcrumbs, Breadcrumbs } from "./Breadcrumbs";

// ---------------------------------------------------------------------------
// Mutable mock — set mockPathname before each test
// ---------------------------------------------------------------------------

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mockPathname = "/";
});

// ---------------------------------------------------------------------------
// humanize
// ---------------------------------------------------------------------------

describe("humanize", () => {
  it("converts a simple kebab-case segment to Title Case", () => {
    expect(humanize("candidates")).toBe("Candidates");
    expect(humanize("Candidates")).toBe("Candidates");
  });

  it("converts multi-word kebab-case to Title Case", () => {
    expect(humanize("new-application")).toBe("New Application");
    expect(humanize("id-reviews")).toBe("Id Reviews");
    expect(humanize("pending-approvals")).toBe("Pending Approvals");
  });

  it("maps [id] to Detail", () => {
    expect(humanize("[id]")).toBe("Detail");
  });

  it("maps bare id to Detail", () => {
    expect(humanize("id")).toBe("Detail");
  });

  it("handles mixed patterns like id-requests (now via custom label map)", () => {
    expect(humanize("id-requests")).toBe("ID Requests");
  });

  it("handles empty input", () => {
    expect(humanize("")).toBe("");
  });

  it("maps create to New instead of Create", () => {
    expect(humanize("create")).toBe("New");
  });

  it("maps work-logs to Work Logs via custom label map", () => {
    expect(humanize("work-logs")).toBe("Work Logs");
  });

  it("still auto-generates labels for unknown kebab-case", () => {
    expect(humanize("some-other-page")).toBe("Some Other Page");
  });
});

// ---------------------------------------------------------------------------
// useBreadcrumbs
// ---------------------------------------------------------------------------

describe("useBreadcrumbs", () => {
  it("generates breadcrumb items for /admin/candidates", () => {
    mockPathname = "/admin/candidates";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Admin", href: "/admin" });
    expect(result[1]).toEqual({ label: "Candidates", href: undefined });
  });

  it("generates breadcrumb items for /staff/requests/new", () => {
    mockPathname = "/staff/requests/new";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: "Staff", href: "/staff" });
    expect(result[1]).toEqual({ label: "Requests", href: "/staff/requests" });
    expect(result[2]).toEqual({ label: "New", href: undefined });
  });

  it("generates breadcrumb items for /candidate/invitations", () => {
    mockPathname = "/candidate/invitations";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Candidate", href: "/candidate" });
    expect(result[1]).toEqual({ label: "Invitations", href: undefined });
  });

  it("generates breadcrumb items for /company/companies", () => {
    mockPathname = "/company/companies";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Company", href: "/company" });
    expect(result[1]).toEqual({ label: "Companies", href: undefined });
  });

  it("generates breadcrumb items for /inspector/id-requests", () => {
    mockPathname = "/inspector/id-requests";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Inspector", href: "/inspector" });
    expect(result[1]).toEqual({ label: "ID Requests", href: undefined });
  });

  it("generates breadcrumb items for /admin (root single segment)", () => {
    mockPathname = "/admin";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ label: "Admin", href: undefined });
  });

  it("returns empty array for root path /", () => {
    mockPathname = "/";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(0);
  });

  it("humanizes dynamic route segments like [id] as Detail", () => {
    mockPathname = "/admin/candidates/[id]";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ label: "Detail", href: undefined });
  });

  it("uses custom label for id-requests path", () => {
    mockPathname = "/inspector/id-requests";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Inspector", href: "/inspector" });
    expect(result[1]).toEqual({ label: "ID Requests", href: undefined });
  });

  it("uses custom label for work-logs path", () => {
    mockPathname = "/candidate/work-logs";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ label: "Candidate", href: "/candidate" });
    expect(result[1]).toEqual({ label: "Work Logs", href: undefined });
  });

  it("handles create segment as New", () => {
    mockPathname = "/company/requests/create";
    const result = renderHookResult(useBreadcrumbs);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ label: "New", href: undefined });
  });
});

// ---------------------------------------------------------------------------
// Breadcrumbs component
// ---------------------------------------------------------------------------

describe("Breadcrumbs component", () => {
  it("renders nothing for empty trail on root path", () => {
    mockPathname = "/";
    const { container } = render(<Breadcrumbs />);
    expect(container.innerHTML).toBe("");
  });

  it("renders breadcrumb trail with correct labels", () => {
    mockPathname = "/admin/candidates";
    render(<Breadcrumbs />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
  });

  it("renders links for non-last items", () => {
    mockPathname = "/staff/requests";
    render(<Breadcrumbs />);
    const link = screen.getByText("Staff").closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/staff");
  });

  it("marks the last item with aria-current='page'", () => {
    mockPathname = "/staff/requests";
    render(<Breadcrumbs />);
    const last = screen.getByText("Requests");
    expect(last).toBeInTheDocument();
    expect(last.closest("span")).toHaveAttribute("aria-current", "page");
  });

  it("sets aria-label='Breadcrumb' on the nav element", () => {
    mockPathname = "/admin/candidates";
    render(<Breadcrumbs />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
  });

  it("renders separator icons between items", () => {
    mockPathname = "/admin/candidates";
    render(<Breadcrumbs />);
    // ChevronRight icon elements with aria-hidden should exist between items
    const seps = document.querySelectorAll('li svg[aria-hidden="true"]');
    // With 2 items there should be 1 separator
    expect(seps.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Helper: render a function component that calls the hook
// ---------------------------------------------------------------------------

function renderHookResult<T>(hook: () => T): T {
  let result!: T;
  function TestComponent() {
    result = hook();
    return null;
  }
  render(<TestComponent />);
  return result;
}
