import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CompanyRequestCreateRedirect() {
  permanentRedirect("/app/requests/create");
}
