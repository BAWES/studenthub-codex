"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import type { OSCommand } from "@/components/ui/CommandPalette";

export type HubCommand = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  href: string;
  shortcut?: string;
};

type HubShortcutsProps = {
  commands: HubCommand[];
};

const shortcutRows = [
  { keys: "⌘K", label: "Open command menu" },
  { keys: "/", label: "Focus workspace search" },
  { keys: "G H", label: "Go to command workspace" },
  { keys: "G R", label: "Go to requests" },
  { keys: "G C", label: "Go to candidates or company" },
  { keys: "Esc", label: "Close menu or clear focus" }
];

// Re-type HubCommands as OSCommands for the shared component
function toOSCommands(commands: HubCommand[]): OSCommand[] {
  return commands.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    section: c.section,
    href: c.href,
    shortcut: c.shortcut,
  }));
}

export function HubShortcuts({ commands }: HubShortcutsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const sequenceRef = useRef("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const osCommands = useMemo(() => toOSCommands(commands), [commands]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return osCommands.slice(0, 18);
    return osCommands
      .filter((command) =>
        [command.title, command.subtitle, command.section, command.shortcut]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 18);
  }, [osCommands, query]);

  const handleVisit = useCallback((href: string) => {
    setOpen(false);
    setQuery("");
    window.location.href = href;
  }, []);

  // G-chord keyboard navigation (outside command palette)
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable === true;
      const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const wantsShortcuts = !isTyping && event.key === "?";

      // Open command palette
      if (wantsCommand || wantsShortcuts) {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(0);
        setQuery(wantsShortcuts ? "shortcut" : "");
        return;
      }

      // G-chord navigation (when palette is closed)
      if (!open && !isTyping && event.key.toLowerCase() === "g") {
        sequenceRef.current = "g";
        window.setTimeout(() => { sequenceRef.current = ""; }, 900);
        return;
      }

      if (!open && !isTyping && sequenceRef.current === "g") {
        const key = event.key.toLowerCase();
        const command = osCommands.find((item) => item.shortcut?.toLowerCase() === `g ${key}`);
        if (command) {
          event.preventDefault();
          sequenceRef.current = "";
          handleVisit(command.href);
        }
        return;
      }

      // / → focus search
      if (!open && !isTyping && event.key === "/") {
        const input = document.querySelector<HTMLInputElement>("[data-command-search]");
        if (!input) return;
        event.preventDefault();
        input.focus();
        input.select();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, osCommands, handleVisit]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <>
      <button className="commandLauncher" type="button" onClick={() => setOpen(true)}>
        <span>Command</span>
        <kbd>⌘K</kbd>
      </button>

      <CommandPalette
        open={open}
        query={query}
        onQueryChange={setQuery}
        selectedIndex={activeIndex}
        onSelectIndex={setActiveIndex}
        onClose={() => { setOpen(false); setQuery(""); }}
        onVisit={handleVisit}
        commands={osCommands}
        filtered={filteredCommands}
        chords={shortcutRows}
        inputRef={inputRef}
      />
    </>
  );
}
