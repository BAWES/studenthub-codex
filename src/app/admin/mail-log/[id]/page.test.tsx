import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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

const mockRecord: MailLogListItem = {
  mail_uuid: "mail_abc123",
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Welcome to StudentHub",
  app: "admin",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-03-15T14:30:00.000Z",
};

const mockGetMailLog = vi.fn();

vi.mock("./actions", () => ({
  getMailLog: (...args: unknown[]) => mockGetMailLog(...args),
}));

import type { MailLogListItem } from "@/modules/mail-logs/schemas";

describe("AdminMailLogDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders mail log detail with all fields", async () => {
    mockGetMailLog.mockResolvedValue(mockRecord);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "mail_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent(
      "Admin / Mail Log",
    );
    expect(screen.getByTestId("title")).toHaveTextContent(
      "Mail: Welcome to StudentHub",
    );

    // Check detail fields
    expect(screen.getByTestId("fact-Mail UUID")).toHaveTextContent(
      "mail_abc123",
    );
    expect(screen.getByTestId("fact-From")).toHaveTextContent(
      "sender@example.com",
    );
    expect(screen.getByTestId("fact-To")).toHaveTextContent(
      "recipient@example.com",
    );
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent(
      "Welcome to StudentHub",
    );
    expect(screen.getByTestId("fact-App")).toHaveTextContent("admin");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-15");
  });

  it("renders null and missing fields as em-dash", async () => {
    mockGetMailLog.mockResolvedValue({
      ...mockRecord,
      from: null,
      to: null,
      subject: null,
      app: null,
      created_at: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "mail_null123" }),
      }),
    );

    expect(screen.getByTestId("fact-From")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-To")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Subject")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-App")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("uses (no subject) in title when subject is null", async () => {
    mockGetMailLog.mockResolvedValue({
      ...mockRecord,
      subject: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "mail_nosub" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent(
      "Mail: (no subject)",
    );
  });

  it("calls notFound when record is null", async () => {
    mockGetMailLog.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
