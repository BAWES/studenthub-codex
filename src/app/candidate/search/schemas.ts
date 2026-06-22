import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schema
// ---------------------------------------------------------------------------

export const searchCandidatesSchema = z.object({
  query: z.string().optional(),
  filter: z.enum(["all", "active", "needs-review", "incomplete", "civil-id"]).optional(),
  role: z.enum(["admin", "staff", "candidate"]).optional(),
  staffId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  country: z.string().optional(),
  university: z.string().optional(),
  company: z.string().optional(),
  skill: z.string().optional(),
  gender: z.string().optional(),
  profile: z.enum(["complete", "incomplete"]).optional(),
  assignment: z.enum(["assigned", "unassigned"]).optional(),
  document: z.enum(["resume", "no-resume", "civil-id"]).optional(),
  visibility: z.enum(["all", "assigned"]).optional(),
  candidateId: z.number().int().positive().optional(),
  tabIds: z.array(z.number().int().positive()).optional(),
  selectedIds: z.array(z.number().int().positive()).optional(),
});

export type SearchCandidatesInput = z.input<typeof searchCandidatesSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateSearchRowSchema = z.object({
  id: z.number().int(),
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  status: z.string(),
  signal: z.string(),
  country: z.string(),
  university: z.string(),
  company: z.string(),
  store: z.string(),
  rate: z.string(),
  updated: z.string(),
  flags: z.array(z.string()),
  skills: z.array(z.string()),
  score: z.number(),
});

export const searchParamStateSchema = z.object({
  country: z.string(),
  university: z.string(),
  company: z.string(),
  skill: z.string(),
  gender: z.string(),
  profile: z.string(),
  assignment: z.string(),
  document: z.string(),
});

export const searchMetricRowSchema = z.object({
  label: z.string(),
  value: z.number().int(),
  note: z.string(),
});

export const facetOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  count: z.number().int(),
  active: z.boolean(),
});

export const candidateSearchFacetSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(facetOptionSchema),
});

export const openTabSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  subtitle: z.string(),
  status: z.string(),
});

export const sourceInfoSchema = z.object({
  current: z.string(),
  target: z.string(),
  note: z.string(),
});

export const candidateSearchResultSchema = z.object({
  role: z.string(),
  query: z.string(),
  filter: z.string(),
  visibility: z.string(),
  page: z.number().int(),
  totalPages: z.number().int(),
  assignedCount: z.number().int().nullable(),
  matchingCount: z.number().int(),
  selectedId: z.number().int().nullable().optional(),
  selectedBlocked: z.boolean(),
  openTabs: z.array(openTabSchema),
  params: searchParamStateSchema,
  rows: z.array(candidateSearchRowSchema),
  metrics: z.array(searchMetricRowSchema),
  facets: z.array(candidateSearchFacetSchema),
  source: sourceInfoSchema,
  selected: z.any().nullable(),
  selectedActions: z.any(),
});

export type CandidateSearchRow = z.output<typeof candidateSearchRowSchema>;
export type CandidateSearchResult = z.output<typeof candidateSearchResultSchema>;
export type SearchParamState = z.output<typeof searchParamStateSchema>;
export type CandidateSearchFacet = z.output<typeof candidateSearchFacetSchema>;
export type FacetOption = z.output<typeof facetOptionSchema>;
export type OpenTab = z.output<typeof openTabSchema>;
export type SearchMetricRow = z.output<typeof searchMetricRowSchema>;
