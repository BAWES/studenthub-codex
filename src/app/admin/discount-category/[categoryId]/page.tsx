import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDiscountCategory } from "./actions";
import { DiscountCategoryDetailForm } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { categoryId } = await params;
  const catIdNum = Number(categoryId);

  if (Number.isNaN(catIdNum)) {
    notFound();
  }

  const data = await getDiscountCategory({ categoryId: catIdNum });

  if (!data.category) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Discount Category"
      title={data.category.name_en}
      metrics={[
        {
          label: "Created",
          value: data.category.created_at
            ? new Date(data.category.created_at).toLocaleDateString()
            : "—",
          note: "Record created",
        },
        {
          label: "Updated",
          value: data.category.updated_at
            ? new Date(data.category.updated_at).toLocaleDateString()
            : "—",
          note: "Last modified",
        },
      ]}
    >
      <DiscountCategoryDetailForm category={data.category} />
    </WorkspaceShell>
  );
}
