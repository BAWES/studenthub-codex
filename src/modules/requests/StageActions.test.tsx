// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mock server actions (must use vi.hoisted to avoid hoisting issues) ──
const mockTransitionApp = vi.hoisted(() => vi.fn());
vi.mock("@/modules/requests/application-actions", () => ({
  transitionApplicationAction: mockTransitionApp,
}));

const mockUpdateInterview = vi.hoisted(() => vi.fn());
vi.mock("@/modules/requests/interview-actions", () => ({
  updateInterviewAction: mockUpdateInterview,
}));

const mockUpdateInvitation = vi.hoisted(() => vi.fn());
vi.mock("@/modules/requests/invitation-actions", () => ({
  updateInvitationStatusAction: mockUpdateInvitation,
}));

const mockUpdateStory = vi.hoisted(() => vi.fn());
vi.mock("@/modules/requests/story-actions", () => ({
  updateStoryStatusAction: mockUpdateStory,
}));

// ── Mock lucide-react icons ──────────────────────
vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="icon-check" />,
  MessageSquare: () => <span data-testid="icon-message" />,
  ThumbsDown: () => <span data-testid="icon-thumbs-down" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── Mock UI components ───────────────────────────
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// ── Import after mocks ───────────────────────────
import {
  ApplicationStatusActions,
  InterviewStatusActions,
  InvitationStatusActions,
  StoryStatusActions,
} from "./StageActions";

afterEach(() => {
  cleanup();
});

// ── ApplicationStatusActions ─────────────────────
describe("ApplicationStatusActions", () => {
  const baseProps = { applicationUuid: "app-1", requestUuid: "req-1" };

  it("renders Shortlist and Reject buttons when status is null", () => {
    render(<ApplicationStatusActions {...baseProps} />);
    expect(screen.getByRole("button", { name: /shortlist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });

  it("renders buttons when status is intermediate (1)", () => {
    render(<ApplicationStatusActions {...baseProps} currentStatus={1} />);
    expect(screen.getByRole("button", { name: /shortlist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });

  it("renders nothing when final status is 2 (shortlisted)", () => {
    const { container } = render(
      <ApplicationStatusActions {...baseProps} currentStatus={2} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when final status is 4 (hired)", () => {
    const { container } = render(
      <ApplicationStatusActions {...baseProps} currentStatus={4} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows note textarea when note toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<ApplicationStatusActions {...baseProps} />);

    const noteBtn = screen.getByRole("button", { name: /add note/i });
    await user.click(noteBtn);

    expect(screen.getByPlaceholderText("Shortlist note")).toBeInTheDocument();
  });
});

// ── InterviewStatusActions ──────────────────────
describe("InterviewStatusActions", () => {
  const baseProps = { interviewUuid: "int-1", requestUuid: "req-1" };

  it("renders Complete, Add note, and Cancel when status is null", () => {
    render(<InterviewStatusActions {...baseProps} />);
    expect(screen.getByRole("button", { name: /complete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add note/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides Complete button when status is 2 (completed)", () => {
    render(<InterviewStatusActions {...baseProps} currentStatus={2} />);
    expect(screen.queryByRole("button", { name: /complete/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides Cancel button when status is 3 (cancelled)", () => {
    render(<InterviewStatusActions {...baseProps} currentStatus={3} />);
    expect(screen.getByRole("button", { name: /complete/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("shows note textarea when note toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<InterviewStatusActions {...baseProps} />);

    const noteBtn = screen.getByRole("button", { name: /add note/i });
    await user.click(noteBtn);

    expect(screen.getByPlaceholderText("Interview outcome")).toBeInTheDocument();

    // Also renders close note label after click
    expect(screen.getByRole("button", { name: /close note/i })).toBeInTheDocument();
  });
});

// ── InvitationStatusActions ─────────────────────
describe("InvitationStatusActions", () => {
  const baseProps = { invitationUuid: "inv-1", requestUuid: "req-1" };

  it("renders Responded and Declined when status is null", () => {
    render(<InvitationStatusActions {...baseProps} />);
    expect(screen.getByRole("button", { name: /responded/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /declined/i })).toBeInTheDocument();
  });

  it("hides Responded when status is 3", () => {
    render(<InvitationStatusActions {...baseProps} currentStatus={3} />);
    expect(screen.queryByRole("button", { name: /responded/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /declined/i })).toBeInTheDocument();
  });

  it("hides Declined when status is 5", () => {
    render(<InvitationStatusActions {...baseProps} currentStatus={5} />);
    expect(screen.getByRole("button", { name: /responded/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /declined/i })).not.toBeInTheDocument();
  });
});

// ── StoryStatusActions ──────────────────────────
describe("StoryStatusActions", () => {
  const baseProps = { storyUuid: "st-1", requestUuid: "req-1" };

  it("renders Complete and Cancel when status is null", () => {
    render(<StoryStatusActions {...baseProps} />);
    expect(screen.getByRole("button", { name: /complete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides Complete when status is 2", () => {
    render(<StoryStatusActions {...baseProps} currentStatus={2} />);
    expect(screen.queryByRole("button", { name: /complete/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides Cancel when status is 3", () => {
    render(<StoryStatusActions {...baseProps} currentStatus={3} />);
    expect(screen.getByRole("button", { name: /complete/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });
});
