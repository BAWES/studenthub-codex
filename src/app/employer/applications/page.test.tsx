import { describe, it, expect } from "vitest";
import { listEmployerApplicationsSchema } from "@/modules/employer/applications/schemas";

/**
 * Page migration test for employer/applications.
 *
 * Verifies the data contract between page and action.
 * The employer applications page calls listEmployerApplications({ limit: 50 })
 * and maps EmployerApplicationRow items to DataTable rows with fields:
 * id, jobTitle, candidateName, status, createdAt.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer applications page — data contract", () => {
  it("listEmployerApplications accepts the params the page passes ({ limit: 50 })", () => {
    const r = listEmployerApplicationsSchema.safeParse({ limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1); // default
    }
  });

  it("listEmployerApplications defaults page/limit when called with empty input", () => {
    const r = listEmployerApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listEmployerApplications rejects invalid limit (over 100)", () => {
    expect(listEmployerApplicationsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("listEmployerApplications rejects non-positive page", () => {
    expect(listEmployerApplicationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("listEmployerApplications accepts status filter", () => {
    const r = listEmployerApplicationsSchema.safeParse({ status: "accepted" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("accepted");
    }
  });

  it("listEmployerApplications coerces string numbers for page/limit", () => {
    const r = listEmployerApplicationsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});
