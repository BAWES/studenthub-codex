import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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
      metrics,
    }: {
      children: React.ReactNode;
      eyebrow: string;
      title: string;
      metrics: Metric[];
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
  };
});

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
  }: {
    title: string;
    facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetStoreDetail = vi.fn();

vi.mock("./actions", () => ({
  getStoreDetail: (...args: unknown[]) => mockGetStoreDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockStoreData = {
  store_id: 42,
  store_name: "Boutique A",
  store_location: "Floor 1, Block A",
  store_status: "active" as const,
  company_id: 10,
  company_name: "Retail Group",
  mall_name: "The Avenues",
  brand_name: "Zara",
  manager_name: "Ahmed Ali",
  manager_email: "ahmed@store.com",
  created_at: "2024-01-15T00:00:00.000Z",
  updated_at: "2025-03-10T00:00:00.000Z",
};

describe("CompanyStoreDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders store detail with WorkspaceShell and correct eyebrow/title", async () => {
    mockGetStoreDetail.mockResolvedValue(mockStoreData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Stores");
    expect(screen.getByTestId("title")).toHaveTextContent("Boutique A");
  });

  it("renders DetailSection with Store Details facts", async () => {
    mockGetStoreDetail.mockResolvedValue(mockStoreData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Store Details");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Boutique A");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Floor 1, Block A");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("active");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Retail Group");
    expect(screen.getByTestId("fact-Mall")).toHaveTextContent("The Avenues");
    expect(screen.getByTestId("fact-Brand")).toHaveTextContent("Zara");
    expect(screen.getByTestId("fact-Manager")).toHaveTextContent("Ahmed Ali");
    expect(screen.getByTestId("fact-Manager Email")).toHaveTextContent("ahmed@store.com");
    expect(screen.getByTestId("fact-Created")).toBeDefined();
    expect(screen.getByTestId("fact-Updated")).toBeDefined();
  });

  it("shows fallback values for null optional fields", async () => {
    mockGetStoreDetail.mockResolvedValue({
      ...mockStoreData,
      company_name: null,
      mall_name: null,
      brand_name: null,
      manager_name: null,
      manager_email: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "99" }) }));

    // null values render as "null" via String() in the mock
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Mall")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Brand")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Manager")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Manager Email")).toHaveTextContent("null");
  });

  it("calls notFound when getStoreDetail returns null", async () => {
    mockGetStoreDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound for NaN storeId", async () => {
    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "not-a-number" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
