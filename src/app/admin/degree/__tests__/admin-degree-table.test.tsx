import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDegreeTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/degree",
}));

// Mock server actions
const mockCreateDegree = vi.fn();
const mockUpdateDegree = vi.fn();
const mockDeleteDegree = vi.fn();
vi.mock("../actions", () => ({
  createDegree: (...args: unknown[]) => mockCreateDegree(...args),
  updateDegree: (...args: unknown[]) => mockUpdateDegree(...args),
  deleteDegree: (...args: unknown[]) => mockDeleteDegree(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockDegrees = [
  {
    degree_uuid: "d1",
    degree_group_uuid: null,
    degree_name_en: "Bachelor of Science",
    degree_name_ar: null,
    degree_sort_order: 1,
    degree_created_at: new Date("2026-01-10T00:00:00.000Z"),
    degree_updated_at: new Date("2026-06-01T00:00:00.000Z"),
  },
  {
    degree_uuid: "d2",
    degree_group_uuid: "g1",
    degree_name_en: "Bachelor of Arts",
    degree_name_ar: "بكالوريوس الآداب",
    degree_sort_order: 2,
    degree_created_at: new Date("2026-03-15T00:00:00.000Z"),
    degree_updated_at: null,
  },
  {
    degree_uuid: "d3",
    degree_group_uuid: null,
    degree_name_en: "Master of Engineering",
    degree_name_ar: null,
    degree_sort_order: null,
    degree_created_at: null,
    degree_updated_at: null,
  },
];

function renderTable() {
  render(<AdminDegreeTable session={mockSession} degrees={mockDegrees} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminDegreeTable", () => {
  it("renders the page title", () => {
    renderTable();
    expect(screen.getByText(/manage degrees/i)).toBeTruthy();
  });

  it("renders degree names", () => {
    renderTable();
    expect(screen.getByText("Bachelor of Science")).toBeTruthy();
    expect(screen.getByText("Bachelor of Arts")).toBeTruthy();
    expect(screen.getByText("Master of Engineering")).toBeTruthy();
  });

  it("renders metric card with total degree count", () => {
    renderTable();
    expect(screen.getByText("Total degrees")).toBeTruthy();
    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Arabic names when available", () => {
    renderTable();
    expect(screen.getByText("بكالوريوس الآداب")).toBeTruthy();
  });

  it("renders em-dash for null Arabic names", () => {
    renderTable();
    // At least 2 em-dashes for the two null Arabic names
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the create degree form with input and add button", () => {
    renderTable();
    const addInput = screen.getByPlaceholderText("e.g. Bachelor of Science");
    expect(addInput).toBeTruthy();
    const addButtons = screen.getAllByText("Add");
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls createDegree on form submit", async () => {
    mockCreateDegree.mockResolvedValue({ operation: "success", message: "Degree created" });
    const user = userEvent.setup();

    renderTable();

    const input = screen.getByPlaceholderText("e.g. Bachelor of Science");
    await user.type(input, "PhD in CS");

    const addButtons = screen.getAllByText("Add");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockCreateDegree).toHaveBeenCalledWith("PhD in CS", "", "", "");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createDegree fails", async () => {
    mockCreateDegree.mockResolvedValue({ operation: "error", message: "Degree already exists" });
    const user = userEvent.setup();

    renderTable();

    const input = screen.getByPlaceholderText("e.g. Bachelor of Science");
    await user.type(input, "dupe");

    const addButtons = screen.getAllByText("Add");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Degree already exists")).toBeTruthy();
    });
  });

  it("opens inline edit form when clicking a degree name", async () => {
    renderTable();

    const bscLink = screen.getByText("Bachelor of Science");
    await userEvent.click(bscLink);

    // Edit form should show Save + Cancel
    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    // Input should show existing value
    expect(screen.getByDisplayValue("Bachelor of Science")).toBeTruthy();
  });

  it("calls updateDegree on edit form submit", async () => {
    mockUpdateDegree.mockResolvedValue({ operation: "success", message: "Updated" });
    const user = userEvent.setup();

    renderTable();

    // Click degree name to open edit
    const bscLink = screen.getByText("Bachelor of Science");
    await user.click(bscLink);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("Bachelor of Science");
    await user.clear(nameInput);
    await user.type(nameInput, "BSc (Hons)");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateDegree).toHaveBeenCalledWith("d1", "BSc (Hons)", undefined, undefined, undefined);
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteDegree with confirmation", async () => {
    mockDeleteDegree.mockResolvedValue({ operation: "success", message: "Deleted" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteDegree).toHaveBeenCalledWith("d1");
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

    expect(mockDeleteDegree).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows error toast when deleteDegree fails", async () => {
    mockDeleteDegree.mockResolvedValue({ operation: "error", message: "Cannot delete degree" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockReturnValue(undefined);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Cannot delete degree");
    });
    expect(mockRefresh).toHaveBeenCalled();
    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
