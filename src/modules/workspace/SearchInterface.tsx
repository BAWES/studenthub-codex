"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown, ChevronUp, Bookmark, Loader2, SearchX } from "lucide-react";

// ── Types ──────────────────────────────────────────────────

export type QuickFilter = {
  id: string;
  label: string;
};

export type AdvancedFilter = {
  key: string;
  label: string;
  options: string[];
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
};

export type SearchInterfaceProps = {
  /** Current search query. */
  query: string;
  /** Query change handler. */
  onQueryChange: (value: string) => void;
  /** Search submission handler (called on Enter). */
  onSearch: () => void;
  /** Optional quick filter chips shown below the search bar. */
  quickFilters?: QuickFilter[];
  /** Currently active quick filter id. */
  activeFilter?: string;
  /** Quick filter change handler. */
  onFilterChange?: (filterId: string) => void;
  /** Advanced filter definitions (shown on toggle). */
  filters?: AdvancedFilter[];
  /** Current advanced filter values map. */
  filterValues?: Record<string, string>;
  /** Advanced filter value change handler. */
  onFilterChangeAdvanced?: (key: string, value: string) => void;
  /** Saved searches list. */
  savedSearches?: SavedSearch[];
  /** Saved search selection handler. */
  onSavedSearchSelect?: (saved: SavedSearch) => void;
  /** Number of search results to display as a count. */
  resultsCount?: number;
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** When true, disables inputs and shows a loading spinner. */
  loading?: boolean;
  /** Rich empty-state message shown when no results match. Hidden while loading. */
  emptyResults?: string;
  /** Optional className override. */
  className?: string;
};

// ── Component ──────────────────────────────────────────────

export function SearchInterface({
  query,
  onQueryChange,
  onSearch,
  quickFilters,
  activeFilter,
  onFilterChange,
  filters,
  filterValues = {},
  onFilterChangeAdvanced,
  savedSearches,
  onSavedSearchSelect,
  resultsCount,
  placeholder = "Search...",
  loading = false,
  emptyResults,
  className,
}: SearchInterfaceProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      onSearch();
    }
  };

  const showEmptyResults = !loading && emptyResults;

  return (
    <section className={className}>
      {/* Search input bar */}
      <div className="searchInterfaceBar">
        <div className="searchInputWrap">
          {loading ? (
            <Loader2 size={16} className="searchIcon animate-spin" aria-label="Loading" />
          ) : (
            <Search size={16} className="searchIcon" aria-hidden="true" />
          )}
          <input
            data-command-search
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="searchInput"
            aria-label="Search"
            disabled={loading}
          />
          {query && !loading ? (
            <button
              type="button"
              className="searchClear"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Filter toggle */}
        {filters && filters.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            disabled={loading}
          >
            Filters
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        ) : null}

        {/* Saved searches toggle */}
        {savedSearches && savedSearches.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaved(!showSaved)}
            aria-expanded={showSaved}
            disabled={loading}
          >
            <Bookmark size={14} />
            Saved
          </Button>
        ) : null}

        {/* Results count */}
        {resultsCount !== undefined ? (
          <span className="searchResultsCount">{resultsCount} results</span>
        ) : null}
      </div>

      {/* Quick filter chips */}
      {quickFilters && quickFilters.length > 0 ? (
        <div className="searchQuickFilters" role="group" aria-label="Quick filters">
          {quickFilters.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`quickFilterChip ${activeFilter === chip.id ? "active" : ""}`}
              onClick={() => onFilterChange?.(chip.id)}
              aria-pressed={activeFilter === chip.id}
              disabled={loading}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Advanced filters panel */}
      {showFilters && filters && filters.length > 0 ? (
        <div className="searchAdvancedFilters" role="group" aria-label="Advanced filters">
          {filters.map((filter) => (
            <div className="advancedFilterRow" key={filter.key}>
              <label className="advancedFilterLabel">{filter.label}</label>
              <select
                className="advancedFilterSelect"
                value={filterValues[filter.key] || ""}
                onChange={(e) => onFilterChangeAdvanced?.(filter.key, e.target.value)}
                disabled={loading}
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      {/* Saved searches panel */}
      {showSaved && savedSearches && savedSearches.length > 0 ? (
        <div className="searchSavedSearches" role="listbox" aria-label="Saved searches">
          {savedSearches.map((saved) => (
            <button
              key={saved.id}
              type="button"
              className="savedSearchItem"
              onClick={() => onSavedSearchSelect?.(saved)}
              role="option"
              aria-selected={saved.query === query}
              disabled={loading}
            >
              <Bookmark size={14} />
              <span className="savedSearchName">{saved.name}</span>
              <span className="savedSearchQuery">{saved.query}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Empty results */}
      {showEmptyResults ? (
        <div className="searchEmptyResults" role="status">
          <SearchX size={32} aria-label="No results" />
          <p className="searchEmptyResultsText">{emptyResults}</p>
        </div>
      ) : null}
    </section>
  );
}
