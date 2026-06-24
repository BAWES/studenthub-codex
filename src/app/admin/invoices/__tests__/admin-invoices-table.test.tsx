import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminInvoicesTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/invoices",
}));

// Mock server actions
const mockUpdateInvoice = vi.fn();
const mockDeleteInvoice = vi.fn();
vi.mock("../actions", () => ({
  updateInvoice: (...args: unknown[]) => mockUpdateInvoice(...args),
  deleteInvoice: (...args: unknown[]) => mockDeleteInvoice(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockInvoices = [
  {
    invoice_id: 1,
    transfer_id: 100,
    company_name: "Acme Corp",
    invoice_date: "2026-06-01T00:00:00.000Z",
    invoice_status: "paid",
    total: "1500.000",
    currency_code: "KWD",
  },
  {
    invoice_id: 2,
    transfer_id: 101,
    company_name: "Beta Ltd",
    invoice_date: "2026-06-15T00:00:00.000Z",
    invoice_status: "unpaid",
    total: "2500.000",
    currency_code: "KWD",
  },
  {
    invoice_id: 3,
    transfer_id: null,
    company_name: null,
    invoice_date: null,
    invoice_status: null,
    total: null,
    currency_code: null,
  },
];

function renderTable() {
  render(<AdminInvoicesTable session={mockSession} invoices={mockInvoices} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminInvoicesTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage invoices/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();

    const invoiceLabels = screen.getAllByText("Total invoices");
    expect(invoiceLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders company names", () => {
    renderTable();

    expect(screen.getByText("Acme Corp")).toBeTruthy();
    expect(screen.getByText("Beta Ltd")).toBeTruthy();
  });

  it("shows invoice IDs", () => {
    renderTable();

    expect(screen.getByText("#1")).toBeTruthy();
    expect(screen.getByText("#2")).toBeTruthy();
  });

  it("shows paid/unpaid status badges", () => {
    renderTable();

    const paidBadges = screen.getAllByText("Paid");
    expect(paidBadges.length).toBeGreaterThanOrEqual(1);

    const unpaidBadges = screen.getAllByText("Unpaid");
    expect(unpaidBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows currency amounts", () => {
    renderTable();

    // 1500.000 and 2500.000 appear in the table
    const amounts = screen.getAllByText(/1500|2500/);
    expect(amounts.length).toBeGreaterThanOrEqual(1);
  });

  it("shows dates formatted", () => {
    renderTable();

    // June 1 and June 15
    expect(screen.getByText("6/1/2026")).toBeTruthy();
    expect(screen.getByText("6/15/2026")).toBeTruthy();
  });

  it("calls updateInvoice when clicking status badge to toggle", async () => {
    mockUpdateInvoice.mockResolvedValue({ invoice_id: 2 });
    const user = userEvent.setup();

    renderTable();

    // Click "Unpaid" button — there should be exactly one unpaid status badge
    const unpaidButton = screen.getAllByText("Unpaid");
    // Filter to only button elements
    const unpaidBtnEl = unpaidButton.find(
      (el) => el.closest("button") || el.tagName === "BUTTON",
    ) ?? unpaidButton[0];
    await user.click(unpaidBtnEl);

    await waitFor(() => {
      expect(mockUpdateInvoice).toHaveBeenCalledWith(
        2,
        expect.objectContaining({
          invoice_status: "paid",
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls updateInvoice when clicking Paid badge to toggle to unpaid", async () => {
    mockUpdateInvoice.mockResolvedValue({ invoice_id: 1 });
    const user = userEvent.setup();

    renderTable();

    // Click "Paid" on Acme Corp status badge
    const paidTexts = screen.getAllByText("Paid");
    const paidBtnEl = paidTexts.find(
      (el) => el.closest("button") || el.tagName === "BUTTON",
    ) ?? paidTexts[0];
    await user.click(paidBtnEl);

    await waitFor(() => {
      expect(mockUpdateInvoice).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          invoice_status: "unpaid",
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when updateInvoice throws", async () => {
    mockUpdateInvoice.mockRejectedValue(new Error("Cannot update invoice"));
    const user = userEvent.setup();

    renderTable();

    // Click the "Unpaid" status button
    const unpaidTexts = screen.getAllByText("Unpaid");
    const unpaidBtnEl = unpaidTexts.find(
      (el) => el.closest("button") || el.tagName === "BUTTON",
    ) ?? unpaidTexts[0];
    await user.click(unpaidBtnEl);

    await waitFor(() => {
      expect(screen.getByText("Cannot update invoice")).toBeTruthy();
    });
  });

  it("calls deleteInvoice with confirmation", async () => {
    mockDeleteInvoice.mockResolvedValue({ invoice_id: 1 });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteInvoice).toHaveBeenCalledWith(1);
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

    expect(mockDeleteInvoice).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows error when deleteInvoice throws", async () => {
    mockDeleteInvoice.mockRejectedValue(new Error("Invoice has payouts"));
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Invoice has payouts")).toBeTruthy();
    });
    confirmSpy.mockRestore();
  });
});
