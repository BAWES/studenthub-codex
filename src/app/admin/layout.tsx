import { AdminLayout } from "@/modules/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
