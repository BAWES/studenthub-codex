import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRoleCapability } from "@/modules/auth/session";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listCompanyRequests } from "./actions";
import { CompanyRequestsTable } from "./company-requests-table";

export const dynamic = "force-dynamic";

export default async function CompanyRequestsPage() {
  const session = await requireRoleCapability("company", "request.read.linked");
  const result = await listCompanyRequests();

  const rows = result.requests.map((r) => ({
    id: r.request_uuid,
    title: r.request_position_title ?? "Untitled request",
    company: r.company_name ?? "No company",
    owner: "",
    seats: r.request_number_of_employees ?? 0,
    status: r.request_status ?? "pending",
    updated: r.request_updated_datetime ? new Date(r.request_updated_datetime).toLocaleDateString() : "N/A",
  }));

  return <CompanyRequestsTable session={session} rows={rows} />;
}
