// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import StaffLayout, { dynamic } from "./StaffLayout";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/staff";

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
  id: "staff-1",
  role: "staff" as const,
  name: "Sara Staff",
  email: "sara@staff.com",
  issuedAt: Date.now(),
  capabilities: ["request.read.assigned", "candidate.read"],
} as const;

async function renderStaffLayout({
  session = defaultSession,
  children = <div data-testid="child-content">Page Content</div>,
}: {
  session?: any;
  children?: React.ReactNode;
} = {}) {
  mockRequireRoleCapability.mockResolvedValue(session);
  const element = await StaffLayout({ children });
  return render(element);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  mockPathname = "/staff";
});

describe("StaffLayout", () => {
  describe("exports", () => {
    it("has dynamic = force-dynamic export", () => {
      expect(dynamic).toBe("force-dynamic");
    });

    it("re-exports StaffLayout from barrel", async () => {
      const mod = await import("./index");
      expect(mod.StaffLayout).toBeDefined();
    });
  });

  describe("auth", () => {
    it("calls requireRoleCapability with staff role and request.read.assigned capability", async () => {
      await renderStaffLayout();
      expect(mockRequireRoleCapability).toHaveBeenCalledTimes(1);
      expect(mockRequireRoleCapability).toHaveBeenCalledWith(
        "staff",
        "request.read.assigned",
      );
    });
  });

  describe("rendering", () => {
    it("renders without crashing with a valid session", async () => {
      await expect(renderStaffLayout()).resolves.not.toThrow();
    });

    it("renders children in the content area", async () => {
      await renderStaffLayout({
        children: <div data-testid="custom-child">Hello World</div>,
      });
      expect(screen.getByTestId("custom-child")).toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders the staff role branding heading", async () => {
      await renderStaffLayout();
      const heading = screen.getByRole("heading", { level: 2, name: "Staff" });
      expect(heading).toBeInTheDocument();
    });

    it("renders user name and email from session", async () => {
      await renderStaffLayout({
        session: { ...defaultSession, name: "Tina Staff", email: "tina@test.com" },
      });
      expect(screen.getByText("Tina Staff")).toBeInTheDocument();
      expect(screen.getByText("tina@test.com")).toBeInTheDocument();
    });

    it("renders a sign out button", async () => {
      await renderStaffLayout();
      expect(screen.getByTitle("Sign out")).toBeInTheDocument();
    });

    it("renders breadcrumbs navigation", async () => {
      await renderStaffLayout();
      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });
  });

  describe("session edge cases", () => {
    it("renders with minimal session data", async () => {
      const minimalSession = {
        id: "minimal",
        role: "staff" as const,
        name: "Min",
        email: "min@staff.com",
        issuedAt: Date.now(),
        capabilities: ["request.read.assigned"],
      };
      await expect(
        renderStaffLayout({ session: minimalSession }),
      ).resolves.not.toThrow();
      expect(screen.getByText("Min")).toBeInTheDocument();
      expect(screen.getByText("min@staff.com")).toBeInTheDocument();
    });
  });
});
