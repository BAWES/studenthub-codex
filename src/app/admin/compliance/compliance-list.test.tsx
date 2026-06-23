import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { ComplianceList } from "./_components";

afterEach(() => { cleanup(); });

const mockRows = [
  { id: "company-1", type: "company" as const, title: "Al-Saleh Trading Co.", subtitle: "alsaleh@email.com", status: "Approved", updated: "10 Jun 2026" },
  { id: "company-2", type: "company" as const, title: "Gulf Innovations WLL", subtitle: "info@gulfinnovations.com", status: "Pending", updated: "9 Jun 2026" },
  { id: "id_request-1", type: "id_request" as const, title: "Ahmed Al-Rashid", subtitle: "ID: KWT-12345", status: "Unapproved", updated: "8 Jun 2026" },
];

vi.mock("./actions", () => ({
  listComplianceRecords: vi.fn().mockResolvedValue({
    items: [
      { id: "company-1", type: "company", title: "Al-Saleh Trading Co.", subtitle: "alsaleh@email.com", status: "Approved", updated: "10 Jun 2026" },
      { id: "company-2", type: "company", title: "Gulf Innovations WLL", subtitle: "info@gulfinnovations.com", status: "Pending", updated: "9 Jun 2026" },
      { id: "id_request-1", type: "id_request", title: "Ahmed Al-Rashid", subtitle: "ID: KWT-12345", status: "Unapproved", updated: "8 Jun 2026" },
    ],
    total: 3,
    page: 1,
    limit: 60,
    totalPages: 1,
    summary: { totalCompanies: 12, unapprovedCompanies: 3, pendingIdRequests: 5, unapprovedCandidates: 8, incompleteCandidates: 2 },
  }),
  getComplianceRecord: vi.fn().mockResolvedValue({ type: "company", company: null, metrics: [], idRequests: [] }),
  approveCompliance: vi.fn().mockResolvedValue({ id: "company-1", type: "company" }),
  denyCompliance: vi.fn().mockResolvedValue({ id: "company-1", type: "company" }),
  createComplianceRecord: vi.fn().mockResolvedValue({ id: "company-new", type: "company" }),
}));

describe("ComplianceList", () => {
  it("renders filter tabs", () => {
    render(<ComplianceList initialSummary={{ totalCompanies: 12, unapprovedCompanies: 3, pendingIdRequests: 5, unapprovedCandidates: 8, incompleteCandidates: 2 }} />);
    expect(screen.getByText("All Records")).toBeDefined();
    expect(screen.getByText("Companies")).toBeDefined();
    expect(screen.getByText("ID Requests")).toBeDefined();
    expect(screen.getByText("Candidates")).toBeDefined();
  });

  it("renders search input", () => {
    render(<ComplianceList initialSummary={{ totalCompanies: 12, unapprovedCompanies: 3, pendingIdRequests: 5, unapprovedCandidates: 8, incompleteCandidates: 2 }} />);
    expect(screen.getByPlaceholderText("Search records…")).toBeDefined();
  });

  it("loads and displays rows from listComplianceRecords", async () => {
    render(<ComplianceList initialSummary={{ totalCompanies: 12, unapprovedCompanies: 3, pendingIdRequests: 5, unapprovedCandidates: 8, incompleteCandidates: 2 }} />);

    await waitFor(() => {
      expect(screen.getByText("Al-Saleh Trading Co.")).toBeDefined();
    });
    expect(screen.getByText("Gulf Innovations WLL")).toBeDefined();
    expect(screen.getByText("Ahmed Al-Rashid")).toBeDefined();
  });

  it("shows status for each row after loading", async () => {
    render(<ComplianceList initialSummary={{ totalCompanies: 12, unapprovedCompanies: 3, pendingIdRequests: 5, unapprovedCandidates: 8, incompleteCandidates: 2 }} />);

    await waitFor(() => {
      expect(screen.getByText("Approved")).toBeDefined();
    });
    expect(screen.getByText("Pending")).toBeDefined();
    expect(screen.getByText("Unapproved")).toBeDefined();
  });
});