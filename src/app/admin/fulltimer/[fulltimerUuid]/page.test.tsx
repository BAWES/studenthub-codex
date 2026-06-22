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

const mockFulltimer = {
  fulltimer_uuid: "ft-456",
  fulltimer_name: "Jane Smith",
  fulltimer_email: "jane@example.com",
  fulltimer_phone: "+965 5555 5678",
  fulltimer_employed: true,
  fulltimer_gender: true,
  fulltimer_birth_date: "1995-03-15T00:00:00.000Z",
  fulltimer_driving_license: true,
  nationality_id: 1,
  country_id: 2,
  university_id: 3,
  fulltimer_area_uuid: null,
  fulltimer_current_salary: "1500",
  fulltimer_expected_salary: "2000",
  fulltimer_pdf_cv: null,
  currency_code: "KWD",
  fulltimer_created_datetime: "2026-01-15T10:00:00.000Z",
  fulltimer_updated_datetime: "2026-06-01T12:00:00.000Z",
};

const mockGetFulltimer = vi.fn();
vi.mock("./actions", () => ({ getFulltimer: (...args: unknown[]) => mockGetFulltimer(...args) }));

describe("AdminFulltimerDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders fulltimer detail with all fields", async () => {
    mockGetFulltimer.mockResolvedValue(mockFulltimer);
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ fulltimerUuid: "ft-456" }) }));
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Fulltimers");
    expect(screen.getByTestId("title")).toHaveTextContent("Jane Smith");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Jane Smith");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("jane@example.com");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("+965 5555 5678");
    expect(screen.getByTestId("fact-Employed")).toHaveTextContent("Yes");
    expect(screen.getByTestId("fact-Current Salary")).toHaveTextContent("1500");
    expect(screen.getByTestId("fact-Expected Salary")).toHaveTextContent("2000");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-01-15");
  });

  it("renders null fields as em-dash", async () => {
    mockGetFulltimer.mockResolvedValue({
      ...mockFulltimer, fulltimer_phone: null, fulltimer_employed: null, fulltimer_current_salary: null, fulltimer_created_datetime: null, fulltimer_updated_datetime: null,
    });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ fulltimerUuid: "sparse" }) }));
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Employed")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Current Salary")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when fulltimer is null", async () => {
    mockGetFulltimer.mockResolvedValue(null);
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ fulltimerUuid: "nonexistent" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when fulltimerUuid is empty", async () => {
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ fulltimerUuid: "" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
