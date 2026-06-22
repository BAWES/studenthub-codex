import { requireRoleCapability } from "@/modules/auth/session";
import { listDesignations } from "./actions";
import { AdminDesignationsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminDesignationsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const { designations } = await listDesignations({ limit: 100 });

  return <AdminDesignationsTable session={session} designations={designations} />;
}