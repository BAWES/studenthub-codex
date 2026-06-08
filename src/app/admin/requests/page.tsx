import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminRequestsRedirect() {
  permanentRedirect("/app/requests");
}
