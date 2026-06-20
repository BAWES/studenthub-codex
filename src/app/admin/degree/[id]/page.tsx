import { notFound, redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getDegreeDetail, getDegreeGroupOptions, updateDegree, deleteDegree } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminDegreeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const degree = await getDegreeDetail(id);
  if (!degree) {
    notFound();
  }

  const groups = await getDegreeGroupOptions();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Degree"
      title={degree.degree_name_en}
      metrics={[
        { label: "Created", value: formatDate(degree.degree_created_at), note: "Record created" },
        { label: "Updated", value: formatDate(degree.degree_updated_at), note: "Last modified" }
      ]}
    >
      <form
        action={async (formData: FormData) => {
          "use server";
          await updateDegree(id, {
            degree_name_en: formData.get("degree_name_en") as string,
            degree_name_ar: (formData.get("degree_name_ar") as string) || undefined,
            degree_sort_order: Number(formData.get("degree_sort_order")) || 0,
            degree_group_uuid: (formData.get("degree_group_uuid") as string) || null
          });
          redirect(`/admin/degree/${id}`);
        }}
        className="form"
      >
        <div className="inputGroup">
          <label htmlFor="degree_name_en">Name (English)</label>
          <input
            id="degree_name_en"
            name="degree_name_en"
            type="text"
            defaultValue={degree.degree_name_en}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="degree_name_ar">Name (Arabic)</label>
          <input
            id="degree_name_ar"
            name="degree_name_ar"
            type="text"
            defaultValue={degree.degree_name_ar ?? ""}
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="degree_sort_order">Sort Order</label>
          <input
            id="degree_sort_order"
            name="degree_sort_order"
            type="number"
            defaultValue={degree.degree_sort_order ?? 0}
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="degree_group_uuid">Degree Group</label>
          <select
            id="degree_group_uuid"
            name="degree_group_uuid"
            defaultValue={degree.degree_group_uuid ?? ""}
          >
            <option value="">— None —</option>
            {groups.map((group) => (
              <option key={group.degree_group_uuid} value={group.degree_group_uuid}>
                {group.degree_group_name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="formActions">
          <button type="submit" className="button primary">Save Changes</button>
        </div>
      </form>

      <hr className="sectionDivider" />

      <section>
        <h2>Danger Zone</h2>
        <p>Deleting this degree will also remove it from all candidate education records.</p>
        <form
          action={async () => {
            "use server";
            await deleteDegree(id);
            redirect("/admin/degree");
          }}
        >
          <button type="submit" className="button destructive">Delete Degree</button>
        </form>
      </section>
    </WorkspaceShell>
  );
}
