import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Training — output validation schemas
// ---------------------------------------------------------------------------

export const trainingStatusSchema = z.enum(["not-started", "in-progress", "completed", "expired"]);
export type TrainingStatus = z.output<typeof trainingStatusSchema>;

export const trainingTypeSchema = z.enum(["course", "workshop", "certification", "seminar", "online"]);
export type TrainingType = z.output<typeof trainingTypeSchema>;

export const trainingItemSchema = z.object({
  training_uuid: z.string(),
  title: z.string(),
  training_type: trainingTypeSchema,
  provider: z.string(),
  status: trainingStatusSchema,
  progress_pct: z.number().min(0).max(100),
  credits: z.number().nonnegative().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  expiry_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TrainingItem = z.output<typeof trainingItemSchema>;

export const listTrainingResultSchema = z.object({
  items: z.array(trainingItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListTrainingResult = z.output<typeof listTrainingResultSchema>;

export const trainingActionResultSchema = z.object({
  success: z.boolean(),
  training_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type TrainingActionResult = z.output<typeof trainingActionResultSchema>;

export const trainingDetailSchema = z.object({
  training_uuid: z.string(),
  title: z.string(),
  training_type: trainingTypeSchema,
  provider: z.string(),
  instructor: z.string().nullable(),
  description: z.string().nullable(),
  duration_hours: z.number().nonnegative().nullable(),
  status: trainingStatusSchema,
  progress_pct: z.number().min(0).max(100),
  credits: z.number().nonnegative().nullable(),
  grade: z.string().nullable(),
  certificate_url: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  expiry_date: z.string().nullable(),
  cost: z.number().nonnegative().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TrainingDetail = z.output<typeof trainingDetailSchema>;
