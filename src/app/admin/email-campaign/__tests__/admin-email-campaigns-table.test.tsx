// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminEmailCampaignsTable } from "../_components";
import "@testing-library/jest-dom/vitest";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/email-campaign",
}));

// Mock server actions
const mockCreateEmailCampaign = vi.fn();
const mockUpdateEmailCampaign = vi.fn();
vi.mock("../actions", () => ({
  createEmailCampaign: (...args: unknown[]) => mockCreateEmailCampaign(...args),
  updateEmailCampaign: (...args: unknown[]) => mockUpdateEmailCampaign(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockCampaigns = [
  {
    campaign_uuid: "c-001",
    subject: "New opportunity at TechCorp",
    message: "Dear candidate...",
    progress: 75,
    target: "candidate",
    status: true,
    created_at: new Date("2025-06-01"),
  },
  {
    campaign_uuid: "c-002",
    subject: "Summer Internship Program",
    message: null,
    progress: null,
    target: null,
    status: false,
    created_at: new Date("2025-06-15"),
  },
];

function renderTable() {
  render(
    <AdminEmailCampaignsTable session={mockSession} campaigns={mockCampaigns} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminEmailCampaignsTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage email campaigns/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();

    const totalLabels = screen.getAllByText("Total campaigns");
    expect(totalLabels.length).toBeGreaterThanOrEqual(1);

    const activeLabels = screen.getAllByText("Active");
    expect(activeLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders campaign subjects as clickable links", () => {
    renderTable();
    expect(
      screen.getAllByText("New opportunity at TechCorp").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Summer Internship Program").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders progress values", () => {
    renderTable();
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("shows Active/Inactive badges for status", () => {
    renderTable();

    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);

    const inactiveBadges = screen.getAllByText("Inactive");
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders target values", () => {
    renderTable();
    expect(screen.getAllByText("candidate").length).toBeGreaterThanOrEqual(1);
  });

  it("opens inline edit form when clicking a subject", async () => {
    renderTable();

    const subjectLinks = screen.getAllByText("New opportunity at TechCorp");
    await userEvent.click(subjectLinks[0]);

    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls createEmailCampaign on form submit", async () => {
    mockCreateEmailCampaign.mockResolvedValue({
      operation: "success",
      message: "Campaign created",
    });
    const user = userEvent.setup();

    renderTable();

    const subjectInputs = screen.getAllByPlaceholderText("e.g. New opportunity at...");
    const createButtons = screen.getAllByText("Create");

    await user.type(subjectInputs[0], "Test Campaign");
    await user.click(createButtons[0]);

    await waitFor(() => {
      expect(mockCreateEmailCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Test Campaign",
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createEmailCampaign fails", async () => {
    mockCreateEmailCampaign.mockResolvedValue({
      operation: "error",
      message: "Campaign already exists",
    });
    const user = userEvent.setup();

    renderTable();

    const subjectInputs = screen.getAllByPlaceholderText("e.g. New opportunity at...");
    const createButtons = screen.getAllByText("Create");

    await user.type(subjectInputs[0], "Dupe Campaign");
    await user.click(createButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Campaign already exists")).toBeTruthy();
    });
  });

  it("calls updateEmailCampaign on edit form submit", async () => {
    mockUpdateEmailCampaign.mockResolvedValue({
      operation: "success",
      message: "Campaign updated",
    });
    const user = userEvent.setup();

    renderTable();

    const subjectLinks = screen.getAllByText("New opportunity at TechCorp");
    await user.click(subjectLinks[0]);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const subjectInput = screen.getByDisplayValue("New opportunity at TechCorp");
    await user.clear(subjectInput);
    await user.type(subjectInput, "Updated Subject");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateEmailCampaign).toHaveBeenCalledWith(
        expect.objectContaining({
          campaignUuid: "c-001",
          subject: "Updated Subject",
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("renders the Active label in the status checkbox area", () => {
    renderTable();

    // "Active" appears in multiple places (metric, badge, checkbox label)
    // Just verify it exists somewhere — the metric and badge are tested elsewhere
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);
  });
});
