import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StaffRequestsRedirect() {
  permanentRedirect("/app/requests");
}
