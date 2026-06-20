// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminReportsPageClient } from "../_components";

// Mock server actions
const mockGenerateReport = vi.fn();
vi.mock("../actions", () => ({
  generateReport: (...args: unknown[]) => mockGenerateReport(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockReportTypes = [
  {
    type: "recruiter-daily",
    label: "Recruiter Daily Report",
    description: "Daily activity breakdown per recruiter — assigned candidates, requests, notes, stories, and invitations.",
  },
  {
    type: "invitation-summary",
    label: "Invitation Summary",
    description: "Summary of invitation statuses across all recruiters.",
  },
];

function renderPage() {
  render(
    <AdminReportsPageClient session={mockSession} reportTypes={mockReportTypes} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminReportsPageClient", () => {
  it("renders the page heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", {
        name: /reports/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric card with correct value", () => {
    renderPage();
    const availableLabels = screen.getAllByText("Available reports");
    expect(availableLabels.length).toBeGreaterThanOrEqual(1);

    const allTwos = screen.getAllByText("2");
    expect(allTwos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders report type cards with labels and descriptions", () => {
    renderPage();
    expect(screen.getByText("Recruiter Daily Report")).toBeTruthy();
    expect(screen.getByText("Invitation Summary")).toBeTruthy();
    expect(
      screen.getByText(/Daily activity breakdown per recruiter/),
    ).toBeTruthy();
    expect(
      screen.getByText(/Summary of invitation statuses/),
    ).toBeTruthy();
  });

  it("renders generate buttons for each report type", () => {
    renderPage();
    const generateButtons = screen.getAllByText("Generate Report");
    expect(generateButtons.length).toBe(2);
  });

  it("calls generateReport when clicking generate button", async () => {
    mockGenerateReport.mockResolvedValue({
      operation: "success",
      data: { data: { date: "2026-06-12", reports: [], total: 0 } },
    });
    const user = userEvent.setup();

    renderPage();
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[0]);

    await waitFor(() => {
      expect(mockGenerateReport).toHaveBeenCalledWith({ type: "recruiter-daily" });
    });
  });

  it("shows error message when generateReport fails", async () => {
    mockGenerateReport.mockResolvedValue({
      operation: "error",
      message: "Failed to generate report. Try again.",
    });
    const user = userEvent.setup();

    renderPage();
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to generate report. Try again."),
      ).toBeTruthy();
    });
  });

  it("shows error when generateReport throws", async () => {
    mockGenerateReport.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();

    renderPage();
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });

  it("shows recruiter-daily results with table", async () => {
    mockGenerateReport.mockResolvedValue({
      operation: "success",
      data: {
        data: {
          date: "2026-06-12",
          reports: [
            {
              staffName: "Staff Alice",
              staffEmail: "alice@studenthub.co",
              totalAssigned: 10,
              totalRequests: 5,
              totalNotes: 3,
              totalStories: 2,
              totalInvitations: 8,
              totalAcceptedInvitations: 4,
              totalRejectedInvitations: 1,
            },
          ],
          total: 1,
        },
      },
    });
    const user = userEvent.setup();

    renderPage();

    // Click generate on recruiter-daily card
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Report Results")).toBeTruthy();
      expect(screen.getByText("Staff Alice")).toBeTruthy();
      expect(screen.getByText("alice@studenthub.co")).toBeTruthy();
      expect(screen.getByText("Total staff: 1")).toBeTruthy();
    });
  });

  it("shows invitation-summary results with table", async () => {
    mockGenerateReport.mockResolvedValue({
      operation: "success",
      data: {
        data: {
          date: "2026-06-12",
          summary: [
            { status: 1, count: 15 },
            { status: 2, count: 3 },
          ],
        },
      },
    });
    const user = userEvent.setup();

    renderPage();

    // Click generate on invitation-summary card
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[1]);

    await waitFor(() => {
      expect(screen.getByText("Report Results")).toBeTruthy();
      expect(screen.getByText("Accepted")).toBeTruthy();
      expect(screen.getByText("Rejected")).toBeTruthy();
    });
  });

  it("shows generating state on the clicked button", async () => {
    // Keep the promise pending so we see "Generating..." text
    mockGenerateReport.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    renderPage();
    const generateButtons = screen.getAllByText("Generate Report");
    await user.click(generateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Generating...")).toBeTruthy();
    });
  });

  it("shows unknown report kind message for unhandled types", async () => {
    mockGenerateReport.mockResolvedValue({
      operation: "success",
      data: {
        data: { someKey: "someValue" },
      },
    });
    const user = userEvent.setup();

    // Render with a single unknown type to isolate button click
    cleanup();
    const reportTypesUnknown = [
      {
        type: "custom-export",
        label: "Custom Export",
        description: "Export raw data.",
      },
    ];

    render(
      <AdminReportsPageClient session={mockSession} reportTypes={reportTypesUnknown} />,
    );
    const buttons = screen.getAllByRole("button", { name: /generate report/i });
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText("Report Results")).toBeTruthy();
      expect(
        screen.getByText(/Report generated. Raw data available/),
      ).toBeTruthy();
    });
  });
});
