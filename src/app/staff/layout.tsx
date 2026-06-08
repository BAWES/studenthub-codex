import { StaffLayout } from "@/modules/staff";

export const dynamic = "force-dynamic";

export default async function StaffLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <StaffLayout>{children}</StaffLayout>;
}
