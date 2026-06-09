import { getSession } from "@/modules/auth/session";
import LandingContent from "./LandingContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  return <LandingContent session={session} />;
}
