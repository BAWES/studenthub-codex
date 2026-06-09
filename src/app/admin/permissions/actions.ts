"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listPermissionSectionsSchema = z.object({});

export const getPermissionSectionSchema = z.object({
  permission_uuid: z.string().min(1, "Permission section UUID is required"),
});

export const createPermissionSectionSchema = z.object({
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

export const updatePermissionSectionSchema = z.object({
  permission_uuid: z.string().min(1, "Permission section UUID is required"),
  section_name: z
    .string({ required_error: "Section name is required" })
    .min(1, "Section name is required")
    .max(255),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreatePermissionSectionInput = z.input<
  typeof createPermissionSectionSchema
>;

export type UpdatePermissionSectionInput = z.input<
  typeof updatePermissionSectionSchema
>;

export type PermissionSectionDetail = {
  permission_uuid: string;
  section_name: string | null;
  created_at: Date;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List all permission sections.
 * Mirrors the legacy Yii2 PermissionSectionController::actionList().
 * Returns all sections — no pagination (small dataset).
 */
export async function listPermissionSections(): Promise<
  PermissionSectionDetail[]
> {
  await requireCapability("admin.read");

  const sections = await prisma.permission_section.findMany({
    orderBy: { section_name: "asc" },
  });

  return sections as PermissionSectionDetail[];
}

/**
 * Get a single permission section by UUID.
 * Mirrors the legacy Yii2 PermissionSectionController::actionView().
 */
export async function getPermissionSection(
  permission_uuid: string,
): Promise<PermissionSectionDetail | null> {
  await requireCapability("admin.read");

  const parsed = getPermissionSectionSchema.safeParse({ permission_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid permission section UUID",
    );
  }

  const section = await prisma.permission_section.findUnique({
    where: { permission_uuid: parsed.data.permission_uuid },
  });

  if (!section) return null;

  return section as PermissionSectionDetail;
}

/**
 * Create a new permission section.
 * Mirrors the legacy Yii2 PermissionSectionController::actionCreate().
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
      permission_uuid: `per_sec${crypto.randomUUID()}`,
      section_name: parsed.data.section_name,
      created_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/permissions");
  return { permission_uuid: section.permission_uuid };
}

/**
 * Update an existing permission section's name.
 * Mirrors the legacy Yii2 PermissionSectionController::actionUpdate().
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

  const existing = await prisma.permission_section.findUnique({
    where: { permission_uuid: parsed.data.permission_uuid },
  });

  if (!existing) {
    throw new Error("Permission section not found");
  }

  await prisma.permission_section.update({
    where: { permission_uuid: parsed.data.permission_uuid },
    data: {
      section_name: parsed.data.section_name,
    } as any,
  });

  revalidatePath("/admin/permissions");
  return { permission_uuid: parsed.data.permission_uuid };
}
