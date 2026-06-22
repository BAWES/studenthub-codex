// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";
import "@testing-library/jest-dom/vitest";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
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

const mockRecord = {
  mail_uuid: "abc-123-def",
  from: "admin@studenthub.co",
  to: "user@example.com",
  subject: "Welcome to StudentHub",
  app: "admin",
  created_at: "2025-06-15T10:00:00.000Z",
  updated_at: "2025-06-15T12:00:00.000Z",
};

const mockGetMailLog = vi.fn();

vi.mock("@/modules/mail-logs/actions", () => ({
  getMailLog: (...args: unknown[]) => mockGetMailLog(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminMailLogDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders mail-log detail with all fields", async () => {
    mockGetMailLog.mockResolvedValue(mockRecord);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "abc-123-def" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Mail log");
    expect(screen.getByTestId("title")).toHaveTextContent("Welcome to StudentHub");

    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("abc-123-def");
    expect(screen.getByTestId("fact-From")).toHaveTextContent("admin@studenthub.co");
    expect(screen.getByTestId("fact-To")).toHaveTextContent("user@example.com");
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent("Welcome to StudentHub");
    expect(screen.getByTestId("fact-App")).toHaveTextContent("admin");
    expect(screen.getByTestId("fact-Sent at")).toHaveTextContent("2025-06-15");
  });

  it("renders with nullable fields as dash", async () => {
    mockGetMailLog.mockResolvedValue({
      ...mockRecord,
      from: null,
      to: null,
      subject: null,
      app: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "null-123" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("(no subject)");
    expect(screen.getByTestId("fact-From")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-To")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-App")).toHaveTextContent("—");
  });

  it("calls notFound when record is null", async () => {
    mockGetMailLog.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });

  it("has back to mail log link", async () => {
    mockGetMailLog.mockResolvedValue(mockRecord);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "abc-123-def" }),
      }),
    );

    const backLink = screen.getByRole("link", { name: /back to mail log/i });
    expect(backLink).toHaveAttribute("href", "/admin/mail-log");
  });
});
