"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listPermissionSectionsSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";
import type {
  CreatePermissionSectionInput,
  UpdatePermissionSectionInput,
  PermissionSectionDetail,
} from "./schemas";

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

  const result = sections as PermissionSectionDetail[];

  // Validate output shape
  const outputParsed = listPermissionSectionsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/permissions] listPermissionSections output failed:", outputParsed.error.issues);
  }

  return result;
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

  const result = { permission_uuid: section.permission_uuid };

  // Validate output shape
  const outputParsed = createPermissionSectionOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/permissions] createPermissionSection output failed:", outputParsed.error.issues);
  }

  return result;
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

  const result = { permission_uuid: parsed.data.permission_uuid };

  // Validate output shape
  const outputParsed = updatePermissionSectionOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/permissions] updatePermissionSection output failed:", outputParsed.error.issues);
  }

  return result;
}
