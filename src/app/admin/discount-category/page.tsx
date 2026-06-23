import { requireRoleCapability } from "@/modules/auth/session";
import { listDiscountCategories } from "./actions";
import { AdminDiscountCategoriesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDiscountCategoryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const { categories } = await listDiscountCategories({});

  return <AdminDiscountCategoriesTable session={session} categories={categories} />;
}
