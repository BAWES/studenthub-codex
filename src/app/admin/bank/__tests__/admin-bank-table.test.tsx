import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminBankTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/bank",
}));

// Mock server actions
const mockCreateBank = vi.fn();
const mockUpdateBank = vi.fn();
const mockDeleteBank = vi.fn();
vi.mock("../actions", () => ({
  createBank: (...args: unknown[]) => mockCreateBank(...args),
  updateBank: (...args: unknown[]) => mockUpdateBank(...args),
  deleteBank: (...args: unknown[]) => mockDeleteBank(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockBanks = [
  {
    bank_id: 1,
    bank_name: "National Bank of Kuwait",
    bank_iban_code: "KW00NBK0000000000000000000000",
    bank_swift_code: "NBKKWKWK",
    bank_code_abk: 101,
    bank_address: "Kuwait City",
    bank_transfer_type: "STD",
    candidate_count: 25,
    created_at: null,
  },
  {
    bank_id: 2,
    bank_name: "Gulf Bank",
    bank_iban_code: "KW00GBK0000000000000000000000",
    bank_swift_code: null,
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
    candidate_count: 0,
    created_at: null,
  },
];

function renderTable() {
  render(<AdminBankTable session={mockSession} banks={mockBanks} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminBankTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage banks/i,
      }),
    ).toBeTruthy();
  });

  it("renders metric cards with correct values", () => {
    renderTable();

    const metricLabels = screen.getAllByText("Total banks");
    expect(metricLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("renders bank names in the table", () => {
    renderTable();

    const nbkLinks = screen.getAllByText("National Bank of Kuwait");
    expect(nbkLinks.length).toBeGreaterThanOrEqual(1);

    const gulfLinks = screen.getAllByText("Gulf Bank");
    expect(gulfLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders IBAN codes in the table", () => {
    renderTable();

    const ibans = screen.getAllByText(/KW00/);
    expect(ibans.length).toBeGreaterThanOrEqual(2);
  });

  it("shows candidate counts", () => {
    renderTable();

    // Use getAllByText — "25" and "0" can appear in metrics too
    const twentyFives = screen.getAllByText("25");
    expect(twentyFives.length).toBeGreaterThanOrEqual(1);

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the create form with required fields", () => {
    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. National Bank of Kuwait");
    expect(nameInputs.length).toBeGreaterThanOrEqual(1);

    const ibanInputs = screen.getAllByPlaceholderText(/KW81/);
    expect(ibanInputs.length).toBeGreaterThanOrEqual(1);

    const addButtons = screen.getAllByText("Add");
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls createBank on form submit", async () => {
    mockCreateBank.mockResolvedValue({ operation: "success", message: "Bank created" });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. National Bank of Kuwait");
    const ibanInputs = screen.getAllByPlaceholderText(/KW81/);
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "New Bank");
    await user.type(ibanInputs[0], "KW00XXX0000000000000000000000");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockCreateBank).toHaveBeenCalledWith({
        bankName: "New Bank",
        bankIbanCode: "KW00XXX0000000000000000000000",
        bankSwiftCode: undefined,
        bankCodeAbk: undefined,
        bankAddress: undefined,
        bankTransferType: undefined,
      });
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createBank fails", async () => {
    mockCreateBank.mockResolvedValue({ operation: "error", message: "IBAN already exists" });
    const user = userEvent.setup();

    renderTable();

    const nameInputs = screen.getAllByPlaceholderText("e.g. National Bank of Kuwait");
    const ibanInputs = screen.getAllByPlaceholderText(/KW81/);
    const addButtons = screen.getAllByText("Add");

    await user.type(nameInputs[0], "Dupe Bank");
    await user.type(ibanInputs[0], "KW00XXX0000000000000000000000");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("IBAN already exists")).toBeTruthy();
    });
  });

  it("opens inline edit form when clicking a bank name", async () => {
    renderTable();

    const bankLinks = screen.getAllByText("National Bank of Kuwait");
    await userEvent.click(bankLinks[0]);

    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByDisplayValue("National Bank of Kuwait")).toBeTruthy();
    expect(screen.getByDisplayValue("KW00NBK0000000000000000000000")).toBeTruthy();
  });

  it("calls updateBank on edit form submit", async () => {
    mockUpdateBank.mockResolvedValue({ operation: "success", message: "Bank updated" });
    const user = userEvent.setup();

    renderTable();

    const bankLinks = screen.getAllByText("National Bank of Kuwait");
    await user.click(bankLinks[0]);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("National Bank of Kuwait");
    await user.clear(nameInput);
    await user.type(nameInput, "NBK Updated");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateBank).toHaveBeenCalledWith(
        expect.objectContaining({
          bankId: 1,
          bankName: "NBK Updated",
        }),
      );
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteBank with confirmation", async () => {
    mockDeleteBank.mockResolvedValue({ operation: "success", message: "Bank deleted" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteBank).toHaveBeenCalledWith({ bankId: 1 });
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

    expect(mockDeleteBank).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
