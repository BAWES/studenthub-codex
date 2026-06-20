import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

const mockDegree = {
  degree_uuid: "deg-uuid-123",
  degree_name_en: "Bachelor of Science",
  degree_name_ar: "بكالوريوس",
  degree_group_uuid: null,
  degree_sort_order: 1,
  degree_created_at: new Date("2025-01-15T10:00:00.000Z"),
  degree_updated_at: new Date("2025-06-01T12:00:00.000Z"),
};

const mockGetDegree = vi.fn();

vi.mock("./actions", () => ({
  getDegree: (...args: unknown[]) => mockGetDegree(...args),
}));

describe("AdminDegreeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders degree detail with all fields", async () => {
    mockGetDegree.mockResolvedValue({ degree: mockDegree });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ degreeUuid: "deg-uuid-123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Degrees");
    expect(screen.getByTestId("title")).toHaveTextContent("Bachelor of Science");

    expect(screen.getByTestId("fact-Name (EN)")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("بكالوريوس");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-06-01");
  });

  it("renders null fields as em-dash", async () => {
    mockGetDegree.mockResolvedValue({
      degree: {
        ...mockDegree,
        degree_name_ar: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ degreeUuid: "sparse-degree" }),
      }),
    );

    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when degree is null", async () => {
    mockGetDegree.mockResolvedValue({ degree: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ degreeUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when degreeUuid is empty", async () => {
    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ degreeUuid: "" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
