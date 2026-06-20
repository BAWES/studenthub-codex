import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  store_id: 1,
  store_name: "Flagship Store - Kuwait City",
  store_location: "The Avenues Mall, Phase 3",
  store_status: "active" as const,
  company_id: 42,
  company_name: "Retail Co.",
  mall_name: "The Avenues",
  brand_name: "Zara",
  manager_name: "Fatima Al-Rashid",
  manager_email: "fatima@store.kw",
  created_at: "2025-01-15T08:00:00.000Z",
  updated_at: "2026-06-01T12:30:00.000Z",
};

describe("CompanyStoreDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders store detail with correct eyebrow and title", async () => {
    mockGetStoreDetail.mockResolvedValue(mockStoreData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Stores");
    expect(screen.getByTestId("title")).toHaveTextContent("Flagship Store - Kuwait City");
  });

  it("renders DetailSection with Store Details facts", async () => {
    mockGetStoreDetail.mockResolvedValue(mockStoreData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1" }) }));

    expect(screen.getByTestId("section-title")).toHaveTextContent("Store Details");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Flagship Store - Kuwait City");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("The Avenues Mall, Phase 3");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("active");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Retail Co.");
    expect(screen.getByTestId("fact-Mall")).toHaveTextContent("The Avenues");
    expect(screen.getByTestId("fact-Brand")).toHaveTextContent("Zara");
    expect(screen.getByTestId("fact-Manager")).toHaveTextContent("Fatima Al-Rashid");
    expect(screen.getByTestId("fact-Manager Email")).toHaveTextContent("fatima@store.kw");
  });

  it("renders created and updated dates", async () => {
    mockGetStoreDetail.mockResolvedValue(mockStoreData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1" }) }));

    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2026-06-01");
  });

  it("calls notFound when store ID is NaN", async () => {
    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when getStoreDetail returns null", async () => {
    mockGetStoreDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
