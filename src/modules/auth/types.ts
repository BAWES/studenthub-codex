export const roles = ["admin", "staff", "company", "candidate", "inspector"] as const;

export type Role = (typeof roles)[number];

export type SessionUser = {
  role: Role;
  id: string;
  name: string;
  email: string;
  issuedAt: number;
};

export type LoginState = {
  error?: string;
  email?: string;
  role?: Role;
};

export function isRole(value: FormDataEntryValue | null): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}
