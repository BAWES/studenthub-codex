import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
  }),
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

vi.mock("@/modules/candidates/InvitationRespondForm", () => ({
  InvitationRespondForm: ({ invitationUuid }: { invitationUuid: string }) => (
    <div data-testid="invitation-respond-form" data-uuid={invitationUuid} />
  ),
}));

const mockGetCandidateInvitationDetail = vi.fn();

vi.mock("../actions", () => ({
  getCandidateInvitationDetail: (...args: unknown[]) =>
    mockGetCandidateInvitationDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockInvitationData = {
  invitation: {
    invitation_uuid: "inv-abc-123",
    invitation_status: 1,
    invitation_app_seen_at: null,
    invitation_email_seen_at: null,
    invitation_seen_via: null,
    invitation_created_at: new Date("2025-01-10"),
    invitation_updated_at: new Date("2025-02-15"),
    request: {
      request_uuid: "req-xyz-789",
      request_position_title: "Software Engineer Intern",
      request_job_description: "Build cool stuff",
      request_compensation: "500 KWD/month",
      request_location: "Kuwait City",
      request_number_of_employees: 3,
      request_status: "active",
      company_name: "Tech Corp Kuwait",
      company_email: "hr@techcorp.kw",
      staff_name: "Ahmed Al-Sabah",
      staff_email: "ahmed@techcorp.kw",
    },
    story_uuid: null,
    story_status: null,
    story_last_updated_at: null,
  },
  metrics: [
    { label: "Status", value: "Pending", note: "Awaiting response" },
    { label: "Created", value: "2025-01-10", note: "" },
    { label: "Updated", value: "2025-02-15", note: "" },
  ],
  notes: [
    {
      id: "note-1",
      title: "Follow-up call",
      subtitle: "Call scheduled",
      meta: "2025-02-20",
    },
  ],
};

describe("CandidateInvitationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders invitation detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue(mockInvitationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-abc-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Invitation");
    expect(screen.getByTestId("title")).toHaveTextContent("Software Engineer Intern");
  });

  it("renders metrics correctly", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue(mockInvitationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-abc-123" }) }));

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("metric-Created")).toHaveTextContent("2025-01-10");
    expect(screen.getByTestId("metric-Updated")).toHaveTextContent("2025-02-15");
  });

  it("renders DetailSection with invitation brief facts", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue(mockInvitationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-abc-123" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Invitation Brief");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp Kuwait");
    expect(screen.getByTestId("fact-Compensation")).toHaveTextContent("500 KWD/month");
    expect(screen.getByTestId("fact-Location")).toHaveTextContent("Kuwait City");
    expect(screen.getByTestId("fact-Seats")).toHaveTextContent("3");
    expect(screen.getByTestId("fact-Staff Owner")).toHaveTextContent("Ahmed Al-Sabah");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-02-15");
  });

  it("renders InvitationRespondForm with correct uuid", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue(mockInvitationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-abc-123" }) }));

    expect(screen.getByTestId("invitation-respond-form")).toBeDefined();
    expect(screen.getByTestId("invitation-respond-form")).toHaveAttribute(
      "data-uuid",
      "inv-abc-123"
    );
  });

  it("shows 'Invitation' fallback title when position title is null", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue({
      ...mockInvitationData,
      invitation: {
        ...mockInvitationData.invitation,
        request: { ...mockInvitationData.invitation.request, request_position_title: null },
      },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-456" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent("Invitation");
  });

  it("shows 'Status 0' when invitation_status is null", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue({
      ...mockInvitationData,
      invitation: {
        ...mockInvitationData.invitation,
        invitation_status: null,
      },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-789" }) }));

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Status 0");
  });

  it("shows 'N/A' when invitation dates are null", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue({
      ...mockInvitationData,
      invitation: {
        ...mockInvitationData.invitation,
        invitation_created_at: null,
        invitation_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "inv-000" }) }));

    expect(screen.getByTestId("fact-Created")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("N/A");
  });

  it("calls notFound when getCandidateInvitationDetail returns null invitation", async () => {
    mockGetCandidateInvitationDetail.mockResolvedValue({
      invitation: null,
      metrics: [],
      notes: [],
    });

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
