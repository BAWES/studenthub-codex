import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminCompanyRequestsTable } from "./_components";

afterEach(() => { cleanup(); });

const sampleRows = [
  {
    id: "cr-001",
    company_name: "Acme Corp",
    contact_name: "John Doe",
    currency_code: "KWD",
    status: "pending",
    updated: "2026-06-13",
  },
  {
    id: "cr-002",
    company_name: "Tech Innovations",
    contact_name: null,
    currency_code: "USD",
    status: "approved",
    updated: "2026-06-12",
  },
  {
    id: "cr-003",
    company_name: "Global Solutions",
    contact_name: "Jane Smith",
    currency_code: null,
    status: "pending",
    updated: "2026-06-11",
  },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

// Mock the server actions so inline interactions don't hit a real DB
vi.mock("./actions", () => ({
  listCompanyRequests: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  getCompanyRequest: vi.fn().mockResolvedValue({ request: null }),
  updateCompanyRequestStatus: vi.fn().mockResolvedValue({ operation: "success", message: "Updated" }),
}));

describe("AdminCompanyRequestsTable", () => {
  it("renders the DataTable title", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Company Registration Requests")).toBeDefined();
  });

  it("renders all company names", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Acme Corp")).toBeDefined();
    expect(screen.getByText("Tech Innovations")).toBeDefined();
    expect(screen.getByText("Global Solutions")).toBeDefined();
  });

  it("renders contact names when present", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("Jane Smith")).toBeDefined();
  });

  it("shows em-dash for null contact name", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows em-dash for null currency_code", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders status values", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    // "pending" and "approved" may appear in multiple places (rows + nav)
    expect(screen.getAllByText("pending").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("approved")).toBeDefined();
  });

  it("renders loading state without crashing", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={[]} loading={true} />);
    expect(screen.getByText("Company Registration Requests")).toBeDefined();
  });

  it("renders empty state", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={[]} />);
    expect(screen.getByText("Company Registration Requests")).toBeDefined();
  });

  it("shows column headers", () => {
    render(<AdminCompanyRequestsTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Company")).toBeDefined();
    expect(screen.getByText("Contact")).toBeDefined();
    expect(screen.getByText("Currency")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText(/Updated/)).toBeDefined();
  });
});
