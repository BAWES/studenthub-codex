import { describe, it, expect } from "vitest";
import type { StaffWorkspaceData, StaffMetric, StaffListItem } from "./schemas";

// ---------------------------------------------------------------------------
// Type contract tests for staff workspace action
// ---------------------------------------------------------------------------

describe("StaffWorkspaceData type contract", () => {
  it("validates StaffMetric shape", () => {
    const metric: StaffMetric = {
      label: "Candidates",
      value: 42,
      note: "Assigned to this staff account",
    };
    expect(metric.label).toBe("Candidates");
    expect(metric.value).toBe(42);
    expect(metric.note).toContain("staff");
  });

  it("validates StaffListItem shape with all fields", () => {
    const item: StaffListItem = {
      id: "abc-123",
      title: "Software Engineer",
      subtitle: "Tech Corp",
      meta: "Active · 2025-01-15",
    };
    expect(item.title).toBe("Software Engineer");
    expect(item.meta).toBeTruthy();
  });

  it("validates StaffListItem shape with minimal fields", () => {
    const item: StaffListItem = {
      id: 42,
      title: "Story",
      subtitle: "Status 1",
    };
    expect(item.meta).toBeUndefined();
    expect(item.href).toBeUndefined();
  });

  it("validates StaffListItem with href", () => {
    const item: StaffListItem = {
      id: "def-456",
      title: "Request",
      subtitle: "Company",
      href: "/staff/requests/def-456",
    };
    expect(item.href).toContain("/staff/requests");
  });

  it("StaffWorkspaceData shape is consistent", () => {
    const workspaceData: StaffWorkspaceData = {
      staff: {
        staff_name: "John Doe",
        staff_email: "john@example.com",
        staff_job_title: "Recruiter",
        staff_salary: 50000,
        staff_salary_currency: "KWD",
      },
      metrics: [],
      requests: [],
      stories: [],
    };
    expect(workspaceData.staff?.staff_name).toBe("John Doe");
    expect(workspaceData.staff?.staff_salary_currency).toBe("KWD");
  });

  it("StaffWorkspaceData allows null staff", () => {
    const workspaceData: StaffWorkspaceData = {
      staff: null,
      metrics: [],
      requests: [],
      stories: [],
    };
    expect(workspaceData.staff).toBeNull();
    expect(workspaceData.metrics).toEqual([]);
  });

  it("StaffWorkspaceData allows staff with nullable fields", () => {
    const workspaceData: StaffWorkspaceData = {
      staff: {
        staff_name: "Alice",
        staff_email: "alice@example.com",
        staff_job_title: null,
        staff_salary: null,
        staff_salary_currency: null,
      },
      metrics: [],
      requests: [],
      stories: [],
    };
    expect(workspaceData.staff?.staff_job_title).toBeNull();
    expect(workspaceData.staff?.staff_salary).toBeNull();
  });
});
