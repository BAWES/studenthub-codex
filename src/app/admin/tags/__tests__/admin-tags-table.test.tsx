import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminTagsTable } from "../_components";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/tags",
}));

// Mock server actions
const mockCreateTag = vi.fn();
const mockUpdateTag = vi.fn();
const mockDeleteTag = vi.fn();
vi.mock("../actions", () => ({
  createTag: (...args: unknown[]) => mockCreateTag(...args),
  updateTag: (...args: unknown[]) => mockUpdateTag(...args),
  deleteTag: (...args: unknown[]) => mockDeleteTag(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockTags = [
  {
    tag_id: 1,
    tag: "urgent",
    created_at: new Date("2026-01-10T00:00:00.000Z"),
    updated_at: new Date("2026-06-01T00:00:00.000Z"),
  },
  {
    tag_id: 2,
    tag: "featured",
    created_at: new Date("2026-03-15T00:00:00.000Z"),
    updated_at: null,
  },
  {
    tag_id: 3,
    tag: "top-talent",
    created_at: null,
    updated_at: null,
  },
];

function renderTable() {
  render(<AdminTagsTable session={mockSession} tags={mockTags} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminTagsTable", () => {
  it("renders the page title", () => {
    renderTable();
    expect(screen.getByText(/manage tags/i)).toBeTruthy();
  });

  it("renders tag names", () => {
    renderTable();
    expect(screen.getByText("urgent")).toBeTruthy();
    expect(screen.getByText("featured")).toBeTruthy();
    expect(screen.getByText("top-talent")).toBeTruthy();
  });

  it("renders metric card with total tag count", () => {
    renderTable();
    const labels = screen.getAllByText("Total tags");
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders dates when available", () => {
    renderTable();
    // "1/10/2026" for tag 1 created_at (Jan 10, 2026)
    const dateElements = screen.getAllByText("1/10/2026");
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders em-dash for null dates", () => {
    renderTable();
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the create tag form with input and add button", () => {
    renderTable();
    const inputs = screen.getAllByPlaceholderText(/urgent|featured|top-talent/i);
    // Should at least have the create form input
    const addInput = screen.getAllByPlaceholderText("e.g. urgent, featured, top-talent");
    expect(addInput.length).toBeGreaterThanOrEqual(1);

    const addButtons = screen.getAllByText("Add");
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls createTag on form submit", async () => {
    mockCreateTag.mockResolvedValue({ operation: "success", message: "Tag created" });
    const user = userEvent.setup();

    renderTable();

    const input = screen.getByPlaceholderText("e.g. urgent, featured, top-talent");
    await user.type(input, "new-tag");

    const addButtons = screen.getAllByText("Add");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith("new-tag");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows error when createTag fails", async () => {
    mockCreateTag.mockResolvedValue({ operation: "error", message: "Tag already exists" });
    const user = userEvent.setup();

    renderTable();

    const input = screen.getByPlaceholderText("e.g. urgent, featured, top-talent");
    await user.type(input, "dupe-tag");

    const addButtons = screen.getAllByText("Add");
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Tag already exists")).toBeTruthy();
    });
  });

  it("opens inline edit form when clicking a tag name", async () => {
    renderTable();

    const urgentLink = screen.getByText("urgent");
    await userEvent.click(urgentLink);

    // Edit form should show Save + Cancel
    const saveButtons = screen.getAllByText("Save");
    expect(saveButtons.length).toBeGreaterThanOrEqual(1);

    const cancelButtons = screen.getAllByText("Cancel");
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);

    // Input should show existing value
    expect(screen.getByDisplayValue("urgent")).toBeTruthy();
  });

  it("calls updateTag on edit form submit", async () => {
    mockUpdateTag.mockResolvedValue({ operation: "success", message: "Updated" });
    const user = userEvent.setup();

    renderTable();

    // Click tag name to open edit
    const urgentLink = screen.getByText("urgent");
    await user.click(urgentLink);

    await waitFor(() => {
      expect(screen.getAllByText("Save").length).toBeGreaterThanOrEqual(1);
    });

    const nameInput = screen.getByDisplayValue("urgent");
    await user.clear(nameInput);
    await user.type(nameInput, "very-urgent");

    const saveButtons = screen.getAllByText("Save");
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockUpdateTag).toHaveBeenCalledWith(1, "very-urgent");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls deleteTag with confirmation", async () => {
    mockDeleteTag.mockResolvedValue({ operation: "success", message: "Deleted" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteTag).toHaveBeenCalledWith(1);
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

    expect(mockDeleteTag).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows error toast when deleteTag fails", async () => {
    mockDeleteTag.mockResolvedValue({ operation: "error", message: "Cannot delete tag" });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockReturnValue(undefined);
    const user = userEvent.setup();

    renderTable();

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Cannot delete tag");
    });
    expect(mockRefresh).toHaveBeenCalled();
    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
