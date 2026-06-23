"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { searchCandidatesForPalette, type CandidatePaletteResult } from "@/modules/workspace/searchPalette";

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

const builtinShortcuts = [
  { keys: "Cmd/Ctrl K", label: "Open command menu" },
  { keys: "/", label: "Focus workspace search" },
  { keys: "G then H", label: "Go to command workspace" },
  { keys: "G then R", label: "Go to requests" },
  { keys: "G then C", label: "Go to candidates or company" },
  { keys: "Esc", label: "Close menu or clear focus" },
];

export function HubShortcuts({ commands }: HubShortcutsProps) {
  const [open, setOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdCandidates, setCmdCandidates] = useState<CandidatePaletteResult[]>([]);
  const sequenceRef = useRef("");

  // Debounced candidate search via Typesense
  useEffect(() => {
    if (!open || !cmdQuery || cmdQuery.length < 2) {
      setCmdCandidates([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchCandidatesForPalette(cmdQuery);
        setCmdCandidates(results);
      } catch {
        setCmdCandidates([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [cmdQuery, open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable === true;
      const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const wantsShortcuts = !isTyping && event.key === "?";

      if (wantsCommand || wantsShortcuts) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (!isTyping && event.key === "/") {
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
  }, [commands, open]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <span>Command</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search candidates globally, jump to a view, or run an action..."
          data-command-search
          value={cmdQuery}
          onValueChange={setCmdQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-4 text-center">
              <strong className="block text-sm text-foreground">No command found</strong>
              <span className="text-xs text-muted-foreground">Try a view, record name, scope, or shortcut.</span>
            </div>
          </CommandEmpty>
          {groupBySection(commands).map(([section, items]) => (
            <CommandGroup heading={section} key={section}>
              {items.map((command) => (
                <CommandItem
                  key={command.id}
                  value={`${command.title} ${command.subtitle} ${command.section}`}
                  onSelect={() => {
                    setOpen(false);
                    visit(command.href);
                  }}
                >
                  <div className="flex flex-col">
                    <strong className="text-sm text-foreground">{command.title}</strong>
                    <small className="text-xs text-muted-foreground">{command.subtitle}</small>
                  </div>
                  {command.shortcut ? (
                    <CommandShortcut>{command.shortcut}</CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {cmdCandidates.length > 0 && (
            <CommandGroup heading="Candidates">
              {cmdCandidates.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`candidate-${c.name} ${c.email}`}
                  onSelect={() => {
                    setOpen(false);
                    visit(`/staff/candidates/${c.id}`);
                  }}
                >
                  <div className="flex flex-col">
                    <strong className="text-sm text-foreground">{c.name}</strong>
                    <small className="text-xs text-muted-foreground">{c.email || c.uid}</small>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Shortcuts">
            {builtinShortcuts.map((shortcut) => (
              <CommandItem key={shortcut.keys} value={shortcut.label} onSelect={() => setOpen(false)}>
                <span className="text-sm text-foreground">{shortcut.label}</span>
                <CommandShortcut>{shortcut.keys}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function groupBySection(commands: HubCommand[]): [string, HubCommand[]][] {
  const groups = new Map<string, HubCommand[]>();
  for (const command of commands) {
    const list = groups.get(command.section) ?? [];
    list.push(command);
    groups.set(command.section, list);
  }
  return [...groups.entries()];
}

function visit(href: string) {
  window.location.href = href;
}
