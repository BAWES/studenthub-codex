"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listBlockedIpsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
});

const createBlockedIpSchema = z.object({
  ip_address: z
    .string({ required_error: "IP address is required" })
    .min(1, "IP address is required")
    .max(45, "IP address must be at most 45 characters"),
  note: z
    .string()
    .max(255, "Note must be at most 255 characters")
    .optional(),
});

const updateBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
  ip_address: z
    .string({ required_error: "IP address is required" })
    .min(1, "IP address is required")
    .max(45),
  note: z
    .string()
    .max(255, "Note must be at most 255 characters")
    .optional(),
});

const deleteBlockedIpSchema = z.object({
  ipUuid: z.string().min(1, "Blocked IP UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BlockedIpListItem = {
  ip_uuid: string;
  ip_address: string | null;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListBlockedIpsResult = {
  records: BlockedIpListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listBlockedIps
// ---------------------------------------------------------------------------

/**
 * List blocked IP addresses with pagination.
 * Mirrors the legacy Yii2 Admin BlockedIpController::actionList().
 */
export async function listBlockedIps(
  params: FormData | z.input<typeof listBlockedIpsSchema> = {},
): Promise<ListBlockedIpsResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listBlockedIpsSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.blocked_ip.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.blocked_ip.count(),
  ]);

  return {
    records: records.map((r: any): BlockedIpListItem => ({
      ip_uuid: r.ip_uuid,
      ip_address: r.ip_address ?? null,
      note: r.note ?? null,
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
// getBlockedIp
// ---------------------------------------------------------------------------

/**
 * Get a single blocked IP record by UUID.
 * Returns null if not found.
 */
export async function getBlockedIp(
  ipUuid: string,
): Promise<BlockedIpListItem | null> {
  await requireCapability("admin.read");

  const parsed = getBlockedIpSchema.safeParse({ ipUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blocked IP UUID");
  }

  const record = await prisma.blocked_ip.findFirst({
    where: { ip_uuid: parsed.data.ipUuid },
  });

  if (!record) return null;

  const raw = record as any;
  return {
    ip_uuid: raw.ip_uuid,
    ip_address: raw.ip_address ?? null,
    note: raw.note ?? null,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// createBlockedIp
// ---------------------------------------------------------------------------

/**
 * Create a new blocked IP record.
 * Generates a UUID prefixed with "ip_".
 * Mirrors the legacy Yii2 Admin BlockedIpController::actionCreate().
 */
export async function createBlockedIp(
  data: z.input<typeof createBlockedIpSchema>,
): Promise<{ ip_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = createBlockedIpSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blocked IP data");
  }

  const { ip_address, note } = parsed.data;

  const record = await prisma.blocked_ip.create({
    data: {
      ip_uuid: `ip_${crypto.randomUUID()}`,
      ip_address,
      note: note ?? null,
    } as any,
  });

  revalidatePath("/admin/ip-blocking");
  return { ip_uuid: record.ip_uuid };
}

// ---------------------------------------------------------------------------
// updateBlockedIp
// ---------------------------------------------------------------------------

/**
 * Update an existing blocked IP record.
 * Mirrors the legacy Yii2 Admin BlockedIpController::actionUpdate().
 * Throws an error if the record does not exist.
 */
export async function updateBlockedIp(
  data: z.input<typeof updateBlockedIpSchema>,
): Promise<{ ip_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = updateBlockedIpSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blocked IP data");
  }

  const { ipUuid, ip_address, note } = parsed.data;

  // Verify the record exists before updating
  const existing = await prisma.blocked_ip.findFirst({
    where: { ip_uuid: ipUuid },
  });
  if (!existing) {
    throw new Error(`Blocked IP record not found: ${ipUuid}`);
  }

  await prisma.blocked_ip.update({
    where: { ip_uuid: ipUuid },
    data: {
      ip_address,
      note: note ?? null,
    } as any,
  });

  revalidatePath("/admin/ip-blocking");
  return { ip_uuid: ipUuid };
}

// ---------------------------------------------------------------------------
// deleteBlockedIp
// ---------------------------------------------------------------------------

/**
 * Delete a blocked IP record by UUID.
 * Mirrors the legacy Yii2 Admin BlockedIpController::actionDelete().
 * Throws an error if the record does not exist.
 */
export async function deleteBlockedIp(
  ipUuid: string,
): Promise<{ ip_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = deleteBlockedIpSchema.safeParse({ ipUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blocked IP UUID");
  }

  // Verify the record exists before deleting
  const existing = await prisma.blocked_ip.findFirst({
    where: { ip_uuid: parsed.data.ipUuid },
  });
  if (!existing) {
    throw new Error(`Blocked IP record not found: ${parsed.data.ipUuid}`);
  }

  await prisma.blocked_ip.delete({
    where: { ip_uuid: parsed.data.ipUuid },
  });

  revalidatePath("/admin/ip-blocking");
  return { ip_uuid: parsed.data.ipUuid };
}
