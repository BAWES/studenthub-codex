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

vi.mock("./DegreeDetailForm", () => ({
  DegreeDetailForm: ({
    degree,
    groups,
  }: {
    degree: { degree_name_en: string };
    groups: { degree_group_uuid: string; degree_group_name_en: string }[];
  }) => (
    <div data-testid="degree-detail-form">
      <span data-testid="form-degree-name">{degree.degree_name_en}</span>
      <span data-testid="form-groups-count">{groups.length}</span>
    </div>
  ),
}));

const mockGroups = [
  { degree_group_uuid: "g1", degree_group_name_en: "Group A" },
  { degree_group_uuid: "g2", degree_group_name_en: "Group B" },
];

const mockDegree = {
  degree_uuid: "550e8400-e29b-41d4-a716-446655440000",
  degree_name_en: "Bachelor of Science",
  degree_name_ar: "بكالوريوس علوم",
  degree_group_uuid: "660e8400-e29b-41d4-a716-446655440001",
  degree_sort_order: 1,
  degree_created_at: new Date("2026-01-15T08:00:00Z"),
  degree_updated_at: new Date("2026-06-20T12:00:00Z"),
  degree_group: {
    degree_group_uuid: "660e8400-e29b-41d4-a716-446655440001",
    degree_group_name_en: "Bachelor Degrees",
  },
};

const mockGetDegree = vi.fn();
const mockListDegreeGroups = vi.fn();

vi.mock("./actions", () => ({
  getDegree: (...args: unknown[]) => mockGetDegree(...args),
}));

vi.mock("@/app/admin/degree-group/actions", () => ({
  listDegreeGroups: (...args: unknown[]) => mockListDegreeGroups(...args),
}));

describe("AdminDegreeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListDegreeGroups.mockResolvedValue({ degree_groups: mockGroups });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders degree detail with all fields", async () => {
    mockGetDegree.mockResolvedValue({ degree: mockDegree });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Degrees");
    expect(screen.getByTestId("title")).toHaveTextContent("Bachelor of Science");

    expect(screen.getByTestId("metric-Sort order")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-Name (Arabic)")).toHaveTextContent("بكالوريوس علوم");

    expect(screen.getByTestId("fact-Degree UUID")).toHaveTextContent(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(screen.getByTestId("fact-Name (English)")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("بكالوريوس علوم");
    expect(screen.getByTestId("fact-Degree Group")).toHaveTextContent("Bachelor Degrees");
    expect(screen.getByTestId("fact-Sort order")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-01-15");
    expect(screen.getByTestId("fact-Last updated")).toHaveTextContent("2026-06-20");

    // DegreeDetailForm is rendered with degree data and groups
    expect(screen.getByTestId("degree-detail-form")).toBeTruthy();
    expect(screen.getByTestId("form-degree-name")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("form-groups-count")).toHaveTextContent("2");
  });

  it("renders null fields as em-dash", async () => {
    mockGetDegree.mockResolvedValue({
      degree: {
        ...mockDegree,
        degree_name_ar: null,
        degree_group_uuid: null,
        degree_group: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("metric-Sort order")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Name (Arabic)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Degree Group")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Sort order")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Last updated")).toHaveTextContent("—");
  });

  it("calls notFound when degree is null", async () => {
    mockGetDegree.mockResolvedValue({ degree: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls listDegreeGroups for form select", async () => {
    mockGetDegree.mockResolvedValue({ degree: mockDegree });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(mockListDegreeGroups).toHaveBeenCalledWith({ limit: 200 });
  });
});
