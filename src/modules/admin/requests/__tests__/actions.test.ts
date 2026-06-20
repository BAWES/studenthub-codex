import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listRequests,
  getRequest,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  closeRequest,
} = await import("../actions");

describe("admin/requests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listRequests
  // -----------------------------------------------------------------------

  describe("listRequests", () => {
    it("returns paginated results with default values", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      const result = await listRequests({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.items).toEqual([]);
    });

    it("filters by status 'pending' (varchar)", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({ status: "pending" });

      const whereArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.request_status).toBe("pending");
    });

    it("filters by status 'started' (varchar)", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({ status: "started" });

      const whereArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.request_status).toBe("started");
    });

    it("filters by status 'delivered' (varchar)", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({ status: "delivered" });

      const whereArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.request_status).toBe("delivered");
    });

    it("filters by companyId", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({ companyId: 42 });

      const whereArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.company_id).toBe(42);
    });

    it("filters by search query on position title and job description", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({ q: "developer" });

      const whereArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.where as any;
      expect(whereArg.OR).toBeDefined();
      expect(whereArg.OR[0]).toEqual({ request_position_title: { contains: "developer" } });
      expect(whereArg.OR[1]).toEqual({ request_job_description: { contains: "developer" } });
    });

    it("includes company and staff relations", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({});

      const includeArg = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.include as any;
      expect(includeArg.company).toEqual({ select: { company_name: true } });
      expect(includeArg.staff).toEqual({ select: { staff_name: true } });
    });

    it("maps rows with company and staff names", async () => {
      const mockRow = {
        request_uuid: "req-uuid-1",
        request_position_title: "Senior Developer",
        request_job_description: "Hiring senior dev",
        request_compensation: "2000 KWD/month",
        request_position_type: "1",
        request_number_of_employees: 2,
        request_status: "pending",
        request_priority: 1,
        request_created_datetime: new Date("2024-01-15T10:00:00Z"),
        request_updated_datetime: new Date("2024-01-15T12:00:00Z"),
        company: { company_name: "Acme Corp" },
        staff: { staff_name: "Alice" },
      };

      vi.mocked(prisma.request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.request.count).mockResolvedValue(1);

      const result = await listRequests({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        request_uuid: "req-uuid-1",
        title: "Senior Developer",
        company_name: "Acme Corp",
        staff_name: "Alice",
        position_type: "1",
        no_of_employees: 2,
        status: "pending",
        priority: 1,
      });
    });

    it("handles null company and staff gracefully", async () => {
      const mockRow = {
        request_uuid: "req-uuid-2",
        request_position_title: null,
        request_job_description: null,
        request_compensation: null,
        request_position_type: null,
        request_number_of_employees: null,
        request_status: null,
        request_priority: null,
        request_created_datetime: null,
        request_updated_datetime: null,
        company: null,
        staff: null,
      };

      vi.mocked(prisma.request.findMany).mockResolvedValue([mockRow] as any);
      vi.mocked(prisma.request.count).mockResolvedValue(1);

      const result = await listRequests({});

      expect(result.items[0].company_name).toBeNull();
      expect(result.items[0].staff_name).toBeNull();
      expect(result.items[0].title).toBe("Untitled request");
    });

    it("uses fallback title when position title is null", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([
        {
          request_uuid: "req-uuid-3",
          request_position_title: null,
          request_job_description: null,
          request_compensation: null,
          request_position_type: null,
          request_number_of_employees: null,
          request_status: null,
          request_priority: null,
          request_created_datetime: null,
          request_updated_datetime: null,
          company: null,
          staff: null,
        },
      ] as any);
      vi.mocked(prisma.request.count).mockResolvedValue(1);

      const result = await listRequests({});

      expect(result.items[0].title).toBe("Untitled request");
    });

    it("computes totalPages correctly", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(55);

      const result = await listRequests({ limit: 20, page: 1 });

      expect(result.totalPages).toBe(3);
    });

    it("orders by request_created_datetime descending", async () => {
      vi.mocked(prisma.request.findMany).mockResolvedValue([]);
      vi.mocked(prisma.request.count).mockResolvedValue(0);

      await listRequests({});

      const orderBy = vi.mocked(prisma.request.findMany).mock.calls[0][0]?.orderBy as any;
      expect(orderBy.request_created_datetime).toBe("desc");
    });
  });

  // -----------------------------------------------------------------------
  // getRequest
  // -----------------------------------------------------------------------

  describe("getRequest", () => {
    const mockRequestRow = {
      request_uuid: "req-uuid-1",
      request_position_title: "Senior Developer",
      request_job_description: "Hiring a senior dev",
      request_compensation: "2000 KWD/month",
      request_status: "pending",
      request_feedback: null,
      request_priority: 1,
      request_started_at: null,
      request_finished_at: null,
      request_created_datetime: new Date("2024-01-15T10:00:00Z"),
      request_updated_datetime: null,
      company: { company_name: "Acme Corp", company_email: "hr@acme.com" },
      staff: { staff_name: "Alice", staff_email: "alice@acme.com" },
      request_application: [
        {
          application_uuid: "app-1",
          status: 0,
          created_at: new Date("2024-01-16T10:00:00Z"),
          candidate: { candidate_name: "John Doe" },
        },
      ],
      invitation: [
        {
          invitation_uuid: "inv-1",
          invitation_status: 0,
          invitation_created_at: new Date("2024-01-16T11:00:00Z"),
          candidate: { candidate_name: "Jane Smith" },
        },
      ],
      request_interview: [
        {
          request_interview_uuid: "int-1",
          interview_at: new Date("2024-01-20T14:00:00Z"),
          status: 0,
          candidate: { candidate_name: "Bob Wilson" },
        },
      ],
    };

    it("returns request detail when found", async () => {
      vi.mocked(prisma.request.findFirst).mockResolvedValue(mockRequestRow as any);

      const result = await getRequest("req-uuid-1");

      expect(result.request).not.toBeNull();
      expect(result.request?.request_uuid).toBe("req-uuid-1");
      expect(result.request?.request_position_title).toBe("Senior Developer");
      expect(result.request?.company?.company_name).toBe("Acme Corp");
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].candidate_name).toBe("John Doe");
      expect(result.invitations).toHaveLength(1);
      expect(result.invitations[0].candidate_name).toBe("Jane Smith");
      expect(result.interviews).toHaveLength(1);
      expect(result.interviews[0].candidate_name).toBe("Bob Wilson");
    });

    it("returns null request and empty arrays when not found", async () => {
      vi.mocked(prisma.request.findFirst).mockResolvedValue(null);

      const result = await getRequest("non-existent");

      expect(result.request).toBeNull();
      expect(result.applications).toEqual([]);
      expect(result.invitations).toEqual([]);
      expect(result.interviews).toEqual([]);
      expect(result.metrics).toHaveLength(0);
    });

    it("includes all required relations in query", async () => {
      vi.mocked(prisma.request.findFirst).mockResolvedValue(null);

      await getRequest("req-uuid-1");

      const includeArg = vi.mocked(prisma.request.findFirst).mock.calls[0][0]?.include as any;
      expect(includeArg.company).toBeDefined();
      expect(includeArg.staff).toBeDefined();
      expect(includeArg.request_application).toBeDefined();
      expect(includeArg.invitation).toBeDefined();
      expect(includeArg.request_interview).toBeDefined();
    });

    it("computes metrics from relations", async () => {
      vi.mocked(prisma.request.findFirst).mockResolvedValue(mockRequestRow as any);

      const result = await getRequest("req-uuid-1");

      expect(result.metrics).toEqual([
        { label: "Applications", value: 1, note: "Candidates applied" },
        { label: "Invitations", value: 1, note: "Candidates invited" },
        { label: "Interviews", value: 1, note: "Scheduled" },
        { label: "Status", value: "pending", note: "Priority: 1" },
      ]);
    });

    it("handles null candidate relations gracefully", async () => {
      const rowWithNullCandidates = {
        ...mockRequestRow,
        request_application: [
          {
            application_uuid: "app-1",
            status: null,
            created_at: null,
            candidate: null,
          },
        ],
        invitation: [],
        request_interview: [],
      };

      vi.mocked(prisma.request.findFirst).mockResolvedValue(rowWithNullCandidates as any);

      const result = await getRequest("req-uuid-1");

      expect(result.applications[0].candidate_name).toBeNull();
      expect(result.applications[0].status).toBeNull();
    });

    it("throws on invalid input", async () => {
      await expect(getRequest("")).rejects.toThrow();
    });
  });

  // -----------------------------------------------------------------------
  // updateRequestStatus
  // -----------------------------------------------------------------------

  describe("updateRequestStatus", () => {
    it("updates status to started with timestamp", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      const result = await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "started",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("started");

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("started");
      expect(updateData.request_started_at).toBeInstanceOf(Date);
      expect(updateData.request_updated_datetime).toBeInstanceOf(Date);
    });

    it("updates status to delivered with feedback", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "started",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      const result = await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "delivered",
        feedback: "Client approved",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("delivered");

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("delivered");
      expect(updateData.request_finished_at).toBeInstanceOf(Date);
      expect(updateData.request_delivered_at).toBeInstanceOf(Date);
      expect(updateData.request_feedback).toBe("Client approved");
    });

    it("updates status to cancelled", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "cancelled",
      });

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("cancelled");
      expect(updateData.request_cancelled_at).toBeInstanceOf(Date);
    });

    it("updates status to re_work", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "delivered",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "re_work",
      });

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("re_work");
      expect(updateData.request_re_worked_at).toBeInstanceOf(Date);
    });

    it("updates status to finished_by_recruitment", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "started",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "finished_by_recruitment",
      });

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("finished_by_recruitment");
      expect(updateData.request_finished_at).toBeInstanceOf(Date);
    });

    it("sets updated_at during status update", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "started",
      });

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_updated_datetime).toBeInstanceOf(Date);
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue(null);

      const result = await updateRequestStatus({
        requestUuid: "non-existent",
        status: "started",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error for invalid input", async () => {
      const result = await updateRequestStatus({
        requestUuid: "",
        status: "started",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockRejectedValue(new Error("DB error"));

      const result = await updateRequestStatus({
        requestUuid: "req-uuid-1",
        status: "started",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });

  // -----------------------------------------------------------------------
  // approveRequest
  // -----------------------------------------------------------------------

  describe("approveRequest", () => {
    it("approves a pending request to started", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      const result = await approveRequest({
        requestUuid: "req-uuid-1",
        reason: "Meets all requirements",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Meets all requirements");

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("started");
      expect(updateData.request_started_at).toBeInstanceOf(Date);
      expect(updateData.request_feedback).toBe("Meets all requirements");
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue(null);

      const result = await approveRequest({
        requestUuid: "non-existent",
        reason: "Good candidate",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error when request is not in pending status", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "started",
      } as any);

      const result = await approveRequest({
        requestUuid: "req-uuid-1",
        reason: "Good candidate",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("cannot be approved");
      expect(result.message).toContain("started");
    });

    it("returns error for invalid input", async () => {
      const result = await approveRequest({
        requestUuid: "",
        reason: "Good candidate",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockRejectedValue(new Error("DB error"));

      const result = await approveRequest({
        requestUuid: "req-uuid-1",
        reason: "Good candidate",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });

  // -----------------------------------------------------------------------
  // rejectRequest
  // -----------------------------------------------------------------------

  describe("rejectRequest", () => {
    it("rejects a request to cancelled", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      const result = await rejectRequest({
        requestUuid: "req-uuid-1",
        reason: "Insufficient budget",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Insufficient budget");

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("cancelled");
      expect(updateData.request_cancelled_at).toBeInstanceOf(Date);
      expect(updateData.request_feedback).toBe("Insufficient budget");
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue(null);

      const result = await rejectRequest({
        requestUuid: "non-existent",
        reason: "Budget cut",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error when request is already delivered", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "delivered",
      } as any);

      const result = await rejectRequest({
        requestUuid: "req-uuid-1",
        reason: "Changed mind",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("Cannot reject");
      expect(result.message).toContain("delivered");
    });

    it("returns error when request is already cancelled", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "cancelled",
      } as any);

      const result = await rejectRequest({
        requestUuid: "req-uuid-1",
        reason: "Already done",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("Cannot reject");
      expect(result.message).toContain("cancelled");
    });

    it("returns error for invalid input", async () => {
      const result = await rejectRequest({
        requestUuid: "",
        reason: "Reason",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "pending",
      } as any);
      vi.mocked(prisma.request.update).mockRejectedValue(new Error("DB error"));

      const result = await rejectRequest({
        requestUuid: "req-uuid-1",
        reason: "Budget issue",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });

  // -----------------------------------------------------------------------
  // closeRequest
  // -----------------------------------------------------------------------

  describe("closeRequest", () => {
    it("closes a request to delivered", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "started",
      } as any);
      vi.mocked(prisma.request.update).mockResolvedValue({} as any);

      const result = await closeRequest({
        requestUuid: "req-uuid-1",
        resolution: "Position filled successfully",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Position filled successfully");

      const updateData = vi.mocked(prisma.request.update).mock.calls[0][0]?.data as any;
      expect(updateData.request_status).toBe("delivered");
      expect(updateData.request_finished_at).toBeInstanceOf(Date);
      expect(updateData.request_delivered_at).toBeInstanceOf(Date);
      expect(updateData.request_feedback).toBe("Position filled successfully");
    });

    it("returns error for non-existent request", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue(null);

      const result = await closeRequest({
        requestUuid: "non-existent",
        resolution: "Done",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("returns error when request is already delivered", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "delivered",
      } as any);

      const result = await closeRequest({
        requestUuid: "req-uuid-1",
        resolution: "Done",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("Cannot close");
      expect(result.message).toContain("delivered");
    });

    it("returns error when request is already cancelled", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "cancelled",
      } as any);

      const result = await closeRequest({
        requestUuid: "req-uuid-1",
        resolution: "Done",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toContain("Cannot close");
      expect(result.message).toContain("cancelled");
    });

    it("returns error for invalid input", async () => {
      const result = await closeRequest({
        requestUuid: "",
        resolution: "Done",
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.request.findUnique).mockResolvedValue({
        request_uuid: "req-uuid-1",
        request_status: "started",
      } as any);
      vi.mocked(prisma.request.update).mockRejectedValue(new Error("DB error"));

      const result = await closeRequest({
        requestUuid: "req-uuid-1",
        resolution: "Done",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("DB error");
    });
  });
});
