"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CandidateSearchRow = {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  country: string;
  university: string;
  company: string;
  rate: string;
  skills: string[];
  score: number;
};

type SearchResponse = {
  rows: CandidateSearchRow[];
  matchingCount: number;
};

// ---------------------------------------------------------------------------
// Debounce hook
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CandidateComboboxProps {
  basePath: "/admin/candidates" | "/staff/candidates" | string;
  /** Optional placeholder for the trigger button. Default: "Search candidates..." */
  placeholder?: string;
  /** Optional class name for the trigger button */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CandidateCombobox({
  basePath,
  placeholder = "Search candidates...",
  className,
}: CandidateComboboxProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CandidateSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const params = new URLSearchParams({ q: debouncedQuery, limit: "10" });

    fetch(`/api/candidates/search?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json() as Promise<SearchResponse>;
      })
      .then((data) => {
        setResults(data.rows ?? []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResults([]);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (candidateId: number) => {
      setOpen(false);
      router.push(`${basePath}/${candidateId}`);
    },
    [basePath, router],
  );

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
      setResults([]);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Search candidates"
          className={cn(
            "w-[280px] justify-between text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <SearchIcon className="size-4 shrink-0" />
            {placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search candidates..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && results.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 && debouncedQuery.trim() ? (
              <CommandEmpty>No candidates found</CommandEmpty>
            ) : null}

            {results.length > 0 && (
              <CommandGroup heading="Candidates">
                {results.map((candidate) => (
                  <CommandItem
                    key={candidate.id}
                    value={String(candidate.id)}
                    onSelect={() => handleSelect(candidate.id)}
                    className="flex items-start gap-3 py-3"
                  >
                    {/* Avatar circle */}
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                      {candidate.name
                        .split(" ")
                        .map((w) => w[0])
                        .filter(Boolean)
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Candidate info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {candidate.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-xs px-1.5"
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {candidate.email}
                      </div>

                      {/* Skills tags */}
                      {candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <CheckIcon className="size-4 shrink-0 opacity-0 group-data-[selected=true]:opacity-100" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
