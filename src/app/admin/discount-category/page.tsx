import { requireRoleCapability } from "@/modules/auth/session";
import { listDiscountCategories } from "./actions";
import { AdminDiscountCategoriesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoriesPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listDiscountCategories({ limit: 100 });

  return (
    <AdminDiscountCategoriesTable
      session={session}
      categories={result.categories}
    />
  );
}
