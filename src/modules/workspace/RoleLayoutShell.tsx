"use client";

import { useWorkspaceOS } from "./WorkspaceOSContext";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";
import { logoutAction } from "@/modules/auth/actions";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  SearchCheck,
  type LucideIcon,
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
  // Integrate with WorkspaceOS context if available
  useWorkspaceOS();

  const branding = ROLE_BRANDING[role] ?? { label: role, icon: Shield };
  const Icon = branding.icon;

  return (
    <div className="roleLayoutShell">
      <header className="roleHeader">
        <div className="roleHeaderBranding">
          <span className="roleHeaderIcon">
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <h2 className="roleHeaderLabel">{branding.label}</h2>
        </div>

        <div className="roleHeaderUser">
          <ThemeToggle />
          <div className="roleHeaderUserInfo">
            <span className="roleHeaderUserRole">{userName}</span>
            <strong className="roleHeaderUserName">{userEmail}</strong>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="roleHeaderSignout" title="Sign out">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="roleBreadcrumbs">
        <Breadcrumbs />
      </div>

      <main className="roleContent">{children}</main>
    </div>
  );
}
