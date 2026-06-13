import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminRequestsTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/requests",
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockRows = [
  {
    id: "req-001",
    title: "Software Engineers needed",
    company: "Tech Corp",
    owner: "Noura Al-Ali",
    seats: 5,
    status: "active",
    updated: "2 hours ago",
  },
  {
    id: "req-002",
    title: "Marketing Interns",
    company: "Brand Inc",
    owner: "Fatima Yousef",
    seats: 2,
    status: "filled",
    updated: "1 day ago",
  },
];

function renderTable(loading = false) {
  render(<AdminRequestsTable session={mockSession} rows={mockRows} loading={loading} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminRequestsTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(screen.getByRole("heading", { name: /requests/i })).toBeTruthy();
  });

  it("renders the DataTable title", () => {
    renderTable();
    expect(screen.getByText("Request Pipeline")).toBeTruthy();
  });

  it("renders request row data", () => {
    renderTable();
    expect(screen.getByText("Software Engineers needed")).toBeTruthy();
    expect(screen.getByText("Marketing Interns")).toBeTruthy();
    expect(screen.getByText("Tech Corp")).toBeTruthy();
    expect(screen.getByText("Brand Inc")).toBeTruthy();
    expect(screen.getByText("Noura Al-Ali")).toBeTruthy();
    expect(screen.getByText("Fatima Yousef")).toBeTruthy();
  });

  it("renders seat counts", () => {
    renderTable();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders status values", () => {
    renderTable();
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("filled")).toBeTruthy();
  });

  it("renders updated timestamps", () => {
    renderTable();
    expect(screen.getByText("2 hours ago")).toBeTruthy();
    expect(screen.getByText("1 day ago")).toBeTruthy();
  });

  it("renders description text", () => {
    renderTable();
    expect(screen.getByText(/operational demand/i)).toBeTruthy();
  });

  it("shows Open links for each row", () => {
    renderTable();
    const openLinks = screen.getAllByText("Open");
    expect(openLinks.length).toBe(2);
    // Each link should go to the correct row
    const links = screen.getAllByRole("link");
    const rowLinks = links.filter((l) => l.getAttribute("href")?.startsWith("/admin/requests/"));
    expect(rowLinks.length).toBe(2);
  });

  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <AdminRequestsTable session={mockSession} rows={[]} loading={true} />,
    );
    // DataTable skeleton renders ShimmerSkeleton with data-slot="skeleton"
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it("renders empty state when rows are empty and not loading", () => {
    render(<AdminRequestsTable session={mockSession} rows={[]} />);
    const emptyTexts = screen.getAllByText(/no.*record/i);
    expect(emptyTexts.length).toBeGreaterThanOrEqual(1);
  });
});
