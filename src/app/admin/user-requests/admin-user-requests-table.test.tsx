import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminUserRequestsTable } from "./_components";

afterEach(() => { cleanup(); });

const sampleRows = [
  {
    id: "sar-001",
    candidate_name: "Candidate One",
    store_name: "Main Branch",
    currency_code: "KWD",
    status: "pending",
    updated: "2026-06-13",
  },
  {
    id: "sar-002",
    candidate_name: "Candidate Two",
    store_name: null,
    currency_code: "USD",
    status: "approved",
    updated: "2026-06-12",
  },
  {
    id: "sar-003",
    candidate_name: null,
    store_name: "Secondary Branch",
    currency_code: null,
    status: "pending",
    updated: "2026-06-11",
  },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

// Mock the server actions so inline interactions don't hit a real DB
vi.mock("./actions", () => ({
  listStoreAssignmentRequests: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  getStoreAssignmentRequest: vi.fn().mockResolvedValue({ request: null }),
  updateStoreAssignmentRequestStatus: vi.fn().mockResolvedValue({ operation: "success", message: "Updated" }),
}));

describe("AdminUserRequestsTable", () => {
  it("renders the DataTable title", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Store Assignment Requests")).toBeDefined();
  });

  it("renders candidate names when present", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Candidate One")).toBeDefined();
    expect(screen.getByText("Candidate Two")).toBeDefined();
  });

  it("shows em-dash for null candidate name", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders store names when present", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Main Branch")).toBeDefined();
    expect(screen.getByText("Secondary Branch")).toBeDefined();
  });

  it("renders currency codes", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("KWD")).toBeDefined();
    expect(screen.getByText("USD")).toBeDefined();
  });

  it("renders status values", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getAllByText("pending").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("approved")).toBeDefined();
  });

  it("renders loading state without crashing", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={[]} loading={true} />);
    expect(screen.getByText("Store Assignment Requests")).toBeDefined();
  });

  it("renders empty state", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={[]} />);
    expect(screen.getByText("Store Assignment Requests")).toBeDefined();
  });

  it("shows column headers", () => {
    render(<AdminUserRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Candidate")).toBeDefined();
    expect(screen.getByText("Store")).toBeDefined();
    expect(screen.getByText("Currency")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText(/Updated/)).toBeDefined();
  });
});
