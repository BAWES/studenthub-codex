import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getAdminDiscountCategoryDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    notFound();
  }

  const category = await getAdminDiscountCategoryDetail(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Discount Categories"
      title={`Discount Category — ${category.name_en ?? "Unnamed"}`}
      metrics={[
        { label: "Created", value: formatDate(category.created_at), note: "Record created" },
        { label: "Updated", value: formatDate(category.updated_at), note: "Last modified" }
      ]}
    >
      <FactPanel
        title="Category Details"
        facts={[
          { label: "ID", value: String(category.category_id) },
          { label: "Name (English)", value: category.name_en },
          { label: "Name (Arabic)", value: category.name_ar ?? "—" },
          { label: "Image", value: category.image ?? "—" },
        ]}
      />

      <section className="flex gap-2 p-4">
        <Link href={"/admin/discount-category" as Route}>
          <Button variant="outline">Back to Discount Categories</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
