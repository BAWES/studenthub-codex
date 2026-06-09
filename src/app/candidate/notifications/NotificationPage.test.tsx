// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mock next/navigation ───────────────────────────────────────
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// ── Mock next/link ─────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ── Mock session auth ──────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    id: "1",
    role: "candidate",
    capabilities: ["candidate.read.own"],
  }),
}));

// ── Mock server actions ─────────────────────────────────────────
// The page imports from "./actions" after the migration.
vi.mock("./actions", async () => {
  const actual = await vi.importActual<typeof import("./actions")>("./actions");
  return {
    ...actual,
    getCandidateNotificationRows: vi.fn().mockResolvedValue([
      {
        id: "notif_mock-green-001",
        type: "Invitation",
        typeCode: 0,
        message: "You have a new job invitation",
        isNew: "Unread",
        created: "2025-06-01",
      },
      {
        id: "notif_mock-green-002",
        type: "Transfer Initiated",
        typeCode: 5,
        message: "Your transfer has been initiated",
        isNew: "Read",
        created: "2025-05-28",
      },
    ]),
  };
});

// ── Mock WorkspaceShell ────────────────────────────────────────
vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
  }) => (
    <div data-testid="workspace-shell">
      <span data-testid="eyebrow">{eyebrow}</span>
      <span data-testid="title">{title}</span>
      {children}
    </div>
  ),
}));

// ── Mock DataTable ─────────────────────────────────────────────
vi.mock("@/modules/workspace/DataTable", () => ({
  DataTable: ({
    title,
    rows,
    columns,
  }: {
    title: string;
    rows: { id: string; type: string; message: string }[];
    columns: { key: string; label: string }[];
  }) => (
    <div data-testid="data-table">
      <h2 data-testid="table-title">{title}</h2>
      <ul data-testid="table-columns">
        {columns.map((col: { key: string; label: string }) => (
          <li key={col.key} data-testid={`col-${col.key}`}>
            {col.label}
          </li>
        ))}
      </ul>
      <ul data-testid="table-rows">
        {rows.map((row) => (
          <li key={row.id} data-testid={`row-${row.id}`}>
            {row.type} &mdash; {row.message}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

// ── Mock StatusBadge ──────────────────────────────────────────
vi.mock("@/modules/workspace/StatusBadge", () => ({
  StatusBadge: ({ label }: { label: string }) => (
    <span data-testid={`status-${label}`}>{label}</span>
  ),
}));

describe("CandidateNotificationsPage", () => {
  it("renders with server action data", async () => {
    const { default: CandidateNotificationsPage } = await import("./page");
    const { container } = render(await CandidateNotificationsPage());

    // Page shell renders with correct nav context
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate");
    expect(screen.getByTestId("title")).toHaveTextContent("Notifications");

    // DataTable renders with notification rows from server action
    const rows = container.querySelectorAll("[data-testid^='row-']");
    expect(rows.length).toBeGreaterThan(0);
    const rowText = rows[0]?.textContent ?? "";
    expect(rowText).toContain("Invitation");
  });
});
