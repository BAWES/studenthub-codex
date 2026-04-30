import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  redirect(session ? "/hub" : "/login");
}
