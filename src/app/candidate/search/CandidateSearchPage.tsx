"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SessionUser } from "@/modules/auth/types";
import MatchScoreBadge from "@/components/matching/MatchScoreBadge";

// ─── Types ────────────────────────────────────────────────────────────

type SearchResultRow = {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  signal: string;
  country: string;
  university: string;
  company: string;
  store: string;
  rate: string;
  updated: string;
  flags: string[];
  skills: string[];
  score: number;
};

type FacetOption = {
  label: string;
  value: string;
  count: number;
  active: boolean;
};

type FacetGroup = {
  key: string;
  label: string;
  options: FacetOption[];
};

type SearchResponse = {
  rows: SearchResultRow[];
  facets: FacetGroup[];
  matchingCount: number;
  query: string;
  filter: string;
  source: { current: string; target: string; note: string };
};

const ITEMS_PER_PAGE = 60;

// ─── Component ─────────────────────────────────────────────────────────

export function CandidateSearchPage({ session }: { session: SessionUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [activeFacets, setActiveFacets] = useState<Record<string, string>>({});

  // Parse initial facets from URL
  useEffect(() => {
    const facets: Record<string, string> = {};
    const facetKeys = ["country", "university", "company", "skill", "gender", "profile", "assignment", "document"];
    for (const key of facetKeys) {
      const val = searchParams.get(key);
      if (val) facets[key] = val;
    }
    setActiveFacets(facets);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch search results
  const doSearch = useCallback(async (q: string, p: number, facets: Record<string, string>) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(p));
      params.set("role", "candidate");

      for (const [key, val] of Object.entries(facets)) {
        if (val) params.set(key, val);
      }

      const res = await fetch(`/api/candidates/search?${params.toString()}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Search failed (${res.status})`);
      }
      const data: SearchResponse = await res.json();
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial search
  useEffect(() => {
    doSearch(query, page, activeFacets);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doSearch(query, 1, activeFacets);
    updateUrl(query, 1, activeFacets);
  };

  // Toggle a facet filter
  const toggleFacet = (key: string, value: string) => {
    const next = { ...activeFacets };
    if (next[key] === value) {
      delete next[key];
    } else {
      next[key] = value;
    }
    setActiveFacets(next);
    setPage(1);
    doSearch(query, 1, next);
    updateUrl(query, 1, next);
  };

  // Pagination
  const goToPage = (p: number) => {
    setPage(p);
    doSearch(query, p, activeFacets);
    updateUrl(query, p, activeFacets);
  };

  // Update URL without full navigation
  const updateUrl = (q: string, p: number, facets: Record<string, string>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    for (const [key, val] of Object.entries(facets)) {
      if (val) params.set(key, val);
    }
    const qs = params.toString();
    router.replace(`/candidate/search${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const totalPages = results ? Math.ceil(results.matchingCount / ITEMS_PER_PAGE) : 0;

  return (
    <div className="candidateSearchPage">
      {/* Search header */}
      <div className="searchHeader">
        <h1>Search Candidates</h1>
        <p className="searchSubtitle">
          Find candidates by name, skills, or keyword — powered by Typesense
        </p>
      </div>

      {/* Search form */}
      <form className="searchForm" onSubmit={handleSubmit}>
        <div className="searchInputGroup">
          <input
            ref={inputRef}
            type="text"
            className="searchInput"
            placeholder="Search by name, email, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="searchButton" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="searchError">
          <p>Search error: {error}</p>
          <button onClick={() => doSearch(query, page, activeFacets)} className="retryButton">
            Retry
          </button>
        </div>
      )}

      {/* Results area */}
      <div className="searchResultsLayout">
        {/* Facet sidebar */}
        {results && results.facets.length > 0 && (
          <aside className="searchFacets">
            {results.facets.map((group) => (
              <div key={group.key} className="facetGroup">
                <h3 className="facetGroupTitle">{group.label}</h3>
                <div className="facetOptions">
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      className={`facetChip ${option.active ? "facetChipActive" : ""}`}
                      onClick={() => toggleFacet(group.key, option.value)}
                    >
                      <span className="facetLabel">{option.label}</span>
                      <span className="facetCount">{option.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Results list */}
        <main className="searchResults">
          {/* Source indicator */}
          {results && (
            <div className="searchMeta">
              <span className="matchingCount">
                {results.matchingCount.toLocaleString()} candidate{results.matchingCount !== 1 ? "s" : ""} found
              </span>
              <span className="searchSource">{results.source.current}</span>
            </div>
          )}

          {loading && (
            <div className="searchLoadingState">
              <div className="spinner" />
              <p>Searching...</p>
            </div>
          )}

          {!loading && results && results.rows.length === 0 && (
            <div className="searchEmpty">
              <div className="emptyIcon">🔍</div>
              <h2>No candidates found</h2>
              <p>Try adjusting your search query or clearing facet filters.</p>
            </div>
          )}

          {!loading && results && results.rows.length > 0 && (
            <>
              <div className="resultsList">
                {results.rows.map((row) => (
                  <div key={row.id} className="resultCard">
                    <div className="resultCardHeader">
                      <div className="resultNameGroup">
                        <h3 className="resultName">{row.name}</h3>
                        <span className="resultUid">{row.uid}</span>
                      </div>
                      <MatchScoreBadge score={row.score} />
                    </div>

                    <div className="resultCardBody">
                      <div className="resultDetail">
                        <span className="detailLabel">Email</span>
                        <span className="detailValue">{row.email}</span>
                      </div>
                      <div className="resultDetail">
                        <span className="detailLabel">Phone</span>
                        <span className="detailValue">{row.phone}</span>
                      </div>
                      <div className="resultDetail">
                        <span className="detailLabel">Location</span>
                        <span className="detailValue">{row.country}</span>
                      </div>
                      <div className="resultDetail">
                        <span className="detailLabel">University</span>
                        <span className="detailValue">{row.university}</span>
                      </div>
                      {row.company !== "No company" && (
                        <div className="resultDetail">
                          <span className="detailLabel">Company</span>
                          <span className="detailValue">{row.company}</span>
                        </div>
                      )}
                      <div className="resultDetail">
                        <span className="detailLabel">Rate</span>
                        <span className="detailValue">{row.rate}</span>
                      </div>
                    </div>

                    {row.skills.length > 0 && (
                      <div className="resultSkills">
                        {row.skills.map((skill) => (
                          <span key={skill} className="skillTag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {row.flags.length > 0 && (
                      <div className="resultFlags">
                        {row.flags.map((flag) => (
                          <span key={flag} className="flagTag">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pageButton"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    ← Previous
                  </button>
                  <div className="pageInfo">
                    Page {page} of {totalPages}
                  </div>
                  <button
                    className="pageButton"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
