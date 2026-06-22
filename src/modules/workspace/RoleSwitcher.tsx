"use client";

import { useTransition } from "react";
import { switchRoleAction } from "@/modules/auth/actions";
import type { Role } from "@/modules/auth/types";

const roleDisplayLabels: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  company: "Company",
  candidate: "Candidate",
  inspector: "Inspector",
};

const roleIcons: Record<Role, string> = {
  admin: "🛡️",
  staff: "👤",
  company: "🏢",
  candidate: "🎓",
  inspector: "🔍",
};

export function RoleSwitcher({
  currentRole,
  availableRoles,
}: {
  currentRole: Role;
  availableRoles: Role[];
}) {
  const [isPending, startTransition] = useTransition();

  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const otherRoles = availableRoles.filter((r) => r !== currentRole);

  return (
    <div className="roleSwitcher">
      <span className="roleSwitcherCurrent">
        {roleIcons[currentRole]}{" "}
        {roleDisplayLabels[currentRole]}
      </span>
      {otherRoles.length > 0 && (
        <div className="roleSwitcherDropdown">
          {otherRoles.map((role) => (
            <form
              key={role}
              action={(formData) => {
                startTransition(() => {
                  switchRoleAction(formData);
                });
              }}
            >
              <input type="hidden" name="targetRole" value={role} />
              <button
                type="submit"
                className="roleSwitcherOption"
                disabled={isPending}
              >
                {roleIcons[role]} {roleDisplayLabels[role]}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
