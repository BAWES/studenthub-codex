// ---------------------------------------------------------------------------
// StoryController — Schemas and Types
// ---------------------------------------------------------------------------
// Separated from story-actions.ts because Next.js "use server" files can only
// export async functions — Zod schemas and types must live here instead.
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listStoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.coerce.number().int().optional(),
  keyword: z.string().optional(),
  staffId: z.coerce.number().int().positive().optional(),
});

export const getStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
});

export const assignStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive("Staff ID must be positive"),
});

export const getActiveStorySchema = z.object({
  staffId: z.coerce.number().int().positive("Staff ID must be positive"),
});

export const listOldStoriesSchema = z.object({
  staffId: z.coerce.number().int().positive("Staff ID must be positive"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoryItem = {
  story_uuid: string;
  request_uuid: string;
  staff_id: number | null;
  number_of_employees: number | null;
  story_status: number;
  is_old: boolean | null;
  story_created_at: Date | null;
  story_last_updated_at: Date | null;
  request: {
    request_position_title: string | null;
    request_position_type: number | null;
    company: { company_name: string } | null;
  };
  staff: { staff_name: string } | null;
};

export type StoryDetail = StoryItem & {
  story_time_spent: number | null;
  request: StoryItem["request"] & {
    request_status: string | null;
    request_priority: number | null;
  };
  story_activity: {
    activity_status: number;
    activity_created_at: Date | null;
    staff: { staff_name: string } | null;
  }[];
};

export type ListStoriesResult = {
  stories: StoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ActiveStoryResult =
  | { operation: "success"; stories: StoryItem[] }
  | { operation: "error"; message: string };

export type AssignStoryResult =
  | { operation: "success"; message: string }
  | { operation: "error"; message: string };

export type ListOldStoriesResult = {
  stories: StoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
