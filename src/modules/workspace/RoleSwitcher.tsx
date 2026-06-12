"use client";

import { useState, useRef, useEffect } from "react";
import { switchRoleAction } from "@/modules/auth/actions";
import type { SessionUser, Role } from "@/modules/auth/types";

export function RoleSwitcher({ session }: { session: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Always call hooks before any conditional return
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const roles = session.roles ?? [];
  // Only render for multi-role users
  if (roles.length < 2) return null;

  const currentLabel = roleLabel(session.role);
  const otherRoles = roles.filter((r) => r.role !== session.role);

  return (
    <div className="roleSwitcher" ref={ref}>
      <button
        className="roleSwitcherTrigger"
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="roleSwitcherBadge">{currentLabel}</span>
        <svg className="roleSwitcherChevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="roleSwitcherDropdown" role="listbox" aria-label="Switch role">
          {otherRoles.map((r) => (
            <form key={r.role} action={switchRoleAction.bind(null, r.role)}>
              <button type="submit" className="roleSwitcherOption" role="option" aria-selected={false}>
                <span className="roleSwitcherBadge roleSwitcherBadgeSmall">{roleLabel(r.role)}</span>
                <span className="roleSwitcherLabel">{roleDisplayName(r.role)}</span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

function roleLabel(role: Role): string {
  switch (role) {
    case "admin": return "AD";
    case "staff": return "ST";
    case "company": return "CO";
    case "candidate": return "CA";
    case "inspector": return "IN";
  }
}

function roleDisplayName(role: Role): string {
  switch (role) {
    case "admin": return "Admin";
    case "staff": return "Staff";
    case "company": return "Company";
    case "candidate": return "Candidate";
    case "inspector": return "Inspector";
  }
}
