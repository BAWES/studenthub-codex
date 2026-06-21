import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "42" }, role: "candidate" }),
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
          {typeof f.value === "string" ? f.value : "node"}
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

// Mock the MarkReadButton client component
vi.mock("./MarkReadButton", () => ({
  MarkReadButton: ({ notificationUuid }: { notificationUuid: string }) => (
    <button data-testid="mark-read-button" data-uuid={notificationUuid}>
      Mark as Read
    </button>
  ),
}));

// Mock the parent-level actions (where getCandidateNotificationDetail is imported from)
const mockGetCandidateNotificationDetail = vi.fn();

vi.mock("../actions", () => ({
  getCandidateNotificationDetail: (...args: unknown[]) =>
    mockGetCandidateNotificationDetail(...args),
}));

const newNotification = {
  notification: {
    cn_uuid: "notif-uuid-123",
    type: 1,
    message: "You have a new interview invitation",
    is_new: true,
    created_at: new Date("2024-06-15T10:00:00Z"),
    updated_at: new Date("2024-06-15T10:00:00Z"),
    invitation_uuid: "inv-uuid-abc",
    request_uuid: null,
    company_id: 1,
    store_id: null,
    staff_id: null,
  },
  typeLabel: "Interview",
};

const readNotification = {
  notification: {
    cn_uuid: "notif-uuid-456",
    type: 2,
    message: "Your profile was viewed by a company",
    is_new: false,
    created_at: new Date("2024-06-14T08:00:00Z"),
    updated_at: new Date("2024-06-14T09:00:00Z"),
    invitation_uuid: null,
    request_uuid: null,
    company_id: 2,
    store_id: null,
    staff_id: null,
  },
  typeLabel: "Profile View",
};

describe("CandidateNotificationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a new (unread) notification with Mark as Read button", async () => {
    mockGetCandidateNotificationDetail.mockResolvedValue(newNotification);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "notif-uuid-123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Notification");
    expect(screen.getByTestId("title")).toHaveTextContent("Interview");

    // Detail fields
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("Interview");
    expect(screen.getByTestId("fact-Message")).toHaveTextContent("You have a new interview invitation");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Unread");

    // Invitation UUID displayed for invitation-linked notifications
    expect(screen.getByTestId("fact-Invitation UUID")).toBeInTheDocument();

    // Mark as Read button visible for unread notifications
    expect(screen.getByTestId("mark-read-button")).toBeInTheDocument();
    expect(screen.getByTestId("mark-read-button")).toHaveAttribute("data-uuid", "notif-uuid-123");
  });

  it("renders a read notification without Mark as Read button", async () => {
    mockGetCandidateNotificationDetail.mockResolvedValue(readNotification);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "notif-uuid-456" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Read");

    // No Mark as Read button for already-read notifications
    expect(screen.queryByTestId("mark-read-button")).not.toBeInTheDocument();
  });

  it("calls notFound when notification is null", async () => {
    mockGetCandidateNotificationDetail.mockResolvedValue({ notification: null, typeLabel: "" });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "unknown" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
