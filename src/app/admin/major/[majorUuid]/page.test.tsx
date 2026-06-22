// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
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

const mockMajor = {
  major_uuid: "mjr-456",
  major_name_en: "Computer Science",
  major_name_ar: "علوم الحاسوب",
  data_source: 1,
  major_created_at: new Date("2025-01-15T10:00:00.000Z"),
  major_updated_at: new Date("2025-06-01T12:00:00.000Z"),
};

const mockGetMajor = vi.fn();
vi.mock("./actions", () => ({ getMajor: (...args: unknown[]) => mockGetMajor(...args) }));

describe("AdminMajorDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders major detail with all fields", async () => {
    mockGetMajor.mockResolvedValue({ major: mockMajor });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ majorUuid: "mjr-456" }) }));
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Majors");
    expect(screen.getByTestId("title")).toHaveTextContent("Computer Science");
    expect(screen.getByTestId("fact-Name (EN)")).toHaveTextContent("Computer Science");
    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("علوم الحاسوب");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
  });

  it("renders null fields as em-dash", async () => {
    mockGetMajor.mockResolvedValue({ major: { ...mockMajor, data_source: null, major_created_at: null, major_updated_at: null } });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ majorUuid: "sparse" }) }));
    expect(screen.getByTestId("fact-Data Source")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when major is null", async () => {
    mockGetMajor.mockResolvedValue({ major: null });
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ majorUuid: "nonexistent" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when majorUuid is empty", async () => {
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ majorUuid: "" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
