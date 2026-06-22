// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDegreeGroupsTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/degree-group",
}));

// Mock server actions
const mockCreateDegreeGroup = vi.fn();
const mockUpdateDegreeGroup = vi.fn();
const mockDeleteDegreeGroup = vi.fn();
vi.mock("../actions", () => ({
  createDegreeGroup: (...args: unknown[]) => mockCreateDegreeGroup(...args),
  updateDegreeGroup: (...args: unknown[]) => mockUpdateDegreeGroup(...args),
  deleteDegreeGroup: (...args: unknown[]) => mockDeleteDegreeGroup(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockDegreeGroups = [
  {
    degree_group_uuid: "dg-001",
    degree_group_name_en: "Science",
    degree_group_name_ar: "علوم",
    degree_group_sort_order: 1,
    skip_major: 0,
    degree_group_created_at: new Date("2025-01-01"),
    degree_group_updated_at: null,
  },
  {
    degree_group_uuid: "dg-002",
    degree_group_name_en: "Engineering",
    degree_group_name_ar: null,
    degree_group_sort_order: 2,
    skip_major: null,
    degree_group_created_at: new Date("2025-01-02"),
    degree_group_updated_at: null,
  },
];

function renderTable() {
  render(
    <AdminDegreeGroupsTable session={mockSession} degreeGroups={mockDegreeGroups} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminDegreeGroupsTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage degree groups/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric card with total count", () => {
    renderTable();
    const metricLabels = screen.getAllByText("Total degree groups");
    expect(metricLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders degree group names as clickable links", () => {
    renderTable();
    expect(screen.getAllByText("Science").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Engineering").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Arabic names in the table", () => {
    renderTable();
    expect(screen.getByText("علوم")).toBeTruthy();
  });

  it("opens inline edit form when clicking a group name", async () => {
    renderTable();

    const groupLinks = screen.getAllByText("Science");
    await userEvent.click(groupLinks[0]);

    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByDisplayValue("Science")).toBeTruthy();
    expect(screen.getByDisplayValue("علوم")).toBeTruthy();
  });

  it("calls createDegreeGroup on form submit", async () => {
    mockCreateDegreeGroup.mockResolvedValue({
      operation: "success",
      message: "Degree group created",
    });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. Science, Arts, Engineering");
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "Medicine");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockCreateDegreeGroup).toHaveBeenCalledWith(
        "Medicine",
        undefined,
        undefined,
        0, // skipMajor defaults to "No" (0)
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createDegreeGroup fails", async () => {
    mockCreateDegreeGroup.mockResolvedValue({
      operation: "error",
      message: "Degree group already exists",
    });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. Science, Arts, Engineering");
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "Dupe Group");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Degree group already exists")).toBeTruthy();
    });
  });

  it("calls updateDegreeGroup on edit form submit", async () => {
    mockUpdateDegreeGroup.mockResolvedValue({
      operation: "success",
      message: "Degree group updated",
    });
    const user = userEvent.setup();

    renderTable();

    const groupLinks = screen.getAllByText("Science");
    await user.click(groupLinks[0]);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("Science");
    await user.clear(nameInput);
    await user.type(nameInput, "Sciences Updated");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateDegreeGroup).toHaveBeenCalledWith(
        "dg-001",
        "Sciences Updated",
        "علوم", // Arabic name stays from original row
        1, // sort order stays from original row
        0, // skipMajor stays "No" (0)
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteDegreeGroup with confirmation", async () => {
    mockDeleteDegreeGroup.mockResolvedValue({
      operation: "success",
      message: "Degree group deleted",
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteDegreeGroup).toHaveBeenCalledWith("dg-001");
    });
    expect(mockRefresh).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("does not delete when confirm is cancelled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(mockDeleteDegreeGroup).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("renders skip_major select with shadcn SelectTrigger", () => {
    renderTable();

    // shadcn Select renders the current value in the trigger — "No" is default
    const noTexts = screen.getAllByText("No");
    expect(noTexts.length).toBeGreaterThanOrEqual(1);

    // "Yes" is also visible in the skip_major display column (row: Engineering)
    const yesTexts = screen.getAllByText("Yes");
    expect(yesTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders sort order values in table cells", () => {
    renderTable();
    // Sort order shows in DataTable cells — "1" appears for sort_order
    const sortCells = screen.getAllByRole("cell");
    const sortTexts = sortCells.map((c) => c.textContent).filter(Boolean);
    expect(sortTexts.some((t) => t?.trim() === "1")).toBe(true);
    expect(sortTexts.some((t) => t?.trim() === "2")).toBe(true);
  });
});
