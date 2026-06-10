import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { StaffDashboard } from "./StaffDashboard";

afterEach(() => cleanup());

const mockData = {
  staff: { staff_name: "Ahmed", staff_email: "a@t.com", staff_job_title: "Officer", staff_salary: 1200, staff_salary_currency: "KWD" },
  metrics: [
    { label: "Candidates", value: 145, note: "12 assigned" },
    { label: "Companies", value: 89, note: "Employer records" },
    { label: "Open Requests", value: 42, note: "Owned by you" },
    { label: "Activity", value: 28, note: "Recent items" },
  ],
  requests: [
    { id: "REQ-001", title: "Employer License Renewal", subtitle: "Kuwait Co.", meta: "PENDING · Jun 10" },
    { id: "REQ-002", title: "Staff Visa Update", subtitle: "BPG Group", meta: "REVIEW · Jun 9" },
  ],
  stories: [
    { id: "ST-001", title: "License Renewal", subtitle: "Status 1", meta: "Jun 10" },
  ],
};

describe("StaffDashboard", () => {
  it("renders welcome hero with staff name", () => {
    const { container } = render(<StaffDashboard data={mockData as any} />);
    expect(container.textContent).toContain("Welcome back, Ahmed");
  });

  it("renders pipeline stage cards", () => {
    const { container } = render(<StaffDashboard data={mockData as any} />);
    expect(container.textContent).toContain("Pending");
    expect(container.textContent).toContain("Approved");
    expect(container.textContent).toContain("Completed");
  });

  it("renders active queue with request items", () => {
    const { container } = render(<StaffDashboard data={mockData as any} />);
    expect(container.textContent).toContain("Employer License Renewal");
    expect(container.textContent).toContain("Staff Visa Update");
  });

  it("renders schedule and activity sections", () => {
    const { container } = render(<StaffDashboard data={mockData as any} />);
    expect(container.textContent).toContain("Today");
    expect(container.textContent).toContain("Recent Activity");
  });

  it("handles empty data gracefully", () => {
    const empty = { ...mockData, metrics: [], requests: [], stories: [] };
    const { container } = render(<StaffDashboard data={empty as any} />);
    expect(container.textContent).toContain("Welcome back, Ahmed");
    expect(container.textContent).toContain("Active Queue");
  });

  it("shows pending approvals count", () => {
    const { container } = render(<StaffDashboard data={mockData as any} />);
    expect(container.textContent).toContain("1 pending approval");
  });
});
