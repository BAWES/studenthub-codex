import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import type { SessionUser } from "@/modules/auth/types";

// Mock auth
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    id: "42",
    name: "Test Employer",
    email: "employer@test.com",
    role: "company",
    issuedAt: Date.now(),
  } as SessionUser),
  requireCapability: vi.fn().mockResolvedValue(undefined),
  getSession: vi.fn().mockResolvedValue({ id: "42" }),
}));

// Mock the search action
const mockSearchJobs = vi.fn();
vi.mock("@/modules/employer/jobs/actions", () => ({
  searchJobs: (...args: unknown[]) => mockSearchJobs(...args),
}));

// Mock EmployerJobsSearchPage
vi.mock("./EmployerJobsSearchPage", () => ({
  EmployerJobsSearchPage: ({
    session,
    initialData,
    searchAction,
  }: {
    session: SessionUser;
    initialData: unknown;
    searchAction: (...args: unknown[]) => unknown;
  }) => (
    <div data-testid="employer-jobs-search-page">
      <div data-testid="session-id">{session.id}</div>
      <div data-testid="initial-count">
        {initialData && typeof initialData === "object" && "matchingCount" in initialData
          ? String((initialData as { matchingCount: number }).matchingCount)
          : "none"}
      </div>
      <div data-testid="has-search-action">{typeof searchAction === "function" ? "yes" : "no"}</div>
    </div>
  ),
}));

import EmployerJobsPage from "./page";

function makeInitialData(overrides: Record<string, unknown> = {}) {
  return {
    query: "",
    page: 1,
    matchingCount: 0,
    rows: [],
    source: { current: "MySQL", target: "Typesense" },
    ...overrides,
  };
}

describe("EmployerJobsPage", () => {
  beforeEach(() => {
    mockSearchJobs.mockReset();
    mockSearchJobs.mockResolvedValue(makeInitialData());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls requireRoleCapability with company role and company.read.linked", async () => {
    const { requireRoleCapability } = await import("@/modules/auth/session");
    const { default: Page } = await import("./page");

    try {
      const page = await Page();
      const { render } = await import("@testing-library/react");
      const { container } = render(page);

      expect(requireRoleCapability).toHaveBeenCalledWith("company", "company.read.linked");
    } finally {
      cleanup();
    }
  });

  it("calls searchJobs with default query on initial load", async () => {
    const { default: Page } = await import("./page");

    try {
      const page = await Page();
      const { render } = await import("@testing-library/react");
      render(page);

      expect(mockSearchJobs).toHaveBeenCalledWith({ q: "", page: 1 });
    } finally {
      cleanup();
    }
  });

  it("renders EmployerJobsSearchPage with session, initialData, and searchAction", async () => {
    const { default: Page } = await import("./page");

    try {
      const page = await Page();
      const { render, screen } = await import("@testing-library/react");
      render(page);

      expect(screen.getByTestId("employer-jobs-search-page")).toBeDefined();
      expect(screen.getByTestId("session-id").textContent).toBe("42");
      expect(screen.getByTestId("has-search-action").textContent).toBe("yes");
    } finally {
      cleanup();
    }
  });

  it("passes initial search results matchingCount to EmployerJobsSearchPage", async () => {
    mockSearchJobs.mockResolvedValue(makeInitialData({ matchingCount: 5 }));
    const { default: Page } = await import("./page");

    try {
      const page = await Page();
      const { render, screen } = await import("@testing-library/react");
      render(page);

      expect(screen.getByTestId("initial-count").textContent).toBe("5");
    } finally {
      cleanup();
    }
  });

  it("handles empty search results gracefully", async () => {
    mockSearchJobs.mockResolvedValue(makeInitialData({ matchingCount: 0, rows: [] }));
    const { default: Page } = await import("./page");

    try {
      const page = await Page();
      const { render, screen } = await import("@testing-library/react");
      render(page);

      expect(screen.getByTestId("initial-count").textContent).toBe("0");
    } finally {
      cleanup();
    }
  });

  it("renders as a server component with force-dynamic re-export", async () => {
    // This test verifies the module doesn't crash during RSC rendering
    const mod = await import("./page");
    expect(mod.dynamic).toBe("force-dynamic");
  });
});
