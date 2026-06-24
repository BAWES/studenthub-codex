import { requireRoleCapability } from "@/modules/auth/session";
import { AdminDocumentsPanel } from "./_components/admin-documents-panel";
import { AdminDocumentManager } from "./_components/admin-document-manager";
import { listDocuments } from "@/modules/documents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const session = await requireRoleCapability("admin", "admin.read");

  const { documents, total } = await listDocuments({ page: 1, limit: 20 });

  return (
    <Tabs defaultValue="pdf">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="pdf">PDF Generation</TabsTrigger>
        <TabsTrigger value="uploads">Uploaded Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="pdf">
        <AdminDocumentsPanel />
      </TabsContent>
      <TabsContent value="uploads">
        <AdminDocumentManager initialDocuments={documents} initialTotal={total} />
      </TabsContent>
    </Tabs>
  );
}
