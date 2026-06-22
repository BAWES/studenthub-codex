import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminCandidateAccountRequestsTable } from "./_components";

afterEach(() => { cleanup(); });

const sampleRows = [
  {
    id: "cir-001",
    candidate_ids: "101, 102, 103",
    status: "pending",
    rejection_reason: null,
    created_by_name: "Staff Admin",
    updated: "2026-06-13",
  },
  {
    id: "cir-002",
    candidate_ids: "201, 202",
    status: "approved",
    rejection_reason: null,
    created_by_name: "HR Team",
    updated: "2026-06-12",
  },
  {
    id: "cir-003",
    candidate_ids: "301",
    status: "rejected",
    rejection_reason: "Incomplete documentation",
    created_by_name: "Compliance Officer",
    updated: "2026-06-11",
  },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

// Mock the server actions so inline interactions don't hit a real DB
vi.mock("./actions", () => ({
  listCandidateIdRequests: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  getCandidateIdRequest: vi.fn().mockResolvedValue({ request: null }),
  updateCandidateIdRequestStatus: vi.fn().mockResolvedValue({ operation: "success", message: "Updated" }),
}));

describe("AdminCandidateAccountRequestsTable", () => {
  it("renders the DataTable title", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    // "Candidate ID Requests" is a unique DataTable title
    expect(screen.getByText("Candidate ID Requests")).toBeDefined();
  });

  it("renders all candidate IDs rows", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("101, 102, 103")).toBeDefined();
    expect(screen.getByText("201, 202")).toBeDefined();
    expect(screen.getByText("301")).toBeDefined();
  });

  it("renders status values", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getAllByText("pending").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("approved")).toBeDefined();
    expect(screen.getByText("rejected")).toBeDefined();
  });

  it("renders created_by_name", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Staff Admin")).toBeDefined();
    expect(screen.getByText("HR Team")).toBeDefined();
    expect(screen.getByText("Compliance Officer")).toBeDefined();
  });

  it("shows em-dash for null rejection_reason", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    // Only the first two rows have null rejection_reason
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows rejection reason when present", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Incomplete documentation")).toBeDefined();
  });

  it("renders loading state without crashing", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={[]} loading={true} />);
    expect(screen.getByText("Candidate ID Requests")).toBeDefined();
  });

  it("renders empty state without data", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={[]} />);
    expect(screen.getByText("Candidate ID Requests")).toBeDefined();
  });

  it("shows column headers", () => {
    render(<AdminCandidateAccountRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Candidate IDs")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Rejection Reason")).toBeDefined();
    expect(screen.getByText("Created By")).toBeDefined();
    expect(screen.getByText(/Updated/)).toBeDefined();
  });
});
