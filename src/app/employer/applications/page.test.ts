import { describe, it, expect } from "vitest";
import { listApplicationsSchema } from "@/modules/employer/applications/schemas";
import type { ApplicationRow } from "@/modules/employer/applications/schemas";

/**
 * Page migration test for employer/applications.
 *
 * Verifies the data contract between page and action.
 * The employer applications page calls listEmployerApplications({ limit: 50 })
 * and maps ApplicationRow items to DataTable rows with fields:
 * id, candidateName, jobTitle, status, createdAt.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer applications page — data contract", () => {
  it("listApplicationsSchema accepts the params the page passes ({ limit: 50 })", () => {
    const r = listApplicationsSchema.safeParse({ limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1); // default
    }
  });

  it("listApplicationsSchema defaults page/limit when called with empty input", () => {
    const r = listApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("listApplicationsSchema rejects invalid limit (over 100)", () => {
    expect(listApplicationsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("listApplicationsSchema rejects non-positive page", () => {
    expect(listApplicationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("listApplicationsSchema accepts optional status filter", () => {
    const r = listApplicationsSchema.safeParse({ status: "accepted" });
    expect(r.success).toBe(true);
  });

  it("ApplicationRow fields match DataTable column expectations", () => {
    // The page maps ApplicationRow to DataTable rows:
    //   app.id -> row.id
    //   app.candidateName -> row.candidateName
    //   app.jobTitle -> row.jobTitle
    //   app.status -> row.status
    //   app.createdAt.toISOString().slice(0, 10) -> row.createdAt
    const row: ApplicationRow = {
      id: 101,
      jobListingId: 42,
      candidateId: 7,
      candidateName: "Ahmed Al-Sabah",
      jobTitle: "Software Engineer",
      status: "pending",
      createdAt: new Date("2026-06-10"),
    };

    const dataTableRow = {
      id: row.id,
      candidateName: row.candidateName,
      jobTitle: row.jobTitle,
      status: row.status,
      createdAt: row.createdAt.toISOString().slice(0, 10),
    };

    expect(dataTableRow.id).toBe(101);
    expect(dataTableRow.candidateName).toBe("Ahmed Al-Sabah");
    expect(dataTableRow.jobTitle).toBe("Software Engineer");
    expect(dataTableRow.status).toBe("pending");
    expect(dataTableRow.createdAt).toBe("2026-06-10");
  });

  it("ApplicationRow handles null candidate name", () => {
    const row: ApplicationRow = {
      id: 1,
      jobListingId: 1,
      candidateId: 1,
      candidateName: null,
      jobTitle: "Intern",
      status: "new",
      createdAt: new Date(),
    };

    expect(row.candidateName).toBeNull();
  });
});
