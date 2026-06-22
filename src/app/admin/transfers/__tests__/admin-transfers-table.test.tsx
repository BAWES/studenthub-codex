import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminTransfersTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/transfers",
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockRows = [
  {
    id: 1001,
    company: "Tech Corp",
    period: "June 2026",
    status: "pending",
    total: "1,500.000",
  },
  {
    id: 1002,
    company: "Brand Inc",
    period: "May 2026",
    status: "paid",
    total: null as string | null,
  },
];

const mockLatest = mockRows[0];

function renderTable(loading = false) {
  render(
    <AdminTransfersTable
      session={mockSession}
      rows={mockRows}
      latest={mockLatest}
      loading={loading}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminTransfersTable", () => {
  it("renders the page title", () => {
    renderTable();
    expect(screen.getByText(/pay candidates/i)).toBeTruthy();
  });

  it("renders transfer run rows", () => {
    renderTable();
    // #1001 appears in both the metric card and the table row
    const idMatches = screen.getAllByText(/#?1001/);
    expect(idMatches.length).toBeGreaterThanOrEqual(1);
    const c2Matches = screen.getAllByText("#1002");
    expect(c2Matches.length).toBeGreaterThanOrEqual(1);
    const tcMatches = screen.getAllByText("Tech Corp");
    expect(tcMatches.length).toBeGreaterThanOrEqual(1);
    const biMatches = screen.getAllByText("Brand Inc");
    expect(biMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("June 2026")).toBeTruthy();
    expect(screen.getByText("May 2026")).toBeTruthy();
  });

  it("renders status values", () => {
    renderTable();
    expect(screen.getByText("pending")).toBeTruthy();
    expect(screen.getByText("paid")).toBeTruthy();
  });

  it("renders total amounts when present", () => {
    renderTable();
    expect(screen.getByText("1,500.000")).toBeTruthy();
  });

  it("renders em-dash for null total", () => {
    renderTable();
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the latest run label in metrics", () => {
    renderTable();
    const latestLabels = screen.getAllByText("Latest run");
    expect(latestLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders finance workflow steps", () => {
    renderTable();
    expect(screen.getByText("Review run")).toBeTruthy();
    expect(screen.getByText("Check payouts")).toBeTruthy();
    expect(screen.getByText("Issue invoice")).toBeTruthy();
    expect(screen.getByText("Reconcile")).toBeTruthy();
  });

  it("renders link to latest run", () => {
    renderTable();
    const latestLink = screen.getByText(/open latest run/i);
    expect(latestLink).toBeTruthy();
    expect(latestLink.getAttribute("href")).toBe("/admin/transfers/1001");
  });

  it("shows Open links for each row", () => {
    renderTable();
    const openLinks = screen.getAllByText("Open");
    expect(openLinks.length).toBe(2);
    // Each link should go to the correct row
    const links = screen.getAllByRole("link");
    const rowLinks = links.filter((l) => l.getAttribute("href")?.startsWith("/admin/transfers/"));
    expect(rowLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <AdminTransfersTable
        session={mockSession}
        rows={[]}
        latest={undefined}
        loading={true}
      />,
    );
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});
