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
export const STORES_COLLECTION = "stores";
export const COMPANIES_COLLECTION = "companies";

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

export const storeCollectionSchema = {
  name: STORES_COLLECTION,
  fields: [
    { name: "store_id", type: "int32" as const },
    { name: "store_name", type: "string" as const },
    { name: "store_location", type: "string" as const },
    { name: "store_status", type: "int32" as const, facet: true },
    { name: "store_total_candidates", type: "int32" as const },
    { name: "store_updated_at", type: "int64" as const },
    { name: "company_id", type: "int32" as const, facet: true },
    { name: "company_name", type: "string" as const, facet: true },
    { name: "brand_name", type: "string" as const, facet: true },
    { name: "mall_name", type: "string" as const },
    { name: "manager_name", type: "string" as const },
    { name: "deleted", type: "int32" as const },
  ],
  default_sorting_field: "store_updated_at",
};

export interface StoreDocument {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  store_total_candidates: number;
  store_updated_at: number;
  company_id: number;
  company_name: string;
  brand_name: string;
  mall_name: string;
  manager_name: string;
  deleted: number;
}

export const companyCollectionSchema = {
  name: COMPANIES_COLLECTION,
  fields: [
    { name: "company_id", type: "int32" as const },
    { name: "company_name", type: "string" as const },
    { name: "company_common_name_en", type: "string" as const },
    { name: "company_email", type: "string" as const },
    { name: "company_approved_to_hire", type: "bool" as const, facet: true },
    { name: "no_of_active_requests", type: "int32" as const },
    { name: "company_hourly_rate", type: "float" as const },
    { name: "currency_code", type: "string" as const },
    { name: "company_updated_at", type: "int64" as const },
    { name: "staff_name", type: "string" as const },
    { name: "country_name", type: "string" as const, facet: true },
    { name: "deleted", type: "int32" as const },
  ],
  default_sorting_field: "company_updated_at",
};

export interface CompanyDocument {
  company_id: number;
  company_name: string;
  company_common_name_en: string;
  company_email: string;
  company_approved_to_hire: boolean;
  no_of_active_requests: number;
  company_hourly_rate: number;
  currency_code: string;
  company_updated_at: number;
  staff_name: string;
  country_name: string;
  deleted: number;
}
