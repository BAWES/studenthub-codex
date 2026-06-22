import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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

const mockIp = {
  ip_uuid: "ip_abc123",
  ip_address: "192.168.1.1",
  note: "Suspicious activity detected",
  created_at: "2024-03-01T10:00:00.000Z",
  updated_at: "2024-03-05T14:30:00.000Z",
};

const mockGetBlockedIp = vi.fn();

vi.mock("./actions", () => ({
  getBlockedIp: (...args: unknown[]) => mockGetBlockedIp(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminBlockedIpDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders blocked IP detail with all fields", async () => {
    mockGetBlockedIp.mockResolvedValue(mockIp);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "ip_abc123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Blocked IPs");
    expect(screen.getByTestId("title")).toHaveTextContent("Blocked IP — 192.168.1.1");

    expect(screen.getByTestId("metric-IP Address")).toHaveTextContent("192.168.1.1");
    expect(screen.getByTestId("metric-UUID")).toHaveTextContent("ip_abc123");

    expect(screen.getByTestId("fact-IP UUID")).toHaveTextContent("ip_abc123");
    expect(screen.getByTestId("fact-IP Address")).toHaveTextContent("192.168.1.1");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("Suspicious activity detected");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-05");

    expect(screen.getByText("Back to Blocked IPs")).toBeInTheDocument();
  });

  it("renders with nullable fields as dash", async () => {
    mockGetBlockedIp.mockResolvedValue({
      ...mockIp,
      ip_address: null,
      note: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "ip_null_test" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Blocked IP — Unnamed IP");
    expect(screen.getByTestId("metric-IP Address")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-IP Address")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Note")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when IP is null", async () => {
    mockGetBlockedIp.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
