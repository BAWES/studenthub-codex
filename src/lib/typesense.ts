import { Client as TypesenseClient } from "typesense";

const TYPESENSE_HOST = process.env.TYPESENSE_HOST ?? "localhost";
const TYPESENSE_PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const TYPESENSE_PROTOCOL = (process.env.TYPESENSE_PROTOCOL ?? "http") as "http" | "https";
const TYPESENSE_API_KEY = typeof process !== "undefined" ? (process.env.TYPESENSE_API_KEY ?? "") : "";


const globalForTypesense = globalThis as unknown as {
  typesense?: TypesenseClient;
};

export function getTypesenseClient(): TypesenseClient {
  if (!globalForTypesense.typesense) {
    globalForTypesense.typesense = new TypesenseClient({
      nodes: [
        {
          host: TYPESENSE_HOST,
          port: TYPESENSE_PORT,
          protocol: TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 5,
    });
  }
  return globalForTypesense.typesense;
}

export const CANDIDATES_COLLECTION = "candidates";

export const candidateCollectionSchema = {
  name: CANDIDATES_COLLECTION,
  fields: [
    { name: "candidate_id", type: "int32" as const },
    { name: "candidate_name", type: "string" as const },
    { name: "candidate_name_ar", type: "string" as const },
    { name: "candidate_email", type: "string" as const },
    { name: "candidate_phone", type: "string" as const },
    { name: "candidate_uid", type: "string" as const },
    { name: "country_id", type: "int32" as const, facet: true },
    { name: "country_name", type: "string" as const, facet: true },
    { name: "university_id", type: "int32" as const, facet: true },
    { name: "university_name", type: "string" as const, facet: true },
    { name: "company_id", type: "int32" as const, facet: true },
    { name: "company_name", type: "string" as const, facet: true },
    { name: "store_name", type: "string" as const },
    { name: "skills", type: "string[]" as const, facet: true },
    { name: "candidate_gender", type: "int32" as const, facet: true },
    { name: "candidate_status", type: "int32" as const },
    { name: "approved", type: "int32" as const },
    { name: "is_incomplete_profile", type: "bool" as const },
    { name: "candidate_civil_need_verification", type: "bool" as const },
    { name: "has_resume", type: "bool" as const },
    { name: "store_id", type: "int32" as const },
    { name: "candidate_updated_at", type: "int64" as const },
    { name: "tags", type: "string[]" as const },
    { name: "candidate_hourly_rate", type: "float" as const },
    { name: "currency_code", type: "string" as const },
  ],
  default_sorting_field: "candidate_updated_at",
};

export interface CandidateDocument {
  candidate_id: number;
  candidate_name: string;
  candidate_name_ar: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_uid: string;
  country_id: number;
  country_name: string;
  university_id: number;
  university_name: string;
  company_id: number;
  company_name: string;
  store_name: string;
  store_id: number;
  skills: string[];
  tags: string[];
  candidate_gender: number;
  candidate_status: number;
  approved: number;
  is_incomplete_profile: boolean;
  candidate_civil_need_verification: boolean;
  has_resume: boolean;
  candidate_hourly_rate: number;
  currency_code: string;
  candidate_updated_at: number;
}
