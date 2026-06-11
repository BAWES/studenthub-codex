// ---------------------------------------------------------------------------
// Mock user data for E2E login/auth and role-gate tests
//
// Provides deterministic mock users for all 5 roles (admin, staff, candidate,
// company, inspector) with pre-generated session cookies.
//
// IMPORTANT: This is MOCK data only — no real user information.
// All data exists solely for test reproducibility.
// ---------------------------------------------------------------------------

import { signSession, type FixtureUser } from "./auth";

// ── Mock User Definitions ─────────────────────────────────────────────────

export interface MockUser {
  role: string;
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
}

/**
 * Deterministic mock users for all 5 roles.
 * These users do NOT exist in any database — they are purely for test
 * session cookie generation. Tests can use these to bypass the DB
 * dependency in auth.ts.
 */
export const MOCK_USERS: MockUser[] = [
  {
    role: "admin",
    id: "9001",
    name: "Test Admin",
    email: "fixture-admin@test.studenthub.ai",
  },
  {
    role: "staff",
    id: "8001",
    name: "Test Staff",
    email: "fixture-staff@test.studenthub.ai",
  },
  {
    role: "candidate",
    id: "7001",
    name: "Test Candidate",
    email: "fixture-candidate@test.studenthub.ai",
    passwordHash: "$2a$10$mock_hash_for_testing_only",
  },
  {
    role: "company",
    id: "company-0001-0001-0001-000000000001",
    name: "Test Company User",
    email: "fixture-company@test.studenthub.ai",
  },
  {
    role: "inspector",
    id: "inspector-0001-0001-0001-000000000001",
    name: "Test Inspector",
    email: "fixture-inspector@test.studenthub.ai",
  },
];

// ── Fixture Map ───────────────────────────────────────────────────────────

/** Create a Map<string, FixtureUser> with mock users and signed cookies. */
export function getMockFixtures(): Map<string, FixtureUser> {
  const map = new Map<string, FixtureUser>();

  for (const user of MOCK_USERS) {
    const fixtureUser: FixtureUser = {
      role: user.role,
      id: user.id,
      name: user.name,
      email: user.email,
      cookie: signSession({
        role: user.role,
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    };
    map.set(user.role, fixtureUser);
  }

  return map;
}

/** Get a single mock FixtureUser by role. */
export function getMockFixture(role: string): FixtureUser {
  const user = MOCK_USERS.find((u) => u.role === role);
  if (!user) throw new Error(`Unknown mock role: ${role}`);
  return {
    role: user.role,
    id: user.id,
    name: user.name,
    email: user.email,
    cookie: signSession({
      role: user.role,
      id: user.id,
      name: user.name,
      email: user.email,
    }),
  };
}
