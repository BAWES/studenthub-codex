// @vitest-environment jsdom
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
      {facts.map((f: { label: string; value: React.ReactNode }) => (
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
    const container = render(
      await Page({
        params: Promise.resolve({ id: mockDegree.degree_uuid }),
      }),
    );

    expect(container.getByTestId("eyebrow").textContent).toBe("Admin / Degrees");
    expect(container.getByTestId("title").textContent).toBe("Bachelor of Science");

    expect(container.getByTestId("metric-Sort order").textContent).toBe("1");
    expect(container.getByTestId("metric-Name (Arabic)").textContent).toBe("بكالوريوس علوم");
    expect(container.getByTestId("fact-Degree UUID").textContent).toBe(mockDegree.degree_uuid);
  });

  it("renders null fields as em-dash", async () => {
    mockGetDegree.mockResolvedValue({
      degree: {
        ...mockDegree,
        degree_name_ar: null,
        degree_group_uuid: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    const container = render(
      await Page({
        params: Promise.resolve({ id: mockDegree.degree_uuid }),
      }),
    );

    expect(container.getByTestId("metric-Sort order").textContent).toBe("—");
    expect(container.getByTestId("metric-Name (Arabic)").textContent).toBe("—");
    expect(container.getByTestId("fact-Name (Arabic)").textContent).toBe("—");
    expect(container.getByTestId("fact-Degree Group UUID").textContent).toBe("—");
  });

  it("calls notFound when degree is null", async () => {
    mockGetDegree.mockResolvedValue({ degree: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
