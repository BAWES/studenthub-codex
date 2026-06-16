import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "42" },
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
    {facts.map((f) => {
      const v =
        f.value === null || f.value === undefined
          ? ""
          : typeof f.value === "string"
            ? f.value
            : "node";
      return (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {v}
        </span>
      );
    })}
  </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : "N/A",
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockGetStoreDetail = vi.fn();

vi.mock("./actions", () => ({
  getStoreDetail: (...args: unknown[]) => mockGetStoreDetail(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullStore = {
  store_id: 1,
  store_name: "Zara - Avenues Mall",
  store_location: "Avenues Mall, Block 4, Floor 2",
  store_status: "Active",
  company_name: "Alshaya Group",
  mall_name: "The Avenues",
  brand_name: "Zara",
  manager_name: "Ahmed Al-Mutawa",
  manager_email: "ahmed@alshaya.com",
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-06-01T14:30:00.000Z",
};

const minimalStore = {
  store_id: 2,
  store_name: "H&M - 360 Mall",
  store_location: "360 Mall, Ground Floor",
  store_status: "Inactive",
  company_name: null,
  mall_name: null,
  brand_name: null,
  manager_name: null,
  manager_email: null,
  created_at: "2025-03-01T08:00:00.000Z",
  updated_at: "2025-03-01T08:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompanyStoreDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders store detail with full fields", async () => {
    mockGetStoreDetail.mockResolvedValue(fullStore);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "1" }) }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Stores");
    expect(screen.getByTestId("title")).toHaveTextContent("Zara - Avenues Mall");
    expect(screen.getByTestId("section-title")).toHaveTextContent("Store Details");

    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Zara - Avenues Mall");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Avenues Mall, Block 4, Floor 2");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Active");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Alshaya Group");
    expect(screen.getByTestId("fact-Mall")).toHaveTextContent("The Avenues");
    expect(screen.getByTestId("fact-Brand")).toHaveTextContent("Zara");
    expect(screen.getByTestId("fact-Manager")).toHaveTextContent("Ahmed Al-Mutawa");
    expect(screen.getByTestId("fact-Manager Email")).toHaveTextContent("ahmed@alshaya.com");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-06-01");
  });

  it("renders with null optional fields gracefully", async () => {
    mockGetStoreDetail.mockResolvedValue(minimalStore);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "2" }) }),
    );

    // Null values render as empty in the mock
    expect(screen.getByTestId("fact-Company")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Mall")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Brand")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Manager")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Manager Email")).toBeEmptyDOMElement();
  });

  it("calls getStoreDetail with parsed number ID", async () => {
    mockGetStoreDetail.mockResolvedValue(fullStore);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "42" }) }),
    );

    expect(mockGetStoreDetail).toHaveBeenCalledWith(42);
  });

  it("calls notFound when store is null", async () => {
    mockGetStoreDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when store ID is NaN", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
