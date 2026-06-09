"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listMailLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).optional(),
});

const getMailLogSchema = z.object({
  mailUuid: z.string().min(1, "Mail UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MailLogListItem = {
  mail_uuid: string;
  from: string | null;
  to: string | null;
  subject: string | null;
  app: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListMailLogsResult = {
  records: MailLogListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listMailLogs
// ---------------------------------------------------------------------------

/**
 * List mail logs with pagination and optional search on to/from/subject.
 * Mirrors the legacy Yii2 Admin MailLogController::actionList().
 */
export async function listMailLogs(
  params: FormData | z.input<typeof listMailLogsSchema> = {},
): Promise<ListMailLogsResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listMailLogsSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search && search.trim()) {
    where.OR = [
      { to: { contains: search, mode: "insensitive" } },
      { from: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.mail_log.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.mail_log.count({ where: where as any }),
  ]);

  return {
    records: records.map((r): MailLogListItem => ({
      mail_uuid: r.mail_uuid,
      from: r.from ?? null,
      to: r.to ?? null,
      subject: r.subject ?? null,
      app: r.app ?? null,
      created_at: r.created_at?.toISOString() ?? null,
      updated_at: r.updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getMailLog
// ---------------------------------------------------------------------------

/**
 * Get a single mail log entry by UUID.
 * Mirrors the legacy Yii2 Admin MailLogController::actionView().
 * Returns null if not found.
 */
export async function getMailLog(
  mailUuid: string,
): Promise<MailLogListItem | null> {
  await requireCapability("admin.read");

  const parsed = getMailLogSchema.safeParse({ mailUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid mail UUID");
  }

  const record = await prisma.mail_log.findFirst({
    where: { mail_uuid: parsed.data.mailUuid },
  });

  if (!record) return null;

  return {
    mail_uuid: record.mail_uuid,
    from: record.from ?? null,
    to: record.to ?? null,
    subject: record.subject ?? null,
    app: record.app ?? null,
    created_at: record.created_at?.toISOString() ?? null,
    updated_at: record.updated_at?.toISOString() ?? null,
  };
}
