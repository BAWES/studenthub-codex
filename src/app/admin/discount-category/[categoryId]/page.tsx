import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDiscountCategory } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { categoryId } = await params;
  const categoryIdNum = Number(categoryId);

  if (Number.isNaN(categoryIdNum)) {
    notFound();
  }

  const data = await getDiscountCategory({ categoryId: categoryIdNum });

  if (!data.category) {
    notFound();
  }

  const category = data.category;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Discount Categories"
        title={category.name_en}
        metrics={[]}
      >
        <DetailSection
          title="Discount Category Details"
          facts={[
            { label: "ID", value: String(category.category_id) },
            { label: "Name (EN)", value: category.name_en },
            { label: "Name (AR)", value: category.name_ar ?? "—" },
            {
              label: "Image",
              value: category.image ?? "—",
            },
            {
              label: "Created",
              value: category.created_at
                ? formatDate(new Date(category.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: category.updated_at
                ? formatDate(new Date(category.updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
