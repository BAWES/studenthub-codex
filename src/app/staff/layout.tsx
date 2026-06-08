import { createRoleLayout } from "@/modules/layouts/create-role-layout";

export const dynamic = "force-dynamic";

export default createRoleLayout("staff", "request.read.assigned");
