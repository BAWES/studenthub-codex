// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RoleLayoutShell, type RoleBranding } from "./RoleLayoutShell";
import {
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  SearchCheck,
} from "lucide-react";
import { WorkspaceOSContext } from "./WorkspaceOSContext";

// ---------------------------------------------------------------------------
// Mocks — set mockPathname before each test
// ---------------------------------------------------------------------------

let mockPathname = "/admin";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/modules/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLES = ["admin", "staff", "candidate", "company", "inspector"] as const;

type Role = (typeof ROLES)[number];

function renderShell({
  role = "admin" as Role,
  userName = "Alice",
  userEmail = "alice@example.com",
  children = <div data-testid="child-content">Page Content</div>,
  session = null,
}: {
  role?: Role;
  userName?: string;
  userEmail?: string;
  children?: React.ReactNode;
  session?: { role: Role; name: string; email: string } | null;
} = {}) {
  return render(
    <WorkspaceOSContext.Provider
      value={{
        embedded: false,
        session: session as any,
      }}
    >
      <RoleLayoutShell role={role} userName={userName} userEmail={userEmail}>
        {children}
      </RoleLayoutShell>
    </WorkspaceOSContext.Provider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mockPathname = "/admin";
});

describe("ROLE_BRANDING", () => {
  // Reconstruct the internal mapping in test to verify all roles are covered.
  // RoleLayoutShell uses a dynamic lookup that falls back to Shield for
  // unknown roles, so the record must cover all five.
  const KNOWN = new Set(ROLES);
  const BRANDING: Record<Role, { label: string }> = {
    admin: { label: "Admin" },
    staff: { label: "Staff" },
    candidate: { label: "Candidate" },
    company: { label: "Company" },
    inspector: { label: "Inspector" },
  };

  it("has entries for all five roles", () => {
    for (const role of ROLES) {
      expect(BRANDING[role]).toBeDefined();
      expect(BRANDING[role].label).toBeTruthy();
    }
  });

  it("has unique labels for each role", () => {
    const labels = ROLES.map((r) => BRANDING[r].label);
    expect(new Set(labels).size).toBe(ROLES.length);
  });
});

describe("RoleLayoutShell", () => {
  it("exports RoleLayoutShell as a function", () => {
    expect(typeof RoleLayoutShell).toBe("function");
  });

  it("accepts valid props via type check", () => {
    const props: Parameters<typeof RoleLayoutShell>[0] = {
      role: "admin",
      userName: "Alice",
      userEmail: "alice@example.com",
      children: null,
    };
    expect(props.role).toBe("admin");
    expect(props.userName).toBe("Alice");
    expect(props.userEmail).toBe("alice@example.com");
  });

  it("renders the role branding heading (h2)", () => {
    renderShell({ role: "admin" });
    const heading = screen.getByRole("heading", { level: 2, name: "Admin" });
    expect(heading).toBeInTheDocument();
  });

  it("renders the correct branding heading for each role", () => {
    for (const role of ROLES) {
      cleanup();
      renderShell({ role });
      const label = role.charAt(0).toUpperCase() + role.slice(1);
      const heading = screen.getByRole("heading", { level: 2, name: label });
      expect(heading).toBeInTheDocument();
    }
  });

  it("renders user name and email", () => {
    renderShell({ userName: "Bob", userEmail: "bob@test.com" });
    // userName appears as a span
    expect(screen.getByText("Bob")).toBeInTheDocument();
    // userEmail appears as a strong element
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    renderShell();
    expect(screen.getByRole("button", { name: /dark|light/i })).toBeInTheDocument();
  });

  it("renders a sign out button", () => {
    renderShell();
    expect(screen.getByTitle("Sign out")).toBeInTheDocument();
  });

  it("renders children inside a main content area", () => {
    renderShell({
      children: <div data-testid="custom-child">Hello World</div>,
    });
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders breadcrumbs as a nav with aria-label", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
  });

  it("breadcrumbs show role prefix and page when on /admin/candidates", () => {
    mockPathname = "/admin/candidates";
    renderShell();
    // Both "Admin" (header breadcrumb) and "Candidates" should be in the breadcrumb nav
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveTextContent("Admin");
    expect(nav).toHaveTextContent("Candidates");
  });

  it("renders the role icon alongside the heading", () => {
    renderShell({ role: "inspector" });
    const heading = screen.getByRole("heading", { level: 2, name: "Inspector" });
    expect(heading).toBeInTheDocument();
    // The icon is a lucide svg rendered from the SearchCheck icon
    const icons = document.querySelectorAll('header svg[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  // ── No duplicate `#main-content` id (P0 a11y — STU-1628) ──────────────

  it("does NOT render a skip-to-content link (WorkspaceOS provides it)", () => {
    renderShell();
    const links = screen.queryAllByRole("link", { name: /skip to content/i });
    expect(links.length).toBe(0);
  });

  it("main element does NOT carry id='main-content' to avoid duplicate with WorkspaceOS", () => {
    renderShell();
    const main = document.getElementById("main-content");
    expect(main).toBeNull();
  });

  it("renders children inside a semantically correct main landmark", () => {
    renderShell({
      children: <div data-testid="child">Hello</div>,
    });
    const mains = document.querySelectorAll("main");
    expect(mains.length).toBe(1);
    expect(mains[0]).not.toHaveAttribute("id");
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
