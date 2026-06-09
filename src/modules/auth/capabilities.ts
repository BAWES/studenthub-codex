import type { Capability, Role, SessionUser } from "./types";

const roleCapabilities: Record<Role, Capability[]> = {
  admin: [
    "app.access",
    "candidate.read.any",
    "candidate.search",
    "candidate.approve",
    "company.read.any",
    "company.manage",
    "request.read.any",
    "request.suggest",
    "request.interview",
    "request.write",
    "notes.read",
    "notes.create",
    "notes.update",
    "notes.delete",
    "suggestion.read",
    "suggestion.write",
    "candidate.evaluation.read",
    "candidate.evaluation.write",
    "time.read.any",
    "time.approve",
    "finance.read",
    "finance.mutate",
    "document.read",
    "document.write",
    "document.export",
    "id_review.read",
    "id_review.mutate",
    "admin.system",
    "staff.read",
    "client.read",
    "client.write",
  ],
  staff: [
    "app.access",
    "candidate.read.assigned",
    "candidate.search",
    "company.read.assigned",
    "request.read.assigned",
    "request.suggest",
    "request.interview",
    "request.write",
    "notes.read",
    "notes.create",
    "notes.update",
    "notes.delete",
    "suggestion.read",
    "suggestion.write",
    "candidate.evaluation.read",
    "candidate.evaluation.write",
    "time.read.assigned",
    "time.approve",
    "document.read",
    "document.export",
    "id_review.read",
    "tickets.read",
    "tickets.create"
  ],
  company: [
    "app.access",
    "company.read.linked",
    "company.write.linked",
    "request.read.linked",
    "request.create",
    "request.interview",
    "time.read.assigned",
    "time.approve",
    "finance.read",
    "document.read",
    "document.export"
  ],
  candidate: [
    "app.access",
    "candidate.read.own",
    "candidate.profile.edit",
    "time.read.own",
    "document.export"
  ],
  inspector: ["app.access", "id_review.read", "id_review.mutate"]
};

export function capabilitiesForRole(role: Role) {
  return roleCapabilities[role];
}

export function enrichSessionUser(user: SessionUser): SessionUser {
  return {
    ...user,
    accountKey: user.accountKey ?? `${user.role}:${user.id}`,
    legacyType: user.legacyType ?? user.role,
    capabilities: user.capabilities?.length ? user.capabilities : capabilitiesForRole(user.role)
  };
}

export function hasCapability(user: SessionUser, capability: Capability) {
  return enrichSessionUser(user).capabilities?.includes(capability) ?? false;
}
