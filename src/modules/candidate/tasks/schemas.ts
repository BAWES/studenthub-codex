import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate Tasks — output validation schemas
// ---------------------------------------------------------------------------

export const taskStatusSchema = z.enum(["pending", "in-progress", "completed", "cancelled", "overdue"]);
export type TaskStatus = z.output<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type TaskPriority = z.output<typeof taskPrioritySchema>;

export const taskItemSchema = z.object({
  task_uuid: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z.string().nullable(),
  assigned_by: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TaskItem = z.output<typeof taskItemSchema>;

export const listTasksResultSchema = z.object({
  tasks: z.array(taskItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type ListTasksResult = z.output<typeof listTasksResultSchema>;

export const taskActionResultSchema = z.object({
  success: z.boolean(),
  task_uuid: z.string().optional(),
  error: z.string().optional(),
});
export type TaskActionResult = z.output<typeof taskActionResultSchema>;

export const taskDetailSchema = z.object({
  task_uuid: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z.string().nullable(),
  assigned_by_name: z.string().nullable(),
  assigned_by_email: z.string().nullable(),
  notes: z.array(z.object({
    note_uuid: z.string(),
    content: z.string(),
    author_name: z.string(),
    created_at: z.string(),
  })),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TaskDetail = z.output<typeof taskDetailSchema>;
