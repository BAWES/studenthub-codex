import { getSession } from "@/modules/auth/session";
import { LandingPage } from "@/components/landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  return <LandingPage session={session} />;
}
