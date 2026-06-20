import { describe, it, expect } from "vitest";
import {
  staffMetricSchema,
  staffWorkspaceListItemSchema,
  staffObjectOutputSchema,
  staffWorkspaceOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("staffMetricSchema", () => {
  const validMetric = {
    label: "Active Requests",
    value: 12,
    note: "Total active requests",
  };

  it("accepts a valid metric", () => {
    expect(staffMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(staffMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      staffMetricSchema.safeParse({ ...validMetric, label: "" }).success,
    ).toBe(false);
  });

  it("rejects negative value", () => {
    expect(
      staffMetricSchema.safeParse({ ...validMetric, value: -1 }).success,
    ).toBe(false);
  });

  it("rejects float value", () => {
    expect(
      staffMetricSchema.safeParse({ ...validMetric, value: 12.5 }).success,
    ).toBe(false);
  });

  it("rejects string value", () => {
    expect(
      staffMetricSchema.safeParse({ ...validMetric, value: "12" }).success,
    ).toBe(false);
  });
});

describe("staffWorkspaceListItemSchema", () => {
  const validItem = {
    id: "req_abc123",
    title: "Software Engineer Request",
    subtitle: "Acme Corp",
    meta: "pending",
    href: "/staff/requests/req_abc123",
  };

  it("accepts a valid list item with all fields", () => {
    expect(staffWorkspaceListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts numeric id", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({ ...validItem, id: 42 }).success,
    ).toBe(true);
  });

  it("accepts missing meta and href", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({
        id: "req_1",
        title: "Request",
        subtitle: "Company",
      }).success,
    ).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(staffWorkspaceListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      staffWorkspaceListItemSchema.safeParse({ ...validItem, title: "" }).success,
    ).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = validItem;
    expect(staffWorkspaceListItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("staffObjectOutputSchema", () => {
  const validStaff = {
    staff_name: "John Doe",
    staff_email: "john@acme.com",
    staff_job_title: "Recruiter",
    staff_salary: 2500.0,
    staff_salary_currency: "KWD",
  };

  it("accepts a valid staff object", () => {
    expect(staffObjectOutputSchema.safeParse(validStaff).success).toBe(true);
  });

  it("accepts null fields", () => {
    expect(
      staffObjectOutputSchema.safeParse({
        ...validStaff,
        staff_job_title: null,
        staff_salary: null,
        staff_salary_currency: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing staff_name", () => {
    const { staff_name: _, ...rest } = validStaff;
    expect(staffObjectOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("staffWorkspaceOutputSchema", () => {
  const validWorkspace = {
    staff: {
      staff_name: "John Doe",
      staff_email: "john@acme.com",
      staff_job_title: "Recruiter",
      staff_salary: 2500.0,
      staff_salary_currency: "KWD",
    },
    metrics: [
      { label: "Active", value: 5, note: "Active requests" },
      { label: "Pending", value: 3, note: "Pending requests" },
      { label: "Completed", value: 10, note: "Completed requests" },
      { label: "Total", value: 18, note: "Total requests" },
    ],
    requests: [
      { id: "req_1", title: "Engineer Request", subtitle: "Acme Corp" },
    ],
    stories: [
      { id: "st_1", title: "Success Story", subtitle: "Khalid hired" },
    ],
  };

  it("accepts a valid workspace output", () => {
    expect(staffWorkspaceOutputSchema.safeParse(validWorkspace).success).toBe(
      true,
    );
  });

  it("accepts null staff", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        staff: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty requests and stories arrays", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        requests: [],
        stories: [],
      }).success,
    ).toBe(true);
  });

  it("rejects metrics array with wrong length (< 4)", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        metrics: [
          { label: "Active", value: 5, note: "Active requests" },
          { label: "Pending", value: 3, note: "Pending requests" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects metrics array with wrong length (> 4)", () => {
    expect(
      staffWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        metrics: [
          { label: "A", value: 1, note: "" },
          { label: "B", value: 2, note: "" },
          { label: "C", value: 3, note: "" },
          { label: "D", value: 4, note: "" },
          { label: "E", value: 5, note: "" },
        ],
      }).success,
    ).toBe(false);
  });
});
