import { requireSession } from "@/modules/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <>{children}</>;
}
