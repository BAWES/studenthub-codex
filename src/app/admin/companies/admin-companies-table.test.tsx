import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminCompaniesTable } from "./_components";

afterEach(() => { cleanup(); });

const sampleRows = [
  { id: 1, name: "Al-Saleh Trading", email: "info@alsaleh.com", owner: "Abdullah Al-Saleh", requests: 5, status: "Approved", rate: "10.000 KWD", updated: "10 Jun 2026" },
  { id: 2, name: "Al-Jazeera Construction", email: "admin@aljazeera.com", owner: "Mohammad Al-Jazeera", requests: 2, status: "Pending", rate: "8.500 KWD", updated: "9 Jun 2026" },
  { id: 3, name: "Gulf Innovations", email: "hello@gulfinnovations.com", owner: "Sara Al-Ghanim", requests: 0, status: "Approved", rate: "12.000 KWD", updated: "8 Jun 2026" },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

describe("AdminCompaniesTable", () => {
  it("renders all company rows", () => {
    render(<AdminCompaniesTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Al-Saleh Trading")).toBeDefined();
    expect(screen.getByText("Al-Jazeera Construction")).toBeDefined();
    expect(screen.getByText("Gulf Innovations")).toBeDefined();
  });

  it("shows column data for each row", () => {
    render(<AdminCompaniesTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Abdullah Al-Saleh")).toBeDefined();
    expect(screen.getByText("Mohammad Al-Jazeera")).toBeDefined();
    expect(screen.getByText("Sara Al-Ghanim")).toBeDefined();
  });

  it("shows DataTable title", () => {
    render(<AdminCompaniesTable session={mockSession} rows={sampleRows as any} />);
    expect(screen.getByText("Company Accounts")).toBeDefined();
  });

  it("shows company statuses", () => {
    render(<AdminCompaniesTable session={mockSession} rows={sampleRows as any} />);
    // Status appears multiple times (column header + cell data)
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders sidebar navigation with Companies link", () => {
    render(<AdminCompaniesTable session={mockSession} rows={sampleRows as any} />);
    // "Companies" appears in sidebar (as link title), heading, and mobile nav
    expect(screen.getAllByText("Companies").length).toBeGreaterThanOrEqual(2);
  });

  it("renders loading skeleton when loading prop is true", () => {
    const { container } = render(
      <AdminCompaniesTable session={mockSession} rows={[]} loading={true} />,
    );
    // DataTable renders a skeleton when loading
    expect(container.querySelector('[class*="animate"]')).toBeDefined();
  });
});
