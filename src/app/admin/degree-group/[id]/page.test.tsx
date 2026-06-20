import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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
          {String(m.value)}
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

const mockDegreeGroup = {
  degree_group_uuid: "550e8400-e29b-41d4-a716-446655440000",
  degree_group_name_en: "Science Degrees",
  degree_group_name_ar: "الدرجات العلمية",
  degree_group_sort_order: 2,
  skip_major: false,
  degree_group_created_at: new Date("2026-01-15T08:00:00Z"),
  degree_group_updated_at: new Date("2026-06-20T12:00:00Z"),
};

const mockGetDegreeGroup = vi.fn();

vi.mock("../actions", () => ({
  getDegreeGroup: (...args: unknown[]) => mockGetDegreeGroup(...args),
}));

describe("AdminDegreeGroupDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders degree group detail with all fields", async () => {
    mockGetDegreeGroup.mockResolvedValue({ degree_group: mockDegreeGroup });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Degree Groups");
    expect(screen.getByTestId("title")).toHaveTextContent("Science Degrees");

    expect(screen.getByTestId("fact-UUID")).toHaveTextContent(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(screen.getByTestId("fact-English Name")).toHaveTextContent("Science Degrees");
    expect(screen.getByTestId("fact-Arabic Name")).toHaveTextContent("الدرجات العلمية");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("2");
    expect(screen.getByTestId("fact-Skip Major")).toHaveTextContent("No");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2026-06-20");
  });

  it("renders null fields as em-dash", async () => {
    mockGetDegreeGroup.mockResolvedValue({
      degree_group: {
        ...mockDegreeGroup,
        degree_group_name_ar: null,
        degree_group_sort_order: null,
        degree_group_created_at: null,
        degree_group_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("fact-Arabic Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when degree group is null", async () => {
    mockGetDegreeGroup.mockResolvedValue({ degree_group: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("shows Yes for skip_major when true", async () => {
    mockGetDegreeGroup.mockResolvedValue({
      degree_group: { ...mockDegreeGroup, skip_major: true },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("fact-Skip Major")).toHaveTextContent("Yes");
  });
});
