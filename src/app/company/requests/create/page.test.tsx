import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    id: 1,
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
    metrics,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/requests/CompanyRequestCreateForm", () => ({
  CompanyRequestCreateForm: ({ companies }: { companies: { id: number; name: string }[] }) => (
    <div data-testid="company-request-create-form">
      Companies: {companies.length}
    </div>
  ),
}));

const mockGetCompanyList = vi.fn();
vi.mock("./actions", () => ({
  getCompanyList: (...args: unknown[]) => mockGetCompanyList(...args),
}));

const mockCompanies = [
  { id: 1, name: "Tech Corp" },
  { id: 2, name: "BuildCo" },
  { id: 3, name: "LogiTrans" },
];

describe("CompanyRequestCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with correct eyebrow and title", async () => {
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
    expect(screen.getByTestId("company-request-create-form")).toHaveTextContent("Companies: 3");
  });

  it("renders with empty company list", async () => {
    mockGetCompanyList.mockResolvedValue([]);

    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("company-request-create-form")).toBeDefined();
    expect(screen.getByTestId("company-request-create-form")).toHaveTextContent("Companies: 0");
  });
});
