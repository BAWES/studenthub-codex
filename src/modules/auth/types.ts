export const roles = ["admin", "staff", "company", "candidate", "inspector"] as const;

export type Role = (typeof roles)[number];

export type Capability =
  | "app.access"
  | "candidate.read.any"
  | "candidate.read.assigned"
  | "candidate.read.own"
  | "candidate.search"
  | "candidate.approve"
  | "candidate.profile.edit"
  | "company.read.any"
  | "company.read.assigned"
  | "company.read.linked"
  | "company.write.linked"
  | "company.manage"
  | "request.read.any"
  | "request.read.assigned"
  | "request.read.linked"
  | "request.create"
  | "request.suggest"
  | "request.interview"
  | "time.read.any"
  | "time.read.assigned"
  | "time.read.own"
  | "time.approve"
  | "finance.read"
  | "finance.mutate"
  | "document.export"
  | "id_review.read"
  | "id_review.mutate"
  | "admin.system"
  | "admin.read"
  | "admin.write";

export type SessionUser = {
  role: Role;
  id: string;
  name: string;
  email: string;
  issuedAt: number;
  accountKey?: string;
  legacyType?: Role;
  capabilities?: Capability[];
};

export type LoginAccountChoice = {
  accountKey: string;
  role: Role;
  label: string;
  name: string;
  email: string;
};

export type LoginState = {
  error?: string;
  email?: string;
  accounts?: LoginAccountChoice[];
};

export function isRole(value: FormDataEntryValue | null): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

/**
 * Maps a user role to its default workspace route.
 * Used for role-agnostic login redirects.
 */
export function roleDefaultRoute(role: Role): string {
  const routes: Record<Role, string> = {
    admin: "/admin",
    staff: "/staff",
    candidate: "/candidate",
    company: "/company",
    inspector: "/inspector",
  };
  return routes[role];
}
