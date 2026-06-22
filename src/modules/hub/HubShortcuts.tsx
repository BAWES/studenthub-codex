"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

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
  { keys: "G then H", label: "Go to command workspace" },
  { keys: "G then R", label: "Go to requests" },
  { keys: "G then C", label: "Go to candidates or company" },
  { keys: "Esc", label: "Close menu or clear focus" },
];

export function HubShortcuts({ commands }: HubShortcutsProps) {
  const [open, setOpen] = useState(false);
  const sequenceRef = useRef("");

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, HubCommand[]>();
    for (const command of commands) {
      groups.set(command.section, [...(groups.get(command.section) ?? []), command]);
    }
    return [...groups.entries()];
  }, [commands]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable === true;
      const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const wantsShortcuts = !isTyping && event.key === "?";
      const wantsSearch = !isTyping && event.key === "/";

      if (wantsCommand || wantsShortcuts) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (wantsSearch) {
        const input = document.querySelector<HTMLInputElement>("[data-command-search]");
        if (!input) return;
        event.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (!isTyping && event.key.toLowerCase() === "g") {
        sequenceRef.current = "g";
        window.setTimeout(() => {
          sequenceRef.current = "";
        }, 900);
        return;
      }

      if (!isTyping && sequenceRef.current === "g") {
        const key = event.key.toLowerCase();
        const command = commands.find((item) => item.shortcut?.toLowerCase() === `g ${key}`);
        if (command) {
          event.preventDefault();
          sequenceRef.current = "";
          visit(command.href);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commands]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <span>Commands</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a view, search visible records, or run an action..." />
        <CommandList>
          {groupedCommands.length ? (
            groupedCommands.map(([section, items]) => (
              <CommandGroup key={section} heading={section}>
                {items.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => {
                      visit(command.href);
                      setOpen(false);
                    }}
                  >
                    <span>
                      <strong>{command.title}</strong>
                      {command.subtitle ? (
                        <span className="ml-1 text-xs text-muted-foreground">{command.subtitle}</span>
                      ) : null}
                    </span>
                    {command.shortcut ? <CommandShortcut>{command.shortcut}</CommandShortcut> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          ) : (
            <CommandEmpty>
              <strong>No command found</strong>
              <span className="ml-1 text-xs text-muted-foreground">
                Try a view, record name, scope, or shortcut.
              </span>
            </CommandEmpty>
          )}
        </CommandList>

        {/* Shortcut reference grid */}
        <div className="border-t border-border p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {shortcutRows.map((row) => (
              <div key={row.keys} className="flex items-center gap-2 text-xs">
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {row.keys}
                </kbd>
                <span className="text-muted-foreground">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CommandDialog>
    </>
  );
}

function visit(href: string) {
  window.location.href = href;
}
