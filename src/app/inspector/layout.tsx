import { InspectorLayout } from "@/modules/inspector";

export const dynamic = "force-dynamic";

export default async function InspectorLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <InspectorLayout>{children}</InspectorLayout>;
}
