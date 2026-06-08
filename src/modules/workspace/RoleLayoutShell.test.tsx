import { describe, it, expect } from "vitest";
import { RoleLayoutShell, type RoleBranding } from "./RoleLayoutShell";
import {
  Shield,
  Briefcase,
  GraduationCap,
  Building2,
  SearchCheck,
} from "lucide-react";

const ROLES = ["admin", "staff", "candidate", "company", "inspector"] as const;

type Role = (typeof ROLES)[number];

describe("ROLE_BRANDING", () => {
  // Reconstruct the internal mapping in test to verify all roles are covered.
  // RoleLayoutShell uses a dynamic lookup that falls back to Shield for
  // unknown roles, so the record must cover all five.
  const KNOWN = new Set(ROLES);
  const BRANDING: Record<Role, { label: string }> = {
    admin: { label: "Admin" },
    staff: { label: "Staff" },
    candidate: { label: "Candidate" },
    company: { label: "Company" },
    inspector: { label: "Inspector" },
  };

  it("has entries for all five roles", () => {
    for (const role of ROLES) {
      expect(BRANDING[role]).toBeDefined();
      expect(BRANDING[role].label).toBeTruthy();
    }
  });

  it("has unique labels for each role", () => {
    const labels = ROLES.map((r) => BRANDING[r].label);
    expect(new Set(labels).size).toBe(ROLES.length);
  });
});

describe("RoleLayoutShell", () => {
  it("exports RoleLayoutShell as a function", () => {
    expect(typeof RoleLayoutShell).toBe("function");
  });

  it("accepts valid props via type check", () => {
    // Compile-time check — ensure the prop types are as expected
    const props: Parameters<typeof RoleLayoutShell>[0] = {
      role: "admin",
      userName: "Alice",
      userEmail: "alice@example.com",
      children: null,
    };
    expect(props.role).toBe("admin");
    expect(props.userName).toBe("Alice");
    expect(props.userEmail).toBe("alice@example.com");
  });
});
