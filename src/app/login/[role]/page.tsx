import { notFound, redirect } from "next/navigation";
import { roles, type Role } from "@/modules/auth/types";

export const dynamic = "force-dynamic";

export default async function RoleLoginCompatibilityPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!roles.includes(role as Role)) notFound();
  redirect(`/login?intent=${role}`);
}
