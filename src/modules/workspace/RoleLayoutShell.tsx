"use client";

import { useWorkspaceOS } from "./WorkspaceOSContext";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { logoutAction } from "@/modules/auth/actions";
import { Breadcrumbs } from "./Breadcrumbs";
import { AppHeader } from "@/components/layout/AppHeader";
import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  SearchCheck,
} from "lucide-react";

export type RoleBranding = {
  label: string;
  icon: LucideIcon;
};

const ROLE_BRANDING: Record<string, RoleBranding> = {
  admin: { label: "Admin", icon: Shield },
  staff: { label: "Staff", icon: Briefcase },
  candidate: { label: "Candidate", icon: GraduationCap },
  company: { label: "Company", icon: Building2 },
  inspector: { label: "Inspector", icon: SearchCheck },
};

export function RoleLayoutShell({
  role,
  userName,
  userEmail,
  children,
}: {
  role: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const { embedded } = useWorkspaceOS();

  const branding = ROLE_BRANDING[role] ?? { label: role, icon: Shield };
  const Icon = branding.icon;

  if (embedded) {
    return (
      <div className="flex flex-col gap-4">
        <AppHeader />
        <header className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">{branding.label}</h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex flex-col items-end text-sm">
              <span className="text-muted-foreground">{userName}</span>
              <strong>{userEmail}</strong>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="px-1">
          <Breadcrumbs />
        </div>

        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">{branding.label}</h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex flex-col items-end text-sm">
              <span className="text-muted-foreground">{userName}</span>
              <strong>{userEmail}</strong>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="px-1">
          <Breadcrumbs />
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
