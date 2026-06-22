import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock module-level server actions
const mockListJobs = vi.fn();
const mockCreateJob = vi.fn();
const mockUpdateJob = vi.fn();
const mockDeleteJob = vi.fn();
const mockGetMyEmployerId = vi.fn();

vi.mock("@/modules/employer/jobs/actions", () => ({
  listJobs: (...args: unknown[]) => mockListJobs(...args),
  createJob: (...args: unknown[]) => mockCreateJob(...args),
  updateJob: (...args: unknown[]) => mockUpdateJob(...args),
  deleteJob: (...args: unknown[]) => mockDeleteJob(...args),
  getMyEmployerId: (...args: unknown[]) => mockGetMyEmployerId(...args),
}));

// Helper to create a NextRequest with JSON body
function jsonRequest(method: string, url: string, body?: unknown): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return req;
}

function queryRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "GET",
  });
}

describe("GET /api/employer/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated job listings", async () => {
    mockListJobs.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    const { GET } = await import("./route");
    const response = await GET(queryRequest("/api/employer/jobs"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total", 0);
    expect(data).toHaveProperty("page", 1);
  });

  it("passes query params to listJobs", async () => {
    mockListJobs.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      limit: 10,
      totalPages: 0,
    });

    const { GET } = await import("./route");
    await GET(queryRequest("/api/employer/jobs?page=2&limit=10&status=active&q=engineer"));

    expect(mockListJobs).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      status: "active",
      q: "engineer",
    });
  });

  it("returns 400 for invalid query params", async () => {
    const { GET } = await import("./route");
    const response = await GET(queryRequest("/api/employer/jobs?page=-1"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("returns 500 when listJobs throws", async () => {
    mockListJobs.mockRejectedValue(new Error("DB connection failed"));

    const { GET } = await import("./route");
    const response = await GET(queryRequest("/api/employer/jobs"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("DB connection failed");
  });
});

describe("POST /api/employer/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job and returns 201", async () => {
    mockCreateJob.mockResolvedValue({ success: true, jobListingId: 42 });

    const { POST } = await import("./route");
    const response = await POST(
      jsonRequest("POST", "/api/employer/jobs", {
        employerId: 7,
        title: "Software Engineer",
        description: "Build stuff",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.jobListingId).toBe(42);
  });

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      jsonRequest("POST", "/api/employer/jobs", { title: "" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("returns 500 when createJob throws", async () => {
    mockCreateJob.mockRejectedValue(new Error("Validation error"));

    const { POST } = await import("./route");
    const response = await POST(
      jsonRequest("POST", "/api/employer/jobs", {
        employerId: 7,
        title: "Software Engineer",
        description: "Build stuff",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Validation error");
  });
});

describe("PUT /api/employer/jobs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a job and returns 200", async () => {
    mockUpdateJob.mockResolvedValue({ success: true });

    const { PUT } = await import("./[id]/route");
    const response = await PUT(
      jsonRequest("PUT", "/api/employer/jobs/1", { title: "Senior Engineer" }),
      { params: Promise.resolve({ id: "1" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateJob).toHaveBeenCalledWith({
      jobId: 1,
      title: "Senior Engineer",
    });
  });

  it("returns 400 for invalid id", async () => {
    const { PUT } = await import("./[id]/route");
    const response = await PUT(
      jsonRequest("PUT", "/api/employer/jobs/abc", { title: "Test" }),
      { params: Promise.resolve({ id: "abc" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("returns 500 when updateJob throws", async () => {
    mockUpdateJob.mockRejectedValue(new Error("Not found"));

    const { PUT } = await import("./[id]/route");
    const response = await PUT(
      jsonRequest("PUT", "/api/employer/jobs/999", { title: "None" }),
      { params: Promise.resolve({ id: "999" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Not found");
  });
});

describe("DELETE /api/employer/jobs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a job and returns 200", async () => {
    mockDeleteJob.mockResolvedValue({ success: true });

    const { DELETE } = await import("./[id]/route");
    const response = await DELETE(
      jsonRequest("DELETE", "/api/employer/jobs/1"),
      { params: Promise.resolve({ id: "1" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteJob).toHaveBeenCalledWith({ jobId: 1 });
  });

  it("returns 400 for invalid id", async () => {
    const { DELETE } = await import("./[id]/route");
    const response = await DELETE(
      jsonRequest("DELETE", "/api/employer/jobs/abc"),
      { params: Promise.resolve({ id: "abc" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("returns 500 when deleteJob throws", async () => {
    mockDeleteJob.mockRejectedValue(new Error("Record not found"));

    const { DELETE } = await import("./[id]/route");
    const response = await DELETE(
      jsonRequest("DELETE", "/api/employer/jobs/999"),
      { params: Promise.resolve({ id: "999" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Record not found");
  });
});
