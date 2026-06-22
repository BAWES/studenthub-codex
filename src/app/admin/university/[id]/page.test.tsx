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

const mockUniversity = {
  university_id: 1,
  university_name_en: "Kuwait University",
  university_name_ar: "جامعة الكويت",
  university_data_source: 1,
  university_created_at: "2024-01-01T10:00:00.000Z",
  university_updated_at: "2024-03-05T14:30:00.000Z",
  deleted: 0,
};

const mockGetUniversity = vi.fn();

vi.mock("./actions", () => ({
  getUniversity: (...args: unknown[]) => mockGetUniversity(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminUniversityDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders university detail with all fields", async () => {
    mockGetUniversity.mockResolvedValue(mockUniversity);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Universities");
    expect(screen.getByTestId("title")).toHaveTextContent("University — Kuwait University");

    expect(screen.getByTestId("metric-Name (English)")).toHaveTextContent("Kuwait University");
    expect(screen.getByTestId("metric-Name (Arabic)")).toHaveTextContent("جامعة الكويت");

    expect(screen.getByTestId("fact-ID")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Name (English)")).toHaveTextContent("Kuwait University");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("جامعة الكويت");
    expect(screen.getByTestId("fact-Data Source")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-05");

    expect(screen.getByText("Back to Universities")).toBeInTheDocument();
  });

  it("renders with nullable fields as dash", async () => {
    mockGetUniversity.mockResolvedValue({
      ...mockUniversity,
      university_name_en: null,
      university_name_ar: null,
      university_data_source: null,
      university_updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "2" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("University — Unnamed");
    expect(screen.getByTestId("metric-Name (English)")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Name (Arabic)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Name (English)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Name (Arabic)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Data Source")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when university is null", async () => {
    mockGetUniversity.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when id is NaN", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "abc" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
