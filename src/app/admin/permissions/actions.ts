"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listPermissionSectionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getPermissionSectionSchema = z.object({
  uuid: z.string().min(1, "Permission section UUID is required"),
});

export const createPermissionSectionSchema = z.object({
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

export const updatePermissionSectionSchema = z.object({
  uuid: z.string().min(1, "Permission section UUID is required"),
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListPermissionSectionsInput = z.input<
  typeof listPermissionSectionsSchema
>;
export type CreatePermissionSectionInput = z.input<
  typeof createPermissionSectionSchema
>;
export type UpdatePermissionSectionInput = z.input<
  typeof updatePermissionSectionSchema
>;

export type PermissionSectionListItem = {
  permission_uuid: string;
  section_name: string | null;
  created_at: Date | null;
};

export type PermissionSectionDetail = PermissionSectionListItem;

export type ListPermissionSectionsResult = {
  sections: PermissionSectionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List permission sections with pagination.
 * Mirrors the legacy PermissionSectionController::actionList().
 */
export async function listPermissionSections(
  params: ListPermissionSectionsInput = {},
): Promise<ListPermissionSectionsResult> {
  await requireCapability("admin.read");

  const parsed = listPermissionSectionsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit } = parsed.data;

  const where = {};

  const [raw, total] = await Promise.all([
    prisma.permission_section.findMany({
      where: where as any,
      orderBy: { section_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.permission_section.count({ where: where as any }),
  ]);

  return {
    sections: raw as PermissionSectionListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single permission section by UUID.
 * Mirrors the legacy PermissionSectionController::actionView().
 */
export async function getPermissionSection(
  uuid: string,
): Promise<PermissionSectionDetail | null> {
  await requireCapability("admin.read");

  const parsed = getPermissionSectionSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid permission section UUID",
    );
  }

  const section = await prisma.permission_section.findUnique({
    where: { permission_uuid: parsed.data.uuid },
  });

  if (!section) return null;

  return section as PermissionSectionDetail;
}

/**
 * Create a new permission section.
 * Mirrors the legacy PermissionSectionController::actionCreate().
 */
export async function createPermissionSection(
  data: CreatePermissionSectionInput,
): Promise<{ permission_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = createPermissionSectionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid permission section data",
    );
  }

  const section = await prisma.permission_section.create({
    data: {
      permission_uuid: crypto.randomUUID(),
      section_name: parsed.data.section_name,
      created_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/permissions");
  return { permission_uuid: section.permission_uuid };
}

/**
 * Update an existing permission section name.
 * Mirrors the legacy PermissionSectionController::actionUpdate().
 */
export async function updatePermissionSection(
  data: UpdatePermissionSectionInput,
): Promise<{ permission_uuid: string }> {
  await requireCapability("admin.write");

  const parsed = updatePermissionSectionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid permission section data",
    );
  }

  await prisma.permission_section.update({
    where: { permission_uuid: parsed.data.uuid },
    data: {
      section_name: parsed.data.section_name,
    } as any,
  });

  revalidatePath("/admin/permissions");
  return { permission_uuid: parsed.data.uuid };
}
