import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
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

const mockSection = {
  permission_uuid: "per_sec_abc123",
  section_name: "User Management",
  created_at: new Date("2024-03-01T10:00:00.000Z"),
};

const mockGetPermissionSection = vi.fn();

vi.mock("./actions", () => ({
  getPermissionSection: (...args: unknown[]) => mockGetPermissionSection(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminPermissionDetailPage", () => {
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
        params: Promise.resolve({ id: "per_sec_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Permissions");
    expect(screen.getByTestId("title")).toHaveTextContent("Permission Section — User Management");

    // Check metrics
    expect(screen.getByTestId("metric-Section Name")).toHaveTextContent("User Management");
    expect(screen.getByTestId("metric-UUID")).toHaveTextContent("per_sec_abc123");

    // Check detail fields
    expect(screen.getByTestId("fact-Permission UUID")).toHaveTextContent("per_sec_abc123");
    expect(screen.getByTestId("fact-Section Name")).toHaveTextContent("User Management");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");

    // Check back button
    expect(screen.getByText("Back to Permissions")).toBeInTheDocument();
  });

  it("renders with null section name", async () => {
    mockGetPermissionSection.mockResolvedValue({
      ...mockSection,
      section_name: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "per_sec_null_name" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Permission Section — Unnamed Section");
    expect(screen.getByTestId("metric-Section Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Section Name")).toHaveTextContent("—");
  });

  it("calls notFound when section is null", async () => {
    mockGetPermissionSection.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
