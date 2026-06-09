"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { NavItem } from "./navigation";
import {
  LayoutGrid, User, Users, FileCheck, Building2, ArrowRightLeft,
  Calendar, Mail, ClipboardList, CreditCard, Phone, Store, Search, ArrowUpRight,
} from "lucide-react";

// ── Description map — gives each nav item a contextual subtitle ────

const NAV_DESCRIPTIONS: Record<string, string> = {
  app: "Unified workspace for everything",
  overview: "Key metrics and recent activity",
  candidates: "Search, review, and manage candidates",
  companies: "Client company profiles and contacts",
  requests: "Hiring requests and fulfillment pipeline",
  transfers: "Financial transfers and payout records",
  "my requests": "Your assigned hiring requests",
  interviews: "Upcoming interview records",
  invitations: "Open invitations from employers",
  "work logs": "Tracked shifts and work history",
  payments: "Payment records and transaction history",
  contacts: "Company contact management",
  stores: "Store location profiles",
  "id requests": "Civil ID review and document status",
};

function getDescription(label: string, href: string): string {
  const key = label.toLowerCase();
  if (NAV_DESCRIPTIONS[key]) return NAV_DESCRIPTIONS[key];
  // Fallback: guess from href last segment
  const segment = href.split("/").filter(Boolean).pop() ?? "";
  if (NAV_DESCRIPTIONS[segment]) return NAV_DESCRIPTIONS[segment];
  return `Manage ${label.toLowerCase()}`;
}

// ── Accent color per nav item — subtle variety ────────────────────

type Accent = "info" | "success" | "warning" | "error" | "primary";
const ACCENT_MAP: Record<string, Accent> = {
  app: "primary",
  overview: "info",
  candidates: "info",
  companies: "success",
  requests: "warning",
  transfers: "error",
  "my requests": "warning",
  interviews: "primary",
  invitations: "info",
  "work logs": "success",
  payments: "warning",
  contacts: "success",
  stores: "primary",
  "id requests": "warning",
};

function accentFor(label: string): Accent {
  return ACCENT_MAP[label.toLowerCase()] ?? "primary";
}

// ── Entrance animation keyframes (injected once) ──────────────────

const STYLE_ID = "sh-feature-grid-styles";

function injectGridStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes shFeatureTileIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────

export function FeatureGrid({ items }: { items: NavItem[] }) {
  // Inject animation keyframes once
  useMemo(() => { injectGridStyles(); }, []);

  return (
    <section className="featureGrid" aria-label="Workspace features">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const desc = getDescription(item.label, item.href);
        const accent = accentFor(item.label);
        return (
          <Link
            className="featureCard"
            href={item.href}
            key={item.href}
            style={{
              animation: `shFeatureTileIn 350ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 60}ms both`,
              "--tile-accent": `var(--sh-${accent})`,
              "--tile-accent-bg": `var(--sh-${accent}-bg)`,
            } as React.CSSProperties}
          >
            <span className="featureCardIcon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <strong>{item.label}</strong>
            <small>{desc}</small>
            <span className="featureCardArrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          </Link>
        );
      })}
    </section>
  );
}
