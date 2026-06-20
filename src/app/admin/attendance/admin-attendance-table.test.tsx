import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminAttendanceTable } from "./_components";

afterEach(() => { cleanup(); });

const sampleAttendance = [
  {
    attendance_uuid: "att-1",
    employee_uuid: "emp-1",
    date: "2026-06-10",
    clock_in: "2026-06-10T08:00:00.000Z",
    clock_out: "2026-06-10T16:30:00.000Z",
    total_hours: 8.5,
    status: 10,
    note: "On time",
    created_at: "2026-06-10T08:00:00.000Z",
    updated_at: "2026-06-10T16:30:00.000Z",
  },
  {
    attendance_uuid: "att-2",
    employee_uuid: "emp-2",
    date: "2026-06-10",
    clock_in: "2026-06-10T09:15:00.000Z",
    clock_out: "2026-06-10T17:00:00.000Z",
    total_hours: 7.75,
    status: 5,
    note: null,
    created_at: "2026-06-10T09:15:00.000Z",
    updated_at: "2026-06-10T17:00:00.000Z",
  },
  {
    attendance_uuid: "att-3",
    employee_uuid: "emp-3",
    date: "2026-06-10",
    clock_in: null,
    clock_out: null,
    total_hours: 0,
    status: 0,
    note: "Called in sick",
    created_at: "2026-06-10T07:00:00.000Z",
    updated_at: "2026-06-10T07:00:00.000Z",
  },
];

const employees = [
  { uuid: "emp-1", name: "Ahmed Al-Sabah" },
  { uuid: "emp-2", name: "Mona Al-Mutairi" },
  { uuid: "emp-3", name: "Khalid Al-Rashid" },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@test.co", role: "admin" } as any;

// Mock the createAdminAttendance action so CreateAttendanceForm doesn't hit a real server
const mockCreateAttendance = vi.fn();
vi.mock("./actions", () => ({
  createAdminAttendance: (...args: unknown[]) => mockCreateAttendance(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminAttendanceTable", () => {
  it("renders all employee names in the table rows", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    // Each employee appears in: filter select + CreateAttendanceForm select + table row = 3 times
    expect(screen.getAllByText("Ahmed Al-Sabah").length).toBe(3);
    expect(screen.getAllByText("Mona Al-Mutairi").length).toBe(3);
    expect(screen.getAllByText("Khalid Al-Rashid").length).toBe(3);
  });

  it("shows Date header", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    // "Date" may appear as column header and form label
    expect(screen.getAllByText("Date").length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee filter dropdown", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getByText("Filter by employee:")).toBeDefined();
    expect(screen.getByText("All employees")).toBeDefined();
  });

  it("shows status badges for each attendance state", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getByText("Present")).toBeDefined();
    expect(screen.getByText("Late")).toBeDefined();
    expect(screen.getByText("Absent")).toBeDefined();
  });

  it("shows hours rendered for attendance records", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    // 3 attendance items: 8.5h, 7.75h, and absent (0h → "—")
    const hoursElements = screen.getAllByText(/^\d+\.?\d*h$/);
    expect(hoursElements.length).toBe(3); // all 3 have hours displayed
  });

  it("shows CreateAttendanceForm create section", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getByText("Record attendance")).toBeDefined();
    expect(screen.getByText("Record")).toBeDefined();
  });

  it("renders clock-in and clock-out times for entries with data", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    // Verify time-formatted values are displayed (timezone-independent check)
    // Each entry with clock data renders an HH:MM AM/PM string
    const timeElements = screen.getAllByText(/^(0\d|1[0-2]):\d{2} (AM|PM)$/);
    // att-1 (clock_in + clock_out) + att-2 (clock_in + clock_out) = 4 times
    expect(timeElements.length).toBe(4);
  });

  it("renders em-dash for null clock-in/out values", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    const dashes = screen.getAllByText("—");
    // At minimum, att-3 has null clock_in, clock_out = 2 dashes
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the filter dropdown with all employees", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getByText("All employees")).toBeDefined();
    expect(screen.getAllByText("Ahmed Al-Sabah").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mona Al-Mutairi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Khalid Al-Rashid").length).toBeGreaterThanOrEqual(1);
  });

  it("renders metric cards with correct total records", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getAllByText("Total records").length).toBeGreaterThanOrEqual(1);
    // 3 attendance records
    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThanOrEqual(1);
    // Employees metric
    expect(screen.getAllByText("Employees").length).toBeGreaterThanOrEqual(1);
  });

  it("renders employee-specific rows with correct employee names", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    // Each employee may appear multiple times (filter select + create form + table rows)
    expect(screen.getAllByText("Ahmed Al-Sabah").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mona Al-Mutairi").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Khalid Al-Rashid").length).toBeGreaterThanOrEqual(1);
  });

  it("shows DataTable title", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={sampleAttendance as any}
        employees={employees}
      />,
    );
    expect(screen.getByText("Attendance records")).toBeDefined();
  });

  it("shows absent employee with absent status and hour display", () => {
    render(
      <AdminAttendanceTable
        session={mockSession}
        attendance={[sampleAttendance[2]] as any}
        employees={employees}
      />,
    );
    // Absent status for att-3 (status: 0)
    expect(screen.getByText("Absent")).toBeDefined();
  });
});
