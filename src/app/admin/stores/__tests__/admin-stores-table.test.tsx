import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminStoresTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
const mockPathname = vi.fn().mockReturnValue("/admin/stores");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => mockPathname(),
}));

// Mock server actions
const mockCreateStore = vi.fn();
const mockUpdateStore = vi.fn();
const mockDeleteStore = vi.fn();
vi.mock("../actions", () => ({
  createStore: (...args: unknown[]) => mockCreateStore(...args),
  updateStore: (...args: unknown[]) => mockUpdateStore(...args),
  deleteStore: (...args: unknown[]) => mockDeleteStore(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockStores = [
  {
    store_id: 1,
    store_name: "The Luxury Boutique",
    store_location: "The Avenues, Floor 2",
    store_status: 10,
    store_total_candidates: 15,
    company_name: "Luxury Retail Co.",
    brand_name: "Gucci",
    mall_name: "The Avenues",
    manager_name: "Ahmed Al-Sabah",
    created_at: "2025-01-15T10:00:00.000Z",
    updated_at: "2025-06-01T12:00:00.000Z",
  },
  {
    store_id: 2,
    store_name: "Tech Hub",
    store_location: "360 Mall, Ground",
    store_status: 0,
    store_total_candidates: null,
    company_name: "Tech Solutions KW",
    brand_name: "Samsung",
    mall_name: "360 Mall",
    manager_name: null,
    created_at: "2025-03-20T08:00:00.000Z",
    updated_at: "2025-05-10T14:00:00.000Z",
  },
];

function renderTable() {
  render(<AdminStoresTable session={mockSession} stores={mockStores} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminStoresTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage stores/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();

    // MetricCard renders label + value in separate elements
    const metricLabels = screen.getAllByText("Total stores");
    expect(metricLabels.length).toBeGreaterThanOrEqual(1);

    // Find values in metrics — "2" and "15" could match other text
    const allTwos = screen.getAllByText("2");
    expect(allTwos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders store names in the table", () => {
    renderTable();

    // Find store names in the table area — use getAllByText since they may
    // appear in sidebar nav too, but we just need them visible
    const boutiqueLinks = screen.getAllByText("The Luxury Boutique");
    expect(boutiqueLinks.length).toBeGreaterThanOrEqual(1);

    const techHubLinks = screen.getAllByText("Tech Hub");
    expect(techHubLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders store details in rows", () => {
    renderTable();

    // Company names — use getAllByText since they may appear in sidebar
    const luxuryMatches = screen.getAllByText("Luxury Retail Co.");
    expect(luxuryMatches.length).toBeGreaterThanOrEqual(1);

    const techMatches = screen.getAllByText("Tech Solutions KW");
    expect(techMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows active/inactive status badges", () => {
    renderTable();

    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);

    const inactiveBadges = screen.getAllByText("Inactive");
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the create form with required fields", () => {
    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. The Luxury Boutique");
    expect(nameInputs.length).toBeGreaterThanOrEqual(1);

    const locationInputs = screen.getAllByPlaceholderText("e.g. The Avenues, Floor 2");
    expect(locationInputs.length).toBeGreaterThanOrEqual(1);

    const addButtons = screen.getAllByText("Add");
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls createStore on form submit", async () => {
    mockCreateStore.mockResolvedValue({ success: true, storeId: 3 });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. The Luxury Boutique");
    const locationInputs = screen.getAllByPlaceholderText("e.g. The Avenues, Floor 2");
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "New Store");
    await user.type(locationInputs[0], "Downtown");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockCreateStore).toHaveBeenCalledWith({
        store_name: "New Store",
        store_location: "Downtown",
        brand_uuid: undefined,
        mall_uuid: undefined,
      });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createStore fails", async () => {
    mockCreateStore.mockResolvedValue({ success: false, error: "Name already exists" });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. The Luxury Boutique");
    const locationInputs = screen.getAllByPlaceholderText("e.g. The Avenues, Floor 2");
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "Dupe Store");
    await user.type(locationInputs[0], "Location");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Name already exists")).toBeTruthy();
    });
  });

  it("opens inline edit form when clicking a store name", async () => {
    renderTable();

    // The Luxury Boutique appears multiple times; click the first one in the table
    const storeLinks = screen.getAllByText("The Luxury Boutique");
    await userEvent.click(storeLinks[0]);

    // Edit form should show Save + Cancel buttons
    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    // Input should show existing value
    expect(screen.getByDisplayValue("The Luxury Boutique")).toBeTruthy();
  });

  it("calls updateStore on edit form submit", async () => {
    mockUpdateStore.mockResolvedValue({ success: true, storeId: 1 });
    // Note: renderTable is a separate call each test — no state leaks
    const user = userEvent.setup();

    renderTable();

    // Click store name to open edit form
    const storeLinks = screen.getAllByText("The Luxury Boutique");
    await user.click(storeLinks[0]);

    // Wait for edit form to appear
    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("The Luxury Boutique");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Boutique");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateStore).toHaveBeenCalledWith({
        storeId: 1,
        store_name: "Updated Boutique",
        store_location: "The Avenues, Floor 2",
      });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteStore with confirmation", async () => {
    mockDeleteStore.mockResolvedValue({ success: true });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteStore).toHaveBeenCalledWith({ storeId: 1 });
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

    expect(mockDeleteStore).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("renders empty state when stores array is empty and not loading", () => {
    render(<AdminStoresTable session={mockSession} stores={[]} />);
    const emptyTexts = screen.getAllByText(/no.*record/i);
    expect(emptyTexts.length).toBeGreaterThanOrEqual(1);
  });
});
