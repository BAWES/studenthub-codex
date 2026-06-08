import { CandidateLayout } from "@/modules/candidate";

export const dynamic = "force-dynamic";

export default async function CandidateLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <CandidateLayout>{children}</CandidateLayout>;
}
