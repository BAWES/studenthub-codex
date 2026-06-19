import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/employer/jobs/actions", () => ({
  searchJobs: vi.fn(),
}));

vi.mock("./EmployerJobsSearchPage", () => ({
  EmployerJobsSearchPage: ({
    session,
    initialData,
  }: {
    session: unknown;
    initialData: { query: string; page: number };
  }) => (
    <div data-testid="search-page">
      <span data-testid="session-role">
        {(session as { role: string }).role}
      </span>
      <span data-testid="initial-q">{initialData.query}</span>
      <span data-testid="initial-page">{initialData.page}</span>
    </div>
  ),
}));

const mockSearchJobs = vi.mocked(
  (await import("@/modules/employer/jobs/actions")).searchJobs,
);

describe("EmployerJobsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchJobs.mockResolvedValue({
      query: "",
      page: 1,
      matchingCount: 0,
      rows: [],
      source: { current: "typesense", target: "typesense" },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with initial empty search", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("search-page")).toBeInTheDocument();
    expect(screen.getByTestId("session-role")).toHaveTextContent("company");
    expect(screen.getByTestId("initial-q")).toHaveTextContent("");
    expect(screen.getByTestId("initial-page")).toHaveTextContent("1");
  });

  it("calls searchJobs with empty query and page 1 on initial load", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(mockSearchJobs).toHaveBeenCalledWith({ q: "", page: 1 });
  });
});
