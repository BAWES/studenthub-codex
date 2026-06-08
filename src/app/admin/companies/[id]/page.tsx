import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCompanyDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  permanentRedirect(`/app/companies/${id}`);
}
