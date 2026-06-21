// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminDepartmentsTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/departments",
}));

// Mock server actions
const mockCreateDepartment = vi.fn();
const mockUpdateDepartment = vi.fn();
const mockDeleteDepartment = vi.fn();
vi.mock("../actions", () => ({
  createDepartment: (...args: unknown[]) => mockCreateDepartment(...args),
  updateDepartment: (...args: unknown[]) => mockUpdateDepartment(...args),
  deleteDepartment: (...args: unknown[]) => mockDeleteDepartment(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockDepartments = [
  {
    department_uuid: "dept-001",
    department_name_en: "Information Technology",
    department_name_ar: "تقنية المعلومات",
    employee_count: 12,
    created_at: new Date("2025-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-06-01T00:00:00.000Z"),
  },
  {
    department_uuid: "dept-002",
    department_name_en: "Human Resources",
    department_name_ar: null,
    employee_count: 5,
    created_at: new Date("2025-03-15T00:00:00.000Z"),
    updated_at: null,
  },
  {
    department_uuid: "dept-003",
    department_name_en: "Finance",
    department_name_ar: "المالية",
    employee_count: 0,
    created_at: null,
    updated_at: null,
  },
];

function renderTable() {
  render(<AdminDepartmentsTable session={mockSession} departments={mockDepartments as any} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminDepartmentsTable", () => {
  it("renders the page title", () => {
    renderTable();
    expect(
      screen.getByText(/manage departments/i),
    ).toBeTruthy();
  });

  it("renders department English names", () => {
    renderTable();
    expect(screen.getByText("Information Technology")).toBeTruthy();
    expect(screen.getByText("Human Resources")).toBeTruthy();
    expect(screen.getByText("Finance")).toBeTruthy();
  });

  it("renders department Arabic names with em-dash for null", () => {
    renderTable();
    expect(screen.getByText("تقنية المعلومات")).toBeTruthy();
    expect(screen.getByText("المالية")).toBeTruthy();
    const dashes = screen.getAllByText("—");
    // At least one dash for null Arabic name in HR row, plus null dates
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee counts", () => {
    renderTable();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("renders metric card with total department count", () => {
    renderTable();
    const labels = screen.getAllByText("Total departments");
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the add department form", () => {
    renderTable();
    expect(screen.getByText("Add department")).toBeTruthy();
    expect(screen.getByPlaceholderText(/e\.g\. Information Technology/i)).toBeTruthy();
    expect(screen.getByPlaceholderText("تقنية المعلومات")).toBeTruthy();
    expect(screen.getAllByText("Add").length).toBeGreaterThanOrEqual(1);
  });

  it("renders DataTable title", () => {
    renderTable();
    expect(screen.getByText("Departments")).toBeTruthy();
  });

  it("opens inline edit form when clicking a department name", async () => {
    renderTable();

    const itLink = screen.getByText("Information Technology");
    await userEvent.click(itLink);

    // Edit form should show Save + Cancel
    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    // Input should show existing value
    expect(screen.getByDisplayValue("Information Technology")).toBeTruthy();
  });

  it("calls updateDepartment on edit form submit", async () => {
    mockUpdateDepartment.mockResolvedValue({ operation: "success", message: "Updated" });
    const user = userEvent.setup();

    renderTable();

    // Click department name to open edit
    const itLink = screen.getByText("Information Technology");
    await user.click(itLink);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("Information Technology");
    await user.clear(nameInput);
    await user.type(nameInput, "IT Department");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateDepartment).toHaveBeenCalledWith({
        departmentUuid: "dept-001",
        departmentNameEn: "IT Department",
        departmentNameAr: "تقنية المعلومات",
      });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteDepartment with confirmation", async () => {
    mockDeleteDepartment.mockResolvedValue({ operation: "success", message: "Deleted" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteDepartment).toHaveBeenCalledWith({
        departmentUuid: "dept-001",
      });
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

    expect(mockDeleteDepartment).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows error when createDepartment fails", async () => {
    mockCreateDepartment.mockResolvedValue({ operation: "error", message: "Department name already exists" });
    const user = userEvent.setup();

    renderTable();

    const input = screen.getByPlaceholderText(/e\.g\. Information Technology/i);
    await user.type(input, "Duplicate Dept");

    const addButtons = screen.getAllByText("Add");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Department name already exists")).toBeTruthy();
    });
  });

  it("renders form inputs without inline style attributes", () => {
    renderTable();
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      expect(input.getAttribute("style")).toBeNull();
    });
  });
});
