"use client";

import { useTransition } from "react";
import { switchRoleAction } from "@/modules/auth/actions";
import type { Role } from "@/modules/auth/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Shield,
  UserCheck,
  Building2,
  GraduationCap,
  ScanSearch,
} from "lucide-react";

const roleDisplayLabels: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  company: "Company",
  candidate: "Candidate",
  inspector: "Inspector",
};

const roleIcons: Record<Role, React.ReactNode> = {
  admin: <Shield size={16} strokeWidth={2.5} aria-hidden="true" />,
  staff: <UserCheck size={16} strokeWidth={2.5} aria-hidden="true" />,
  company: <Building2 size={16} strokeWidth={2.5} aria-hidden="true" />,
  candidate: <GraduationCap size={16} strokeWidth={2.5} aria-hidden="true" />,
  inspector: <ScanSearch size={16} strokeWidth={2.5} aria-hidden="true" />,
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
    <div className="relative w-full group/role">
      {/* Current role pill — expands from icon-only to full label */}
      <span
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "flex items-center gap-2 w-full min-h-9 px-[9px] cursor-default text-muted-foreground justify-start overflow-hidden",
        )}
      >
        <span className="inline-flex items-center justify-center shrink-0 w-[18px]">
          {roleIcons[currentRole]}
        </span>
        <span className="opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 delay-[80ms] text-xs font-semibold whitespace-nowrap">
          {roleDisplayLabels[currentRole]}
        </span>
      </span>

      {/* Dropdown — appears above on hover */}
      {otherRoles.length > 0 && (
        <div
          className={cn(
            "hidden group-hover/role:flex flex-col gap-[2px]",
            "absolute bottom-full left-0 right-0 mb-1",
            "z-50 min-w-[130px]",
            "rounded-md border border-border bg-popover p-1 shadow-md",
          )}
        >
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
                disabled={isPending}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "flex items-center gap-2 w-full justify-start text-xs font-medium text-foreground",
                  "hover:bg-[color-mix(in_srgb,#eb6651_10%,transparent)] hover:text-[#eb6651]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <span className="inline-flex items-center justify-center shrink-0 w-[18px]">
                  {roleIcons[role]}
                </span>
                {roleDisplayLabels[role]}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
