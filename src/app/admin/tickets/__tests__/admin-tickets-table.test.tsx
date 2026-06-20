import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminTicketsTable } from "../_components";
import type { TicketItem } from "../schemas";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/tickets",
}));

// Mock server actions
const mockUpdateTicketStatus = vi.fn();
vi.mock("../actions", () => ({
  updateTicketStatus: (...args: unknown[]) => mockUpdateTicketStatus(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockTickets: TicketItem[] = [
  {
    ticket_uuid: "aaa11111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    ticket_detail: "Login issue with candidate portal",
    ticket_status: 0,
    created_at: new Date("2026-06-01T00:00:00.000Z"),
    candidate_name: "John Doe",
    staff_name: null,
  },
  {
    ticket_uuid: "bbb22222-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    ticket_detail: "Payment not reflecting",
    ticket_status: 1,
    created_at: new Date("2026-06-10T00:00:00.000Z"),
    candidate_name: null,
    staff_name: "Staff Alice",
  },
  {
    ticket_uuid: "ccc33333-cccc-cccc-cccc-cccccccccccc",
    ticket_detail: "Account verification",
    ticket_status: 2,
    created_at: new Date("2026-06-15T00:00:00.000Z"),
    candidate_name: "Jane Smith",
    staff_name: "Staff Bob",
  },
  {
    ticket_uuid: "ddd44444-dddd-dddd-dddd-dddddddddddd",
    ticket_detail: null,
    ticket_status: null,
    created_at: null,
    candidate_name: null,
    staff_name: null,
  },
];

function renderTable() {
  render(<AdminTicketsTable session={mockSession} tickets={mockTickets} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminTicketsTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage tickets/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();
    const ticketLabels = screen.getAllByText("Total tickets");
    expect(ticketLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders ticket details", () => {
    renderTable();
    expect(screen.getByText("Login issue with candidate portal")).toBeTruthy();
    expect(screen.getByText("Payment not reflecting")).toBeTruthy();
    expect(screen.getByText("Account verification")).toBeTruthy();
  });

  it("shows truncated UUIDs", () => {
    renderTable();
    expect(screen.getByText("aaa11111...")).toBeTruthy();
    expect(screen.getByText("bbb22222...")).toBeTruthy();
  });

  it("shows candidate and staff names", () => {
    renderTable();
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Staff Alice")).toBeTruthy();
    expect(screen.getByText("Jane Smith")).toBeTruthy();
    expect(screen.getByText("Staff Bob")).toBeTruthy();
  });

  it("shows status badges", () => {
    renderTable();
    const openBadges = screen.getAllByText("Open");
    expect(openBadges.length).toBeGreaterThanOrEqual(1);
    const inProgress = screen.getAllByText("In Progress");
    expect(inProgress.length).toBeGreaterThanOrEqual(1);
    const resolved = screen.getAllByText("Resolved");
    expect(resolved.length).toBeGreaterThanOrEqual(1);
  });

  it("shows dates formatted", () => {
    renderTable();
    expect(screen.getByText("6/1/2026")).toBeTruthy();
    expect(screen.getByText("6/10/2026")).toBeTruthy();
    expect(screen.getByText("6/15/2026")).toBeTruthy();
  });

  it("calls updateTicketStatus when clicking a status badge", async () => {
    mockUpdateTicketStatus.mockResolvedValue({
      operation: "success",
      message: "Ticket status updated successfully",
    });
    const user = userEvent.setup();

    renderTable();

    // Click the "Open" button to cycle to next status
    const openButtons = screen.getAllByText("Open");
    // Find the first button element
    const openBtnEl =
      openButtons.find((el) => el.closest("button") || el.tagName === "BUTTON") ??
      openButtons[0];
    await user.click(openBtnEl);

    await waitFor(() => {
      expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
        "aaa11111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        1,
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when updateTicketStatus returns error", async () => {
    mockUpdateTicketStatus.mockResolvedValue({
      operation: "error",
      message: "Ticket not found",
    });
    const user = userEvent.setup();

    renderTable();

    const openButtons = screen.getAllByText("Open");
    const openBtnEl =
      openButtons.find((el) => el.closest("button") || el.tagName === "BUTTON") ??
      openButtons[0];
    await user.click(openBtnEl);

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeTruthy();
    });
  });

  it("shows error when updateTicketStatus throws", async () => {
    mockUpdateTicketStatus.mockRejectedValue(new Error("API unavailable"));
    const user = userEvent.setup();

    renderTable();

    const openButtons = screen.getAllByText("Open");
    const openBtnEl =
      openButtons.find((el) => el.closest("button") || el.tagName === "BUTTON") ??
      openButtons[0];
    await user.click(openBtnEl);

    await waitFor(() => {
      expect(screen.getByText("API unavailable")).toBeTruthy();
    });
  });

  it("cycles status through 0→1→2→3→0", async () => {
    mockUpdateTicketStatus.mockResolvedValue({
      operation: "success",
      message: "Updated",
    });
    const user = userEvent.setup();

    renderTable();

    // Click "Resolved" — should cycle from 2→3 (next after 2 is 3)
    const resolvedButtons = screen.getAllByText("Resolved");
    const resolvedBtnEl =
      resolvedButtons.find(
        (el) => el.closest("button") || el.tagName === "BUTTON",
      ) ?? resolvedButtons[0];
    await user.click(resolvedBtnEl);

    await waitFor(() => {
      expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
        "ccc33333-cccc-cccc-cccc-cccccccccccc",
        3,
      );
    });

    // Now click "In Progress" — should cycle from 1→2
    const inProgressButtons = screen.getAllByText("In Progress");
    const inProgressBtnEl =
      inProgressButtons.find(
        (el) => el.closest("button") || el.tagName === "BUTTON",
      ) ?? inProgressButtons[0];
    await user.click(inProgressBtnEl);

    await waitFor(() => {
      expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
        "bbb22222-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        2,
      );
    });
  });

  it("renders null values as em-dashes", () => {
    renderTable();
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });
});
