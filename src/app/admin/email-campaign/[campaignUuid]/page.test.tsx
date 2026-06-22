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

const mockCampaign = {
  campaign_uuid: "camp-123e4567-e89b-12d3-a456-426614174000",
  subject: "Welcome Email",
  message: "<p>Welcome to the platform!</p>",
  progress: 75,
  target: "student",
  status: true,
  created_at: new Date("2025-01-15T10:00:00.000Z"),
};

const mockGetEmailCampaign = vi.fn();
vi.mock("./actions", () => ({ getEmailCampaign: (...args: unknown[]) => mockGetEmailCampaign(...args) }));

describe("AdminEmailCampaignDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders email campaign detail with all fields", async () => {
    mockGetEmailCampaign.mockResolvedValue(mockCampaign);
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ campaignUuid: "camp-123e4567-e89b-12d3-a456-426614174000" }) }));
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Email Campaigns");
    expect(screen.getByTestId("title")).toHaveTextContent("Welcome Email");
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent("Welcome Email");
    expect(screen.getByTestId("fact-Target")).toHaveTextContent("student");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
  });

  it("renders null fields as em-dash", async () => {
    mockGetEmailCampaign.mockResolvedValue({
      ...mockCampaign,
      subject: null,
      message: null,
      progress: null,
      target: null,
      status: null,
      created_at: null,
    });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ campaignUuid: "sparse" }) }));
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Message")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Progress")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
  });

  it("calls notFound when campaign is null", async () => {
    mockGetEmailCampaign.mockResolvedValue(null);
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ campaignUuid: "nonexistent" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when campaignUuid is empty", async () => {
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ campaignUuid: "" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
