import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getDiscountCategoryDetail } from "../actions";
import { DiscountCategoryDetailForm } from "./DiscountCategoryDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await getDiscountCategoryDetail(categoryId);
  if (!category) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Discount Category"
      title={category.name_en}
      metrics={[
        { label: "Created", value: formatDate(category.created_at), note: "Record created" },
        { label: "Updated", value: formatDate(category.updated_at), note: "Last modified" }
      ]}
    >
      <DiscountCategoryDetailForm category={category} />
    </WorkspaceShell>
  );
}
