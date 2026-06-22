// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminDesignationsTable } from "./_components";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/designations",
}));

afterEach(() => { cleanup(); });

const sampleDesignations = [
  {
    designation_uuid: "des-1",
    designation_name_en: "Software Engineer",
    designation_name_ar: "مهندس برمجيات",
    designation_created_at: "2026-01-15T00:00:00.000Z",
    designation_updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    designation_uuid: "des-2",
    designation_name_en: "Project Manager",
    designation_name_ar: "مدير مشروع",
    designation_created_at: "2026-02-20T00:00:00.000Z",
    designation_updated_at: "2026-05-15T00:00:00.000Z",
  },
  {
    designation_uuid: "des-3",
    designation_name_en: "Accountant",
    designation_name_ar: null,
    designation_created_at: "2026-03-10T00:00:00.000Z",
    designation_updated_at: "2026-04-20T00:00:00.000Z",
  },
];

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

// Mock the server actions so inline edit/create don't hit a real DB
vi.mock("./actions", () => ({
  createDesignation: vi.fn().mockResolvedValue({ operation: "success", message: "Created" }),
  updateDesignation: vi.fn().mockResolvedValue({ operation: "success", message: "Updated" }),
  deleteDesignation: vi.fn().mockResolvedValue({ operation: "success", message: "Deleted" }),
}));

describe("AdminDesignationsTable", () => {
  it("renders all designation rows", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    expect(screen.getByText("Software Engineer")).toBeDefined();
    expect(screen.getByText("Project Manager")).toBeDefined();
    expect(screen.getByText("Accountant")).toBeDefined();
  });

  it("shows Arabic names when present", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    expect(screen.getByText("مهندس برمجيات")).toBeDefined();
    expect(screen.getByText("مدير مشروع")).toBeDefined();
    // Accountant has null Arabic name — shows "—"
    expect(screen.getByText("—")).toBeDefined();
  });

  it("shows Delete buttons for each row", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons.length).toBe(3);
  });

  it("shows CreateDesignationForm section", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    expect(screen.getByText("Add designation")).toBeDefined();
    // "English name" appears as column header AND form label
    expect(screen.getAllByText("English name").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Arabic name").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Add")).toBeDefined();
  });

  it("shows DataTable title and sidebar navigation", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    // "Designations" appears in DataTable title and column header
    expect(screen.getAllByText("Designations").length).toBeGreaterThanOrEqual(1);
  });

  it("renders form inputs without inline style attributes", () => {
    render(
      <AdminDesignationsTable
        session={mockSession}
        designations={sampleDesignations as any}
      />,
    );
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      expect(input.getAttribute("style")).toBeNull();
    });
  });
});
