// ---------------------------------------------------------------------------
// Vitest Fixture Helpers — src/test/fixtures/
//
// Shared test utilities for vitest unit tests.
// These helpers provide mock data and mock functions for common dependencies
// (Prisma, session context, etc.) without hitting a real database.
// ---------------------------------------------------------------------------

import { vi } from "vitest";
import crypto from "node:crypto";

// ── Mock Session Helpers ─────────────────────────────────────────────────

export interface MockSessionUser {
  role: string;
  id: string;
  name: string;
  email: string;
}

export const MOCK_SESSION_USERS: Record<string, MockSessionUser> = {
  admin: { role: "admin", id: "9001", name: "Test Admin", email: "admin@test.studenthub.ai" },
  staff: { role: "staff", id: "8001", name: "Test Staff", email: "staff@test.studenthub.ai" },
  candidate: { role: "candidate", id: "7001", name: "Test Candidate", email: "candidate@test.studenthub.ai" },
  company: { role: "company", id: "comp-uuid-0001", name: "Test Company User", email: "company@test.studenthub.ai" },
  inspector: { role: "inspector", id: "insp-uuid-0001", name: "Test Inspector", email: "inspector@test.studenthub.ai" },
};

/**
 * Sign a session cookie (mirrors e2e/fixtures/auth.ts signSession).
 * Works in vitest if AUTH_SECRET is set in test environment.
 */
export function signSessionCookie(user: MockSessionUser): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is required to sign session cookies. " +
        "Set it in vitest.config.ts or .env.test",
    );
  }
  const payload = Buffer.from(
    JSON.stringify({ ...user, issuedAt: Date.now() }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

// ── Mock Prisma Helpers ─────────────────────────────────────────────────

/**
 * Create a mock Prisma client with all models returning empty/mock data.
 * Override specific models via `overrides`.
 *
 * @example
 * ```ts
 * const prisma = createMockPrisma({
 *   candidate: { findFirst: vi.fn().mockResolvedValue(mockCandidate) },
 * });
 * ```
 */
export function createMockPrisma(
  overrides: Record<string, Record<string, unknown>> = {},
): any {
  // Default mock: all query methods resolve to empty results
  const defaultModel: Record<string, unknown> = {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    upsert: vi.fn().mockResolvedValue({}),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    aggregate: vi.fn().mockResolvedValue({}),
  };

  const models = [
    "admin", "staff", "candidate", "contact", "inspector",
    "company", "company_contact", "store", "brand",
    "country", "area", "university", "bank",
    "job_listing", "job_listing_application",
    "request", "contract", "note",
    "candidate_education", "candidate_experience",
    "candidate_language", "candidate_skill",
    "candidate_certificate", "candidate_certification",
    "candidate_tag", "candidate_stats",
    "candidate_note", "candidate_reference",
    "candidate_work_history", "candidate_working_date",
    "candidate_working_hour",
    "transfer", "transfer_candidate", "transfer_file",
    "invoice", "payment_record",
    "permission", "permission_user",
    "chat", "chat_message",
  ];

  const prisma: Record<string, unknown> = {};

  for (const model of models) {
    prisma[model] = {
      ...defaultModel,
      ...(overrides[model] ?? {}),
    };
  }

  prisma.$connect = vi.fn().mockResolvedValue(undefined);
  prisma.$disconnect = vi.fn().mockResolvedValue(undefined);
  prisma.$transaction = vi
    .fn()
    .mockImplementation((fn: unknown) =>
      typeof fn === "function" ? fn(prisma) : Promise.resolve([]),
    );

  return prisma;
}

// ── Mock Server Action Context ──────────────────────────────────────────

/**
 * Create mock params for Next.js server components/actions.
 */
export function createMockParams(overrides: Record<string, string> = {}): Record<string, string> {
  return overrides;
}

/**
 * Mock fetch() for server action tests that hit external APIs.
 * Call before your test, then restore with mockFetch.mockRestore().
 */
export function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
