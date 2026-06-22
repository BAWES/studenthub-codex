"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  adminListItemSchema,
  adminDetailSchema,
  listAdminsResultSchema,
  createAdminResultSchema,
  type AdminListItem,
  type AdminDetail,
  type ListAdminsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listAdminsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
});

const getAdminSchema = z.object({
  id: z.number().int().positive(),
});

const createAdminSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
  roleId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAdminsParams = z.input<typeof listAdminsSchema>;
export type GetAdminParams = z.input<typeof getAdminSchema>;
export type CreateAdminParams = z.input<typeof createAdminSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List admin users with pagination and optional search filter.
 * Only returns active (status 10) admins.
 */
export async function listAdmins(
  params: ListAdminsParams = {},
): Promise<ListAdminsResult> {
  await requireCapability("admin.read");

  const parsed = listAdminsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, search } = parsed.data;

  const where: Record<string, unknown> = { admin_status: 10 };

  if (search) {
    where.OR = [
      { admin_name: { contains: search } },
      { admin_email: { contains: search } },
    ];
  }

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where: where as any,
      orderBy: { admin_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        admin_id: true,
        admin_name: true,
        admin_email: true,
        admin_status: true,
        admin_created_at: true,
      },
    }),
    prisma.admin.count({ where: where as any }),
  ]);

  const result = {
    admins: admins as AdminListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listAdminsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin] listAdmins output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single admin by ID, excluding soft-deactivated records (status != 10).
 */
export async function getAdmin(
  params: GetAdminParams,
): Promise<AdminDetail | null> {
  await requireCapability("admin.read");

  const parsed = getAdminSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid admin ID");
  }

  const { id } = parsed.data;

  const admin = await prisma.admin.findFirst({
    where: {
      admin_id: id,
      admin_status: 10,
    },
    select: {
      admin_id: true,
      admin_name: true,
      admin_email: true,
      admin_status: true,
      admin_limited_access: true,
      admin_created_at: true,
      admin_updated_at: true,
    },
  });

  if (!admin) {
    // Validate output shape (null case)
    const nullOutputParsed = adminDetailSchema.nullable().safeParse(null);
    if (!nullOutputParsed.success) {
      console.error(
        "[modules/admin] getAdmin output validation failed (null):",
        nullOutputParsed.error.issues,
      );
    }
    return null;
  }

  const result = admin as AdminDetail;

  // Validate output shape
  const outputParsed = adminDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin] getAdmin output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new admin user with hashed password and optional role assignment.
 * Generates a random auth_key (32-char hex) matching the Yii2 convention.
 */
export async function createAdmin(
  data: CreateAdminParams,
): Promise<{ admin_id: number }> {
  await requireCapability("admin.write");

  const parsed = createAdminSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid admin data");
  }

  const { name, email, password, roleId } = parsed.data;

  // Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate random 32-char hex auth key (Yii2 convention)
  const authKey = crypto.randomBytes(16).toString("hex");

  const admin = await prisma.admin.create({
    data: {
      admin_name: name,
      admin_email: email,
      admin_password_hash: passwordHash,
      admin_auth_key: authKey,
      admin_status: 10,
      admin_created_at: new Date(),
      admin_updated_at: new Date(),
    },
  });

  // If a role/permission sub-section was specified, create the permission_user link
  if (roleId) {
    await prisma.permission_user.create({
      data: {
        permission_user_uuid: `perm_user_${crypto.randomUUID()}`,
        admin_id: admin.admin_id,
        permission_sub_section_uuid: roleId,
        created_at: new Date(),
      },
    });
  }

  const result = { admin_id: admin.admin_id };

  // Validate output shape
  const outputParsed = createAdminResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin] createAdmin output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
