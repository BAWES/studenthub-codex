import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/modules/workspace/format";
import { getDiscountCategoryDetail } from "../actions";
import { DiscountCategoryDetailForm } from "./DiscountCategoryDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryDetailPage({
  params
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { categoryId } = await params;
  const id = Number(categoryId);

  const category = await getDiscountCategoryDetail(id);
  if (!category) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Discount Categories"
      title={category.name_en}
      metrics={[
        { label: "Created", value: formatDate(category.created_at), note: "Record created" },
        { label: "Updated", value: formatDate(category.updated_at), note: "Last modified" }
      ]}
    >
      <DiscountCategoryDetailForm category={category} />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/discount-category" as Route}>
          <Button variant="outline">Back to Discount Categories</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
