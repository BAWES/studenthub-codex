"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getWebhookSchema, getWebhookResultSchema } from "./schemas";
import type { GetWebhookResult, GetWebhookInput } from "./schemas";

export async function getWebhook(input: GetWebhookInput): Promise<GetWebhookResult> {
  await requireCapability("admin.read");
  const parsed = getWebhookSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid webhook ID");
  const row = await prisma.webhook.findUnique({ where: { webhook_id: parsed.data.webhookId } });
  if (!row) {
    const result = { webhook: null };
    const outputParsed = getWebhookResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/webhook/[id]] getWebhook output failed:", outputParsed.error.issues);
    }
    return result;
  }
  const result = { webhook: { webhook_id: row.webhook_id, event: row.event, endpoint: row.endpoint, method: row.method, created_at: row.created_at, updated_at: row.updated_at } };
  const outputParsed = getWebhookResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/webhook/[id]] getWebhook output failed:", outputParsed.error.issues);
  }
  return result;
}
