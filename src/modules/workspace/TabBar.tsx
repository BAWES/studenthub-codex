import { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import {
  Bug,
  LayoutDashboard,
  Search,
  UserCheck,
  Users,
  Building2,
  FileText,
  ClipboardCheck,
  Settings,
  ShieldCheck,
  CreditCard,
  Calendar,
  BookOpen,
  GraduationCap,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: string;
  pinned: boolean;
}

const workNav: Record<Role, { href: string; label: string; icon: string }[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/admin/candidates", label: "Candidates", icon: "Users" },
    { href: "/admin/companies", label: "Companies", icon: "Building2" },
    { href: "/admin/requests", label: "Requests", icon: "FileText" },
    { href: "/admin/transfers", label: "Transfers", icon: "ClipboardCheck" },
  ],
  staff: [
    { href: "/staff", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/staff/candidates", label: "Candidates", icon: "UserCheck" },
    { href: "/staff/requests", label: "Requests", icon: "FileText" },
    { href: "/staff/interviews", label: "Interviews", icon: "Calendar" },
  ],
  candidate: [
    { href: "/candidate", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/candidate/edit", label: "Profile", icon: "User" },
    { href: "/candidate/search", label: "Jobs", icon: "Search" },
    { href: "/candidate/applications", label: "Applications", icon: "FileText" },
  ],
  company: [
    { href: "/company", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/company/contacts", label: "Contacts", icon: "Users" },
    { href: "/company/requests", label: "Requests", icon: "FileText" },
  ],
  inspector: [
    { href: "/inspector", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/inspector/id-requests", label: "ID Requests", icon: "ShieldCheck" },
    { href: "/inspector/payments", label: "Payments", icon: "CreditCard" },
  ],
};

function resolveIcon(name: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    ClipboardCheck,
    UserCheck,
    Search,
    Calendar,
    User,
    ShieldCheck,
    CreditCard,
    Bug,
    BookOpen,
    GraduationCap,
    Settings,
  };
  return icons[name] ?? Bug;
}

export function TabBar({ role }: { role: Role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "home", label: "Home", href: `/${role}`, icon: "LayoutDashboard", pinned: true },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const navItems = workNav[role] ?? [];

  const openTab = (href: string, label: string) => {
    const existing = tabs.find((t) => t.href === href);
    if (existing) {
      setActiveTab(tabs.indexOf(existing));
      return;
    }
    const navItem = navItems.find((n) => n.href === href);
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      label,
      href,
      icon: navItem?.icon ?? "Bug",
      pinned: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(tabs.length);
  };

  const closeTab = (idx: number) => {
    setTabs((prev) => prev.filter((_, i) => i !== idx));
    if (activeTab >= idx) {
      setActiveTab(Math.max(0, activeTab - 1));
    }
  };

  const togglePin = (idx: number) => {
    setTabs((prev) => prev.map((t, i) => (i === idx ? { ...t, pinned: !t.pinned } : t)));
  };

  const [dragIdx, setDragIdx] = useState<number | null>(null);

  if (tabs.length === 0) return null;

  return (
    <nav className="flex items-center gap-0 min-h-[36px] px-1 pt-[3px] pb-0 border-b border-border overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label={`${role} workspace tabs`}>
      {tabs.map((tab, idx) => (
        <TabItem
          key={tab.id}
          tab={tab}
          idx={idx}
          isActive={idx === activeTab}
          role={role}
          onSelect={() => setActiveTab(idx)}
          onClose={() => closeTab(idx)}
          onPin={() => togglePin(idx)}
          onDragStart={(e, fromIdx) => {
            setDragIdx(fromIdx);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e, overIdx) => {
            e.preventDefault();
            if (dragIdx === null || dragIdx === overIdx) return;
            const reordered = [...tabs];
            const [moved] = reordered.splice(dragIdx, 1);
            reordered.splice(overIdx, 0, moved);
            setTabs(reordered);
            setDragIdx(overIdx);
          }}
          onDragEnd={() => setDragIdx(null)}
          onDragLeave={() => {}}
          isDragOver={false}
        />
      ))}

      {/* "+" tab creation button */}
      <div className="relative flex items-center shrink-0" ref={null as unknown as React.RefObject<HTMLDivElement>}>
        <button
          className={`inline-flex items-center justify-center shrink-0 w-[26px] h-[26px] p-0 border-0 rounded-sm bg-transparent text-muted-foreground cursor-pointer transition-colors ml-[2px] ${menuOpen ? "bg-muted text-foreground" : ""}`}
          type="button"
          aria-label="Open new tab"
          title="Open new tab"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 z-50 min-w-[180px] p-1 bg-card border border-border rounded-lg shadow-lg flex flex-col gap-[1px]" role="menu">
            {navItems.map((item) => (
              <button
                key={item.href}
                className="flex items-center gap-2 w-full px-[10px] py-[7px] border-0 rounded-sm bg-transparent text-foreground text-xs font-medium text-left cursor-pointer whitespace-nowrap transition-colors hover:bg-muted"
                role="menuitem"
                type="button"
                onClick={() => {
                  openTab(item.href, item.label);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function TabItem({
  tab,
  idx,
  isActive,
  role,
  onSelect,
  onClose,
  onPin,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  isDragOver,
}: {
  tab: Tab;
  idx: number;
  isActive: boolean;
  role: Role;
  onSelect: () => void;
  onClose: () => void;
  onPin: () => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  isDragOver: boolean;
}) {
  const [showPin, setShowPin] = useState(false);
  const IconComponent = resolveIcon(tab.icon);
  const iconEl = <IconComponent size={14} />;
  const isHome = tab.href === `/${role}`;

  const baseClasses = "relative flex items-center gap-0 min-w-0 max-w-[200px] px-[2px] py-1 border-0 rounded-t-sm bg-transparent text-muted-foreground text-xs font-medium whitespace-nowrap select-none cursor-default transition-colors hover:bg-muted hover:text-foreground group/tab";
  const activeClasses = isActive
    ? "bg-card text-foreground [&::after]:content-[''] [&::after]:absolute [&::after]:bottom-[-1px] [&::after]:left-2 [&::after]:right-2 [&::after]:h-[2px] [&::after]:rounded-t-[1px] [&::after]:bg-primary"
    : "";
  const dragOverClasses = isDragOver
    ? "outline-[1px] outline-dashed outline-primary/50"
    : "";
  const pinnedClasses = tab.pinned ? "opacity-95" : "";

  const className = [baseClasses, activeClasses, dragOverClasses, pinnedClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="tab"
      aria-selected={isActive}
      aria-label={`${tab.label}${tab.pinned ? " (pinned)" : ""}`}
      className={className}
      draggable={!isHome}
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      onMouseEnter={() => setShowPin(true)}
      onMouseLeave={() => setShowPin(false)}
    >
      {/* Drag handle (not for home tab) */}
      {!isHome && (
        <span className="inline-flex items-center justify-center shrink-0 w-[14px] h-full cursor-grab opacity-0 group-hover/tab:opacity-50 transition-opacity text-muted-foreground [&:active]:cursor-grabbing" aria-hidden="true">
          <GripVertical size={10} strokeWidth={1.5} />
        </span>
      )}

      {/* Tab content — click to activate */}
      <button
        className={`flex items-center gap-[5px] min-w-0 px-1 py-[3px] border-0 bg-none text-inherit font-inherit text-xs cursor-pointer truncate [&>svg]:shrink-0 [&>svg]:opacity-60 ${isActive ? '[&>svg]:opacity-100 [&>svg]:text-primary' : ''}`}
        type="button"
        onClick={onSelect}
        aria-label={`Navigate to ${tab.label}`}
      >
        {iconEl}
        <span className="truncate">{tab.label}</span>
      </button>

      {/* Pin toggle */}
      {!isHome && (showPin || tab.pinned) && (
        <button
          className={`inline-flex items-center justify-center shrink-0 w-[18px] h-[18px] p-0 border-0 rounded-sm bg-none text-muted-foreground cursor-pointer opacity-0 group-hover/tab:opacity-100 transition-opacity [&:hover]:opacity-100 [&:hover]:bg-card ${tab.pinned ? 'opacity-100 text-primary' : ''}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          aria-label={tab.pinned ? "Unpin tab" : "Pin tab"}
          title={tab.pinned ? "Unpin tab" : "Pin tab"}
        >
          {tab.pinned ? "📌" : "📍"}
        </button>
      )}

      {/* Close button (not for pinned or home) */}
      {!tab.pinned && !isHome && (
        <button
          className="inline-flex items-center justify-center shrink-0 w-[18px] h-[18px] p-0 ml-[1px] border-0 rounded-sm bg-none text-muted-foreground cursor-pointer opacity-0 group-hover/tab:opacity-60 transition-all hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${tab.label} tab`}
          title={`Close ${tab.label} tab`}
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
