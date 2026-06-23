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
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockGroups = [
  { degree_group_uuid: "g1", degree_group_name_en: "Undergraduate" },
  { degree_group_uuid: "g2", degree_group_name_en: "Postgraduate" },
];

vi.mock("@/modules/admin/degree-group/actions", () => ({
  listDegreeGroups: vi.fn().mockResolvedValue({
    degree_groups: mockGroups,
    total: 2,
    page: 1,
    limit: 200,
    totalPages: 1,
  }),
}));

const mockDegree = {
  degree_uuid: "550e8400-e29b-41d4-a716-446655440000",
  degree_name_en: "Bachelor of Science",
  degree_name_ar: "بكالوريوس علوم",
  degree_group_uuid: "660e8400-e29b-41d4-a716-446655440001",
  degree_sort_order: 1,
  degree_created_at: new Date("2026-01-15T08:00:00Z"),
  degree_updated_at: new Date("2026-06-20T12:00:00Z"),
};

const mockGetDegree = vi.fn();

vi.mock("./actions", () => ({
  getDegree: (...args: unknown[]) => mockGetDegree(...args),
}));

// Mock the DegreeDetailForm component
vi.mock("./DegreeDetailForm", () => ({
  DegreeDetailForm: ({
    degree,
    groups,
  }: {
    degree: Record<string, unknown>;
    groups: { degree_group_uuid: string; degree_group_name_en: string }[];
  }) => (
    <div data-testid="degree-detail-form">
      <span data-testid="form-degree-name">{degree.degree_name_en as string}</span>
      <span data-testid="form-groups-count">{groups.length}</span>
    </div>
  ),
}));

describe("AdminDegreeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders DegreeDetailForm with degree data and groups", async () => {
    mockGetDegree.mockResolvedValue({ degree: mockDegree });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Degrees");
    expect(screen.getByTestId("title")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("degree-detail-form")).toBeInTheDocument();
    expect(screen.getByTestId("form-degree-name")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("form-groups-count")).toHaveTextContent("2");
  });

  it("calls notFound when degree is null", async () => {
    mockGetDegree.mockResolvedValue({ degree: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
