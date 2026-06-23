export const roles = ["admin", "staff", "company", "candidate", "inspector"] as const;

export type Role = (typeof roles)[number];

export type Capability =
  | "app.access"
  | "admin.system"
  | "admin.read"
  | "admin.write"
  | "bank.read"
  | "bank.write"
  | "candidate.read.any"
  | "candidate.read.assigned"
  | "candidate.read.own"
  | "candidate.search"
  | "candidate.approve"
  | "candidate.profile.edit"
  | "candidate.read"
  | "candidate.write"
  | "candidate.evaluation.read"
  | "candidate.evaluation.write"
  | "candidate_id_card.read"
  | "candidate_id_card.write"
  | "client.read"
  | "client.write"
  | "company.read.any"
  | "company.read.assigned"
  | "company.read.linked"
  | "company.write.linked"
  | "company.manage"
  | "company.read"
  | "company.time.write"
  | "contracts.read"
  | "contracts.write"
  | "discount.read"
  | "discount.write"
  | "document.read"
  | "document.write"
  | "document.export"
  | "expense.read"
  | "expense.write"
  | "finance.read"
  | "finance.mutate"
  | "finance.write"
  | "fulltimer.read"
  | "fulltimer.write"
  | "holiday.read"
  | "holiday.write"
  | "id_review.read"
  | "id_review.mutate"
  | "notes.create"
  | "notes.delete"
  | "notes.read"
  | "notes.update"
  | "request.read.any"
  | "request.read.assigned"
  | "request.read.linked"
  | "request.create"
  | "request.suggest"
  | "request.interview"
  | "request.write"
  | "request.write.any"
  | "setting.write"
  | "staff.read"
  | "staff.salary.create"
  | "staff.salary.read"
  | "staff_expense.read"
  | "staff_expense.write"
  | "staff_leave.read"
  | "staff_leave.write"
  | "store.create"
  | "store.read"
  | "story.read"
  | "story.write"
  | "suggestion.read"
  | "suggestion.write"
  | "time.read.any"
  | "time.read.assigned"
  | "time.read.own"
  | "time.approve"
  | "transfer.read";

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
