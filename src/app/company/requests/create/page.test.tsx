import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => {
  type Metric = { label: string; value: string | number; note: string };
  return {
    WorkspaceShell: ({
      children,
      eyebrow,
      title,
    }: {
      children: React.ReactNode;
      eyebrow: string;
      title: string;
      metrics: Metric[];
    }) => (
      <div data-testid="workspace-shell">
        <div data-testid="eyebrow">{eyebrow}</div>
        <div data-testid="title">{title}</div>
        {children}
      </div>
    ),
  };
});

vi.mock("@/modules/requests/CompanyRequestCreateForm", () => ({
  CompanyRequestCreateForm: ({ companies }: { companies: { id: number; name: string }[] }) => (
    <div data-testid="company-request-create-form">
      <span data-testid="company-count">{companies.length}</span>
      {companies.map((c) => (
        <span key={c.id} data-testid={`company-option-${c.id}`}>
          {c.name}
        </span>
      ))}
    </div>
  ),
}));

const mockGetCompanyList = vi.fn();

vi.mock("./actions", () => ({
  getCompanyList: (...args: unknown[]) => mockGetCompanyList(...args),
}));

const mockCompanies = [
  { id: 1, name: "Tech Corp" },
  { id: 2, name: "Retail Group" },
  { id: 3, name: "Consulting Inc" },
];

describe("CompanyRequestCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    mockGetCompanyList.mockResolvedValue(mockCompanies);

    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company");
    expect(screen.getByTestId("title")).toHaveTextContent("New Request");
  });

  it("renders CompanyRequestCreateForm with company list", async () => {
    mockGetCompanyList.mockResolvedValue(mockCompanies);

    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("company-request-create-form")).toBeDefined();
    expect(screen.getByTestId("company-count")).toHaveTextContent("3");
    expect(screen.getByTestId("company-option-1")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("company-option-2")).toHaveTextContent("Retail Group");
    expect(screen.getByTestId("company-option-3")).toHaveTextContent("Consulting Inc");
  });

  it("renders with empty company list", async () => {
    mockGetCompanyList.mockResolvedValue([]);

    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("company-request-create-form")).toBeDefined();
    expect(screen.getByTestId("company-count")).toHaveTextContent("0");
  });
});
