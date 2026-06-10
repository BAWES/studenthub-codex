import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listCompanyRequestsSchema = z.object({
  company_id: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getCompanyRequestDetailSchema = z.object({
  uuid: z.string().min(1, "Request UUID is required"),
});

export const updateRequestStatusSchema = z.object({
  uuid: z.string().min(1, "Request UUID is required"),
  status: z.enum(
    [
      "pending",
      "started",
      "delivered",
      "cancelled",
      "finished_by_recruitment",
      "re_work",
    ],
    {
      errorMap: () => ({
        message:
          "Status must be one of: pending, started, delivered, cancelled, finished_by_recruitment, re_work",
      }),
    },
  ),
  feedback: z.string().max(255).optional(),
});

export const deleteRequestSchema = z.object({
  uuid: z.string().min(1, "Request UUID is required"),
});

export const getCompanyCreateFormCompaniesSchema = z.object({
  contactUuid: z.string().min(1, "Contact UUID is required"),
});

export const createCompanyRequestSchema = z.object({
  company_id: z.number({ required_error: "Company ID is required" }).int().positive(),
  position_title: z
    .string({ required_error: "Position title is required" })
    .min(1, "Position title is required")
    .max(255),
  compensation: z.string().max(255).optional(),
  number_of_employees: z.number().int().min(1).max(1000).optional(),
  location: z.string().max(255).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListCompanyRequestsInput = z.input<typeof listCompanyRequestsSchema>;
export type CreateCompanyRequestInput = z.input<typeof createCompanyRequestSchema>;
export type UpdateRequestStatusInput = z.input<typeof updateRequestStatusSchema>;
export type DeleteRequestInput = z.input<typeof deleteRequestSchema>;

export type CompanyRequestListItem = {
  request_uuid: string;
  company_id: number | null;
  request_position_title: string | null;
  request_compensation: string | null;
  request_number_of_employees: number | null;
  request_location: string | null;
  request_status: string | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
  company_name: string | null;
};

export type CompanyRequestDetail = {
  request_uuid: string;
  company_id: number | null;
  contact_uuid: string | null;
  staff_id: number | null;
  request_position_title: string | null;
  request_job_description: string;
  request_compensation: string;
  request_number_of_employees: number | null;
  request_location: string | null;
  request_additional_info: string | null;
  request_status: string | null;
  request_feedback: string | null;
  request_created_datetime: Date;
  request_updated_datetime: Date;
  company_name: string | null;
};

export type ListCompanyRequestsResult = {
  requests: CompanyRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
