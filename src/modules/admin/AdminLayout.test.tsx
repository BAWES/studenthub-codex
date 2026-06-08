// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AdminLayout, { dynamic } from "./AdminLayout";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/admin";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/modules/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

const mockRequireRoleCapability = vi.fn();

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: (...args: any[]) => mockRequireRoleCapability(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultSession = {
  id: "admin-1",
  role: "admin" as const,
  name: "Alice Admin",
  email: "alice@admin.com",
  issuedAt: Date.now(),
  capabilities: ["admin.system", "admin.candidates", "admin.companies"],
} as const;

async function renderAdminLayout({
  session = defaultSession,
  children = <div data-testid="child-content">Page Content</div>,
}: {
  session?: any;
  children?: React.ReactNode;
} = {}) {
  mockRequireRoleCapability.mockResolvedValue(session);
  const element = await AdminLayout({ children });
  return render(element);
}

let AdminLayoutModule: any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  mockPathname = "/admin";
  AdminLayoutModule = null;
});

describe("AdminLayout", () => {
  describe("exports", () => {
    it("has dynamic = force-dynamic export", () => {
      expect(dynamic).toBe("force-dynamic");
    });

    it("re-exports AdminLayout from barrel", async () => {
      const mod = await import("./index");
      expect(mod.AdminLayout).toBeDefined();
    });
  });

  describe("auth", () => {
    it("calls requireRoleCapability with admin role and admin.system capability", async () => {
      await renderAdminLayout();
      expect(mockRequireRoleCapability).toHaveBeenCalledTimes(1);
      expect(mockRequireRoleCapability).toHaveBeenCalledWith("admin", "admin.system");
    });
  });

  describe("rendering", () => {
    it("renders without crashing with a valid session", async () => {
      await expect(renderAdminLayout()).resolves.not.toThrow();
    });

    it("renders children in the content area", async () => {
      await renderAdminLayout({
        children: <div data-testid="custom-child">Hello World</div>,
      });
      expect(screen.getByTestId("custom-child")).toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders the admin role branding heading", async () => {
      await renderAdminLayout();
      const heading = screen.getByRole("heading", { level: 2, name: "Admin" });
      expect(heading).toBeInTheDocument();
    });

    it("renders user name and email from session", async () => {
      await renderAdminLayout({
        session: { ...defaultSession, name: "Bob Admin", email: "bob@test.com" },
      });
      expect(screen.getByText("Bob Admin")).toBeInTheDocument();
      expect(screen.getByText("bob@test.com")).toBeInTheDocument();
    });

    it("renders a sign out button", async () => {
      await renderAdminLayout();
      expect(screen.getByTitle("Sign out")).toBeInTheDocument();
    });

    it("renders breadcrumbs navigation", async () => {
      await renderAdminLayout();
      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });
  });

  describe("session edge cases", () => {
    it("renders with minimal session data", async () => {
      const minimalSession = {
        id: "minimal",
        role: "admin" as const,
        name: "Min",
        email: "min@admin.com",
        issuedAt: Date.now(),
        capabilities: ["admin.system"],
      };
      await expect(
        renderAdminLayout({ session: minimalSession }),
      ).resolves.not.toThrow();
      expect(screen.getByText("Min")).toBeInTheDocument();
      expect(screen.getByText("min@admin.com")).toBeInTheDocument();
    });
  });
});
