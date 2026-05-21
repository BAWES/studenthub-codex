"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  { keys: "Cmd/Ctrl K", label: "Open command menu" },
  { keys: "/", label: "Focus workspace search" },
  { keys: "G then H", label: "Go to command workspace" },
  { keys: "G then R", label: "Go to requests" },
  { keys: "G then C", label: "Go to candidates or company" },
  { keys: "Esc", label: "Close menu or clear focus" }
];

export function HubShortcuts({ commands }: HubShortcutsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const sequenceRef = useRef("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands.slice(0, 18);
    return commands
      .filter((command) =>
        [command.title, command.subtitle, command.section, command.shortcut]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 18);
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, HubCommand[]>();
    for (const command of filteredCommands) {
      groups.set(command.section, [...(groups.get(command.section) ?? []), command]);
    }
    return [...groups.entries()];
  }, [filteredCommands]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable === true;
      const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const wantsShortcuts = !isTyping && event.key === "?";
      const wantsSearch = !isTyping && event.key === "/";

      if (open) {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          setQuery("");
          return;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((index) => Math.min(index + 1, filteredCommands.length - 1));
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((index) => Math.max(index - 1, 0));
          return;
        }
        if (event.key === "Enter" && filteredCommands[activeIndex]) {
          event.preventDefault();
          visit(filteredCommands[activeIndex].href);
          return;
        }
      }

      if (wantsCommand || wantsShortcuts) {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(0);
        setQuery(wantsShortcuts ? "shortcut" : "");
        window.setTimeout(() => inputRef.current?.focus(), 0);
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
  }, [activeIndex, commands, filteredCommands, open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <>
      <button className="commandLauncher" type="button" onClick={() => setOpen(true)}>
        <span>Command</span>
        <kbd>⌘K</kbd>
      </button>

      {open ? (
        <div className="commandOverlay" role="dialog" aria-modal="true" aria-label="Command menu">
          <button className="commandScrim" aria-label="Close command menu" type="button" onClick={() => setOpen(false)} />
          <section className="commandMenu">
            <div className="commandInputWrap">
              <span>⌘</span>
              <input
                ref={inputRef}
                autoFocus
                placeholder="Jump to a view, search visible records, or run an action..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>Esc</kbd>
            </div>
            <div className="commandList">
              {groupedCommands.length ? (
                groupedCommands.map(([section, items]) => (
                  <div className="commandGroup" key={section}>
                    <h3>{section}</h3>
                    {items.map((command) => {
                      const absoluteIndex = filteredCommands.findIndex((item) => item.id === command.id);
                      return (
                        <button
                          className={absoluteIndex === activeIndex ? "active" : ""}
                          key={command.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(absoluteIndex)}
                          onClick={() => visit(command.href)}
                        >
                          <span>
                            <strong>{command.title}</strong>
                            <small>{command.subtitle}</small>
                          </span>
                          {command.shortcut ? <kbd>{command.shortcut}</kbd> : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="commandEmpty">
                  <strong>No command found</strong>
                  <span>Try a view, record name, scope, or shortcut.</span>
                </div>
              )}
            </div>
            <div className="shortcutGrid">
              {shortcutRows.map((row) => (
                <div key={row.keys}>
                  <kbd>{row.keys}</kbd>
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function visit(href: string) {
  window.location.href = href;
}
