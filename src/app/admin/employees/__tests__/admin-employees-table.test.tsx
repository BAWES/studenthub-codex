// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminEmployeesTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/employees",
}));

// Mock server actions
const mockCreateEmployee = vi.fn();
const mockDeleteEmployee = vi.fn();
vi.mock("../actions", () => ({
  createAdminEmployee: (...args: unknown[]) => mockCreateEmployee(...args),
  deleteAdminEmployee: (...args: unknown[]) => mockDeleteEmployee(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockDepartments = [
  { uuid: "dept-1", name: "Engineering" },
  { uuid: "dept-2", name: "HR" },
];

const mockDesignations = [
  { uuid: "desig-1", nameEn: "Senior Developer" },
  { uuid: "desig-2", nameEn: "Recruiter" },
];

const mockEmployees = [
  {
    employee_uuid: "emp-001",
    employee_name: "Alice Johnson",
    employee_email: "alice@company.com",
    employee_phone: "+965 5000 0001",
    employee_salary: 2500,
    employee_status: 10,
    employee_role: "admin",
    employee_created_at: new Date("2026-01-15T10:00:00.000Z"),
    employee_updated_at: new Date("2026-06-01T12:00:00.000Z"),
    designation_uuid: "desig-1",
    department_uuid: "dept-1",
  },
  {
    employee_uuid: "emp-002",
    employee_name: "Bob Smith",
    employee_email: "bob@company.com",
    employee_phone: null,
    employee_salary: null,
    employee_status: 0,
    employee_role: "staff",
    employee_created_at: new Date("2026-03-20T08:00:00.000Z"),
    employee_updated_at: new Date("2026-05-10T14:00:00.000Z"),
    designation_uuid: null,
    department_uuid: null,
  },
  {
    employee_uuid: "emp-003",
    employee_name: "Charlie Brown",
    employee_email: "charlie@company.com",
    employee_phone: "+965 5000 0003",
    employee_salary: 3200,
    employee_status: 10,
    employee_role: "staff",
    employee_created_at: new Date("2026-02-10T09:00:00.000Z"),
    employee_updated_at: new Date("2026-06-05T10:00:00.000Z"),
    designation_uuid: "desig-2",
    department_uuid: "dept-2",
  },
];

function renderTable() {
  render(
    <AdminEmployeesTable
      session={mockSession}
      employees={mockEmployees}
      departments={mockDepartments}
      designations={mockDesignations}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminEmployeesTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage employees/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();

    const empLabels = screen.getAllByText("Total employees");
    expect(empLabels.length).toBeGreaterThanOrEqual(1);

    const deptLabels = screen.getAllByText("Departments");
    expect(deptLabels.length).toBeGreaterThanOrEqual(1);

    const desigLabels = screen.getAllByText("Designations");
    expect(desigLabels.length).toBeGreaterThanOrEqual(1);

    // Metric values
    const allThrees = screen.getAllByText("3");
    expect(allThrees.length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee names in the table", () => {
    renderTable();
    expect(screen.getAllByText("Alice Johnson").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob Smith").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Charlie Brown").length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee emails", () => {
    renderTable();
    expect(screen.getByText("alice@company.com")).toBeTruthy();
    expect(screen.getByText("bob@company.com")).toBeTruthy();
  });

  it("renders employee phone numbers with em-dash for null", () => {
    renderTable();
    expect(screen.getByText("+965 5000 0001")).toBeTruthy();
    // There may be multiple "—" characters (sidebar, table null values)
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders salary with KWD suffix and locale formatting", () => {
    renderTable();
    expect(screen.getByText("2,500 KWD")).toBeTruthy();
    expect(screen.getByText("3,200 KWD")).toBeTruthy();
  });

  it("shows active/inactive status badges", () => {
    renderTable();
    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);

    const inactiveBadges = screen.getAllByText("Inactive");
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the add employee form with required fields", () => {
    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("Full name");
    expect(nameInputs.length).toBeGreaterThanOrEqual(1);

    const emailInputs = screen.getAllByPlaceholderText("email@company.com");
    expect(emailInputs.length).toBeGreaterThanOrEqual(1);

    const addButtons = screen.getAllByText("Add employee");
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls deleteAdminEmployee with confirmation", async () => {
    mockDeleteEmployee.mockResolvedValue({ operation: "success", message: "" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deactivateButtons = screen.getAllByText("Deactivate");
    await user.click(deactivateButtons[0]);

    await waitFor(() => {
      expect(mockDeleteEmployee).toHaveBeenCalledWith("emp-001");
    });
    expect(mockRefresh).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("does not delete when confirm is cancelled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    renderTable();

    const deactivateButtons = screen.getAllByText("Deactivate");
    await user.click(deactivateButtons[0]);

    expect(mockDeleteEmployee).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
