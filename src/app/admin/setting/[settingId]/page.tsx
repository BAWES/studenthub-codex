import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getSetting } from "./actions";
import { SettingDetailForm } from "./_components/setting-detail-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingDetailPage({
  params,
}: {
  params: Promise<{ settingId: string }>;
}) {
  const { settingId } = await params;
  const session = await requireRoleCapability("admin", "admin.read");
  const setting = await getSetting({ setting_uuid: settingId });

  if (!setting) {
    notFound();
  }

  return <SettingDetailForm session={session} setting={setting} />;
}
