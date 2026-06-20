import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions (must be defined before vi.mock calls) ──
const { mockRequireRoleCapability, mockFindUnique, mockFindMany, mockFindFirst, mockGetRequestDetail } = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockFindUnique: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockGetRequestDetail: vi.fn(),
}));

// ── Mock session module ───────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock Prisma ───────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
    },
    company_contact: {
      findMany: vi.fn(),
    },
  },
}));

// ── Mock request-detail-core ──────────────────────────────────
vi.mock("@/modules/workspace/request-detail-core", () => ({
  getRequestDetail: mockGetRequestDetail,
}));

import { prisma } from "@/lib/prisma";
import { getCompanyRequestDetail } from "./actions";

const CONTACT_UUID = "contact-abc-123";
const COMPANY_IDS = [1, 2, 3];
const REQUEST_UUID = "req-456-def";

describe("getCompanyRequestDetail — scope checking", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: valid company session
    mockRequireRoleCapability.mockResolvedValue({
      id: CONTACT_UUID,
      role: "company",
      email: "contact@example.com",
      name: "Test Contact",
    });

    // Default: contact has access to companies [1, 2, 3]
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue(
      COMPANY_IDS.map((id) => ({ company_id: id })) as any,
    );

    // Default: request exists for company 1
    mockFindUnique.mockResolvedValue({
      request_uuid: REQUEST_UUID,
      company_id: 1,
    });

    // Default: core function returns full detail
    mockGetRequestDetail.mockResolvedValue({
      request: { request_uuid: REQUEST_UUID, request_position_title: "Test Role" },
      applications: [],
      interviews: [],
      invitations: [],
      activities: [],
      notes: [],
      metrics: {},
    });
  });

  it("returns full detail when contact has access to the request's company", async () => {
    const result = await getCompanyRequestDetail(REQUEST_UUID);

    expect(result).not.toBeNull();
    expect((result as any)?.request?.request_uuid).toBe(REQUEST_UUID);
    expect(mockGetRequestDetail).toHaveBeenCalledWith(REQUEST_UUID);
  });

  it("returns null when the request's company_id is not in the contact's accessible companies", async () => {
    // Request belongs to company 99 (not in [1, 2, 3])
    mockFindUnique.mockResolvedValue({
      request_uuid: REQUEST_UUID,
      company_id: 99,
    });

    const result = await getCompanyRequestDetail(REQUEST_UUID);

    expect(result).toBeNull();
    // Core function should NOT be called for unauthorized access
    expect(mockGetRequestDetail).not.toHaveBeenCalled();
  });

  it("returns null when the request does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getCompanyRequestDetail(REQUEST_UUID);

    expect(result).toBeNull();
    expect(mockGetRequestDetail).not.toHaveBeenCalled();
  });

  it("returns null when contact has no accessible companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);

    const result = await getCompanyRequestDetail(REQUEST_UUID);

    expect(result).toBeNull();
    expect(mockGetRequestDetail).not.toHaveBeenCalled();
  });

  it("calls requireRoleCapability with company role and request.read.linked capability", async () => {
    await getCompanyRequestDetail(REQUEST_UUID);

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "company",
      "request.read.linked",
    );
  });

  it("propagates session errors (auth redirect)", async () => {
    mockRequireRoleCapability.mockRejectedValue(new Error("Redirect: /app?required=company"));

    await expect(getCompanyRequestDetail(REQUEST_UUID)).rejects.toThrow("Redirect");
  });

  it("queries company_contact with the session's id", async () => {
    await getCompanyRequestDetail(REQUEST_UUID);

    expect(prisma.company_contact.findMany).toHaveBeenCalledWith({
      where: { contact_uuid: CONTACT_UUID, allow_access: true },
      select: { company_id: true },
    });
  });

  it("queries request with the provided uuid", async () => {
    await getCompanyRequestDetail(REQUEST_UUID);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { request_uuid: REQUEST_UUID },
      select: { company_id: true },
    });
  });
});
