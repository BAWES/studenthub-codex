import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi
    .fn()
    .mockResolvedValue({ user: { id: "1" }, role: "admin" }),
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

const mockSection = {
  permissionUuid: "section_uuid_abc",
  sectionName: "Candidate Management",
  createdAt: new Date("2024-03-10T08:00:00.000Z"),
};

const mockGetPermissionSection = vi.fn();

vi.mock("./actions", () => ({
  getPermissionSection: (...args: unknown[]) => mockGetPermissionSection(...args),
}));

describe("AdminPermissionSectionDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders permission section detail with all fields", async () => {
    mockGetPermissionSection.mockResolvedValue(mockSection);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ permissionUuid: "section_uuid_abc" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Permission Sections");
    expect(screen.getByTestId("title")).toHaveTextContent("Candidate Management");

    // Check metric
    expect(screen.getByTestId("metric-Permission UUID")).toHaveTextContent("section_uuid_abc");

    // Check detail fields
    expect(screen.getByTestId("fact-Section Name")).toHaveTextContent("Candidate Management");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-10");
  });

  it("renders null section name as em-dash", async () => {
    mockGetPermissionSection.mockResolvedValue({
      ...mockSection,
      sectionName: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ permissionUuid: "section_null_name" }),
      }),
    );

    expect(screen.getByTestId("fact-Section Name")).toHaveTextContent("—");
  });

  it("calls notFound when section returns an error", async () => {
    mockGetPermissionSection.mockResolvedValue({
      error: "Permission section not found.",
    });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ permissionUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
