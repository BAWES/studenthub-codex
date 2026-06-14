import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
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

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockCompany = {
  company_name: "Acme Corp",
  company_email: "info@acme.com",
};

const mockContact = {
  contact_name: "John Smith",
  contact_email: "john@acme.com",
};

const mockStore = {
  store_id: 42,
  store_name: "Dubai Mall Store",
  store_location: "Dubai Mall, 2nd Floor",
  store_status: 1,
  store_total_candidates: 18,
  store_created_at: "2024-01-10T09:00:00.000Z",
  store_updated_at: "2024-06-01T12:00:00.000Z",
  company: mockCompany,
  contact: mockContact,
};

const mockGetStore = vi.fn();

vi.mock("./actions", () => ({
  getStore: (...args: unknown[]) => mockGetStore(...args),
}));

describe("AdminStoreDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders store detail with all fields including company and contact", async () => {
    mockGetStore.mockResolvedValue({ store: mockStore });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "42" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Stores");
    expect(screen.getByTestId("title")).toHaveTextContent("Dubai Mall Store");

    // Check metrics
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("18");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Active");

    // Check store detail fields
    const nameElements = screen.getAllByTestId("fact-Name");
    expect(nameElements[0]).toHaveTextContent("Dubai Mall Store");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Dubai Mall, 2nd Floor");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Active");
    expect(screen.getByTestId("fact-Total Candidates")).toHaveTextContent("18");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-06-01");

    // Check company section
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(nameElements[1]).toHaveTextContent("Acme Corp");

    // Check contact section
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(nameElements[2]).toHaveTextContent("John Smith");

    // Check back button
    expect(screen.getByText("Back to Stores")).toBeInTheDocument();
  });

  it("displays Inactive status when store_status is 0", async () => {
    mockGetStore.mockResolvedValue({
      store: { ...mockStore, store_status: 0 },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "99" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Inactive");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Inactive");
  });

  it("renders null fields as em-dash", async () => {
    mockGetStore.mockResolvedValue({
      store: {
        store_id: 99,
        store_name: "Empty Store",
        store_location: null,
        store_status: 0,
        store_total_candidates: null,
        store_created_at: null,
        store_updated_at: null,
        company: null,
        contact: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "99" }),
      }),
    );

    expect(screen.getByTestId("fact-Location")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Total Candidates")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
    expect(screen.queryByText("Contact")).not.toBeInTheDocument();
  });

  it("calls notFound when store is null", async () => {
    mockGetStore.mockResolvedValue({ store: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when storeId is NaN", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
