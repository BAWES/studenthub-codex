// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CompanyLayout, { dynamic } from "./CompanyLayout";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = "/company";

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
  id: "company-1",
  role: "company" as const,
  name: "Charlie Company",
  email: "charlie@company.com",
  issuedAt: Date.now(),
  capabilities: ["company.read.linked", "company.write"],
} as const;

async function renderCompanyLayout({
  session = defaultSession,
  children = <div data-testid="child-content">Page Content</div>,
}: {
  session?: any;
  children?: React.ReactNode;
} = {}) {
  mockRequireRoleCapability.mockResolvedValue(session);
  const element = await CompanyLayout({ children });
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
  mockPathname = "/company";
});

describe("CompanyLayout", () => {
  describe("exports", () => {
    it("has dynamic = force-dynamic export", () => {
      expect(dynamic).toBe("force-dynamic");
    });

    it("re-exports CompanyLayout from barrel", async () => {
      const mod = await import("./index");
      expect(mod.CompanyLayout).toBeDefined();
    });
  });

  describe("auth", () => {
    it("calls requireRoleCapability with company role and company.read.linked capability", async () => {
      await renderCompanyLayout();
      expect(mockRequireRoleCapability).toHaveBeenCalledTimes(1);
      expect(mockRequireRoleCapability).toHaveBeenCalledWith(
        "company",
        "company.read.linked",
      );
    });
  });

  describe("rendering", () => {
    it("renders without crashing with a valid session", async () => {
      await expect(renderCompanyLayout()).resolves.not.toThrow();
    });

    it("renders children in the content area", async () => {
      await renderCompanyLayout({
        children: <div data-testid="custom-child">Hello World</div>,
      });
      expect(screen.getByTestId("custom-child")).toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("renders the company role branding heading", async () => {
      await renderCompanyLayout();
      const heading = screen.getByRole("heading", {
        level: 2,
        name: "Company",
      });
      expect(heading).toBeInTheDocument();
    });

    it("renders user name and email from session", async () => {
      await renderCompanyLayout({
        session: { ...defaultSession, name: "Dana Corp", email: "dana@test.com" },
      });
      expect(screen.getByText("Dana Corp")).toBeInTheDocument();
      expect(screen.getByText("dana@test.com")).toBeInTheDocument();
    });

    it("renders a sign out button", async () => {
      await renderCompanyLayout();
      expect(screen.getByTitle("Sign out")).toBeInTheDocument();
    });

    it("renders breadcrumbs navigation", async () => {
      await renderCompanyLayout();
      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });
  });

  describe("session edge cases", () => {
    it("renders with minimal session data", async () => {
      const minimalSession = {
        id: "minimal",
        role: "company" as const,
        name: "Min",
        email: "min@company.com",
        issuedAt: Date.now(),
        capabilities: ["company.read.linked"],
      };
      await expect(
        renderCompanyLayout({ session: minimalSession }),
      ).resolves.not.toThrow();
      expect(screen.getByText("Min")).toBeInTheDocument();
      expect(screen.getByText("min@company.com")).toBeInTheDocument();
    });
  });
});
