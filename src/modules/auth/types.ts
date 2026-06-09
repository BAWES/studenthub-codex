export const roles = ["admin", "staff", "company", "candidate", "inspector"] as const;

export type Role = (typeof roles)[number];

export type Capability =
  | "app.access"
  | "candidate.read"
  | "candidate.write"
  | "candidate.read.any"
  | "candidate.read.assigned"
  | "candidate.read.own"
  | "candidate.search"
  | "candidate.approve"
  | "candidate.profile.edit"
  | "candidate.evaluation.read"
  | "candidate.evaluation.write"
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
  | "request.write"
  | "notes.read"
  | "notes.create"
  | "notes.update"
  | "notes.delete"
  | "suggestion.read"
  | "suggestion.write"
  | "time.read.any"
  | "time.read.assigned"
  | "time.read.own"
  | "time.approve"
  | "finance.read"
  | "finance.mutate"
  | "document.read"
  | "document.write"
  | "document.export"
  | "id_review.read"
  | "id_review.mutate"
  | "discount.read"
  | "discount.write"
  | "bank.read"
  | "bank.write"
  | "admin.read"
  | "admin.write"
  | "staff.read"
  | "client.read"
  | "client.write"
  | "admin.system"
  | "tickets.read"
  | "tickets.create"
  | "company.read"
  | "offer.read"
  | "offer.write"
  | "expense.read"
  | "expense.write"
  | "staff_leave.read"
  | "staff_leave.write"
  | "staff.salary.read"
  | "setting.write"
  | "staff.salary.create"
  | "staff_expense.read"
  | "staff_expense.write"
  | "store.read"
  | "store.create"
  | "store.write"
  | "transfer.read"
  | "fulltimer.read"
  | "fulltimer.write";

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
