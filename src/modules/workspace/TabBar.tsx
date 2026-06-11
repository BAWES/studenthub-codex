"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  X,
  Pin,
  PinOff,
  GripVertical,
  User,
  Users,
  Building2,
  FileCheck,
  ArrowRightLeft,
  Monitor,
  Calendar,
  Mail,
  ClipboardList,
  CreditCard,
  Phone,
  Store,
  Search,
  LayoutGrid,
} from "lucide-react";
import { useTabs, type TabEntry } from "./TabContext";
import type { Role } from "@/modules/auth/types";

// ─── Icon map ────────────────────────────────────────────────────────────

const iconRegistry: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  User,
  Users,
  Building2,
  FileCheck,
  ArrowRightLeft,
  Monitor,
  Calendar,
  Mail,
  ClipboardList,
  CreditCard,
  Phone,
  Store,
  Search,
  LayoutGrid,
};

function resolveIcon(name: string | null): ReactNode {
  if (!name) return <DotIcon />;
  const Icon = iconRegistry[name];
  if (!Icon) return <DotIcon />;
  return <Icon size={14} strokeWidth={2} aria-hidden="true" />;
}

function DotIcon({ size = 12, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

// ─── TabBar ─────────────────────────────────────────────────────────────

/**
 * TabBar — A browser-style tab bar with open, close, pin, and reorder.
 *
 * Renders inside the WorkspaceOS shell, above the page content.
 * Uses TabContext for state management with localStorage persistence.
 */
export function TabBar({ role }: { role: Role }) {
  const { tabs, activeTabId, closeTab, pinTab, setActive, moveTab } = useTabs();

  // ── Drag-to-reorder state ───────────────────────────────────────
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragFromIdx = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (_e: React.DragEvent, idx: number) => {
      dragFromIdx.current = idx;
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragFromIdx.current !== null && dragFromIdx.current !== idx) {
        setDragOverIdx(idx);
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIdx: number) => {
      e.preventDefault();
      const fromIdx = dragFromIdx.current;
      if (fromIdx !== null && fromIdx !== toIdx) {
        moveTab(fromIdx, toIdx);
      }
      dragFromIdx.current = null;
      setDragOverIdx(null);
    },
    [moveTab],
  );

  const handleDragEnd = useCallback(() => {
    dragFromIdx.current = null;
    setDragOverIdx(null);
  }, []);

  if (tabs.length === 0) return null;

  return (
    <nav className="workspaceTabs" role="tablist" aria-label={`${role} workspace tabs`}>
      {tabs.map((tab, idx) => (
        <TabItem
          key={tab.id}
          tab={tab}
          idx={idx}
          isActive={tab.id === activeTabId}
          role={role}
          onSelect={() => setActive(tab.id)}
          onClose={() => closeTab(tab.id)}
          onPin={() => pinTab(tab.id)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragEnd}
          isDragOver={dragOverIdx === idx}
        />
      ))}
    </nav>
  );
}

// ─── TabItem ────────────────────────────────────────────────────────────

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
  onDrop,
  onDragEnd,
  onDragLeave,
  isDragOver,
}: {
  tab: TabEntry;
  idx: number;
  isActive: boolean;
  role: Role;
  onSelect: () => void;
  onClose: () => void;
  onPin: () => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  isDragOver: boolean;
}) {
  const [showPin, setShowPin] = useState(false);
  const iconEl = resolveIcon(tab.icon);
  const isHome = tab.href === `/${role}`;

  const className = [
    "workspaceTab",
    isActive ? "active" : "",
    isDragOver ? "dragOver" : "",
    tab.pinned ? "pinned" : "",
  ]
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
      onDrop={(e) => onDrop(e, idx)}
      onDragEnd={onDragEnd}
      onDragLeave={onDragEnd}
      onMouseEnter={() => setShowPin(true)}
      onMouseLeave={() => setShowPin(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        onPin();
      }}
    >
      {/* Drag handle (not for home tab) */}
      {!isHome && (
        <span className="workspaceTabDragHandle" aria-hidden="true">
          <GripVertical size={10} strokeWidth={1.5} />
        </span>
      )}

      {/* Tab content — click to activate */}
      <button
        className="workspaceTabButton"
        type="button"
        onClick={onSelect}
        aria-label={`Navigate to ${tab.label}`}
      >
        {iconEl}
        <span className="workspaceTabLabel">{tab.label}</span>
      </button>

      {/* Pin toggle */}
      {!isHome && (showPin || tab.pinned) && (
        <button
          className="workspaceTabPin"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          aria-label={tab.pinned ? "Unpin tab" : "Pin tab"}
          title={tab.pinned ? "Unpin tab" : "Pin tab"}
        >
          {tab.pinned ? <PinOff size={11} strokeWidth={1.5} /> : <Pin size={11} strokeWidth={1.5} />}
        </button>
      )}

      {/* Close button (not for pinned or home) */}
      {!tab.pinned && !isHome && (
        <button
          className="workspaceTabClose"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${tab.label} tab`}
          title="Close tab"
        >
          <X size={11} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
