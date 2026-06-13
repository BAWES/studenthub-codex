import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminPermissionsTable } from "../_components";
import type { PermissionSectionDetail } from "../schemas";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
  usePathname: () => "/admin/permissions",
}));

// Mock server actions
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
vi.mock("../actions", () => ({
  createPermissionSection: (...args: unknown[]) => mockCreate(...args),
  updatePermissionSection: (...args: unknown[]) => mockUpdate(...args),
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockSections: PermissionSectionDetail[] = [
  {
    permission_uuid: "per_sec_aaa-1111-aaaa",
    section_name: "Manage Users",
    created_at: new Date("2026-06-01T00:00:00.000Z"),
  },
  {
    permission_uuid: "per_sec_bbb-2222-bbbb",
    section_name: "Manage Roles",
    created_at: new Date("2026-06-10T00:00:00.000Z"),
  },
  {
    permission_uuid: "per_sec_ccc-3333-cccc",
    section_name: null,
    created_at: new Date("2026-06-15T00:00:00.000Z"),
  },
];

function renderTable() {
  render(
    <AdminPermissionsTable session={mockSession} sections={mockSections} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AdminPermissionsTable", () => {
  it("renders the page heading", () => {
    renderTable();
    expect(
      screen.getByRole("heading", {
        name: /manage permission sections/i,
      }),
    ).toBeTruthy();
  });

  it("renders a metric card with section count", () => {
    renderTable();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders all permission sections in the table", () => {
    renderTable();
    expect(screen.getByText("Manage Users")).toBeTruthy();
    expect(screen.getByText("Manage Roles")).toBeTruthy();
    expect(screen.getAllByText("per_sec_...").length).toBe(3);
  });

  it("renders the create form with input and submit button", () => {
    renderTable();
    expect(
      screen.getByPlaceholderText(/e\.g\. Manage Users/i),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeTruthy();
  });

  it("renders created dates formatted", () => {
    renderTable();
    expect(screen.getByText("6/1/2026")).toBeTruthy();
    expect(screen.getByText("6/10/2026")).toBeTruthy();
    expect(screen.getByText("6/15/2026")).toBeTruthy();
  });

  it("displays an em-dash for null section_name", () => {
    renderTable();
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("calls createPermissionSection on form submit", async () => {
    mockCreate.mockResolvedValue({ permission_uuid: "new-uuid" });
    renderTable();
    const input = screen.getByPlaceholderText(/e\.g\. Manage Users/i);
    const button = screen.getByRole("button", { name: /^add$/i });

    await userEvent.type(input, "New Section");
    await userEvent.click(button);

    expect(mockCreate).toHaveBeenCalledWith({
      section_name: "New Section",
    });
  });

  it("shows an error when createPermissionSection fails", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    renderTable();
    const input = screen.getByPlaceholderText(/e\.g\. Manage Users/i);
    const button = screen.getByRole("button", { name: /^add$/i });

    await userEvent.type(input, "Fail Section");
    await userEvent.click(button);

    expect(await screen.findByText("DB error")).toBeTruthy();
  });

  it("starts inline edit when clicking a section name", async () => {
    renderTable();
    await userEvent.click(screen.getByText("Manage Users"));
    expect(screen.getByDisplayValue("Manage Users")).toBeTruthy();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeTruthy();
  });

  it("calls updatePermissionSection on edit form submit", async () => {
    mockUpdate.mockResolvedValue({ permission_uuid: "per_sec_aaa-1111-aaaa" });
    renderTable();

    // Click to edit
    await userEvent.click(screen.getByText("Manage Users"));

    const editInput = screen.getByDisplayValue("Manage Users");
    await userEvent.clear(editInput);
    await userEvent.type(editInput, "Manage Accounts");
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(mockUpdate).toHaveBeenCalledWith({
      permission_uuid: "per_sec_aaa-1111-aaaa",
      section_name: "Manage Accounts",
    });
  });

  it("shows an error when updatePermissionSection fails", async () => {
    mockUpdate.mockRejectedValue(new Error("Update failed"));
    renderTable();

    await userEvent.click(screen.getByText("Manage Users"));
    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText("Update failed")).toBeTruthy();
  });

  it("cancels inline edit when clicking cancel", async () => {
    renderTable();

    await userEvent.click(screen.getByText("Manage Users"));
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    // After cancel, we should see the original text again (not in edit mode)
    expect(screen.getByText("Manage Users")).toBeTruthy();
    // The input with that value should be gone
    expect(screen.queryByDisplayValue("Manage Users")).toBeNull();
  });
});
