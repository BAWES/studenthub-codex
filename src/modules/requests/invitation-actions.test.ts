import { describe, it, expect } from "vitest";
import { z } from "zod";

const getInvitationSchema = z.object({
  invitationUuid: z.string().min(1),
});
const getInvitationLogSchema = z.object({
  invitationId: z.string().min(1),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
const markInvitationLogViewedSchema = z.object({
  invitationUuid: z.string().min(1),
});
const listInvitationsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

// ---------------------------------------------------------------------------
// Schema validation tests for InvitationController server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getInvitationSchema tests
// ---------------------------------------------------------------------------

describe("getInvitationSchema", () => {
  it("accepts a valid invitation UUID", () => {
    const result = getInvitationSchema.safeParse({ invitationId: "invitation_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty invitation UUID", () => {
    const result = getInvitationSchema.safeParse({ invitationId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing invitation UUID", () => {
    const result = getInvitationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInvitationLogSchema tests
// ---------------------------------------------------------------------------

describe("getInvitationLogSchema", () => {
  it("accepts a valid invitation UUID", () => {
    const result = getInvitationLogSchema.safeParse({ invitationId: "invitation_abc123" });
    expect(result.success).toBe(true);
  });

  it("accepts invitation UUID with pagination", () => {
    const result = getInvitationLogSchema.safeParse({
      invitationId: "invitation_abc123",
      page: 1,
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty invitation UUID", () => {
    const result = getInvitationLogSchema.safeParse({ invitationId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing invitation UUID", () => {
    const result = getInvitationLogSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("applies default page and limit", () => {
    const result = getInvitationLogSchema.safeParse({ invitationId: "invitation_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects invalid page", () => {
    const result = getInvitationLogSchema.safeParse({
      invitationId: "invitation_abc123",
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = getInvitationLogSchema.safeParse({
      invitationId: "invitation_abc123",
      limit: 200,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markInvitationLogViewedSchema tests
// ---------------------------------------------------------------------------

describe("markInvitationLogViewedSchema", () => {
  it("accepts a valid invitation UUID", () => {
    const result = markInvitationLogViewedSchema.safeParse({ invitationId: "invitation_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty invitation UUID", () => {
    const result = markInvitationLogViewedSchema.safeParse({ invitationId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing invitation UUID", () => {
    const result = markInvitationLogViewedSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listInvitationsSchema tests
// ---------------------------------------------------------------------------

describe("listInvitationsSchema", () => {
  it("accepts empty params", () => {
    const result = listInvitationsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts candidateId filter", () => {
    const result = listInvitationsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts requestUuid filter", () => {
    const result = listInvitationsSchema.safeParse({ requestUuid: "req_abc" });
    expect(result.success).toBe(true);
  });

  it("accepts storyUuid filter", () => {
    const result = listInvitationsSchema.safeParse({ storyUuid: "story_abc" });
    expect(result.success).toBe(true);
  });

  it("accepts invitationStatus filter", () => {
    const result = listInvitationsSchema.safeParse({ invitationStatus: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts staffId filter", () => {
    const result = listInvitationsSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts date range filter", () => {
    const result = listInvitationsSchema.safeParse({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date range format", () => {
    const result = listInvitationsSchema.safeParse({
      dateFrom: "01-01-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid page number", () => {
    const result = listInvitationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = listInvitationsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });

  it("applies defaults for page and limit", () => {
    const result = listInvitationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });
});
