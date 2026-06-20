"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
