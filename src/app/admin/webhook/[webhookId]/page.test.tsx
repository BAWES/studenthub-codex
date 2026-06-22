// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({ children, eyebrow, title, metrics }: {
    children: React.ReactNode; eyebrow: string; title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (<span key={m.label} data-testid={`metric-${m.label}`}>{String(m.value)}</span>))}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({ title, facts }: {
    title: string; facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (<span key={String(f.label)} data-testid={`fact-${f.label}`}>{String(f.value)}</span>))}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockWebhook = {
  webhook_id: 1,
  event: "candidate.created",
  endpoint: "https://example.com/hooks/candidate-created",
  method: "POST",
  created_at: new Date("2025-01-15T10:00:00.000Z"),
  updated_at: new Date("2025-06-01T12:00:00.000Z"),
};

const mockGetWebhook = vi.fn();
vi.mock("./actions", () => ({ getWebhook: (...args: unknown[]) => mockGetWebhook(...args) }));

describe("AdminWebhookDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders webhook detail with all fields", async () => {
    mockGetWebhook.mockResolvedValue({ webhook: mockWebhook });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ webhookId: "1" }) }));
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Webhooks");
    expect(screen.getByTestId("title")).toHaveTextContent("candidate.created → https://example.com/hooks/candidate-created");
    expect(screen.getByTestId("fact-Event")).toHaveTextContent("candidate.created");
    expect(screen.getByTestId("fact-Method")).toHaveTextContent("POST");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
  });

  it("renders null fields as em-dash", async () => {
    mockGetWebhook.mockResolvedValue({
      webhook: { ...mockWebhook, method: null, created_at: null, updated_at: null },
    });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ webhookId: "2" }) }));
    expect(screen.getByTestId("fact-Method")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when webhook is null", async () => {
    mockGetWebhook.mockResolvedValue({ webhook: null });
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ webhookId: "999" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when webhookId is NaN", async () => {
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ webhookId: "abc" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
