"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchRoleAction } from "@/modules/auth/actions";
import type { Role } from "@/modules/auth/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();

  if (!availableRoles || availableRoles.length <= 1) {
    return null;
  }

  const otherRoles = availableRoles.filter((r) => r !== currentRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className="flex w-full items-center gap-1.5 rounded-[var(--sh-radius-sm)] border border-border bg-transparent px-[10px] py-[4px] text-xs font-semibold text-[var(--muted)] min-h-[32px] cursor-default"
        >
          {roleIcons[currentRole]} {roleDisplayLabels[currentRole]}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" sideOffset={4} align="center">
        {otherRoles.map((role) => (
          <form
            key={role}
            action={(formData) => {
              startTransition(() => {
                switchRoleAction(formData);
                router.refresh();
              });
            }}
          >
            <input type="hidden" name="targetRole" value={role} />
            <DropdownMenuItem asChild>
              <button
                type="submit"
                disabled={isPending}
                className="w-full text-left text-xs gap-1.5"
              >
                {roleIcons[role]} {roleDisplayLabels[role]}
              </button>
            </DropdownMenuItem>
          </form>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
