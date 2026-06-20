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
  const session = await requireRoleCapability("admin", "admin.read");
  const { categoryId } = await params;
  const catIdNum = Number(categoryId);

  if (Number.isNaN(catIdNum)) {
    notFound();
  }

  const data = await getDiscountCategory({ categoryId: catIdNum });

  if (!data.category) {
    notFound();
  }

  const cat = data.category;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Discount Categories"
        title={cat.name_en}
        metrics={[]}
      >
        <DetailSection
          title="Discount Category Details"
          facts={[
            { label: "Name (EN)", value: cat.name_en },
            { label: "Name (AR)", value: cat.name_ar ?? "—" },
            {
              label: "Image",
              value: cat.image ? (
                <a
                  href={cat.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary"
                >
                  View Image
                </a>
              ) : (
                "—"
              ),
            },
            {
              label: "Created",
              value: cat.created_at
                ? formatDate(new Date(cat.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: cat.updated_at
                ? formatDate(new Date(cat.updated_at))
                : "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
