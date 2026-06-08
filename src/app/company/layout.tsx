import { CompanyLayout } from "@/modules/company";

export const dynamic = "force-dynamic";

export default async function CompanyLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <CompanyLayout>{children}</CompanyLayout>;
}
