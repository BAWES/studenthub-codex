"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDegreeGroup, deleteDegreeGroup } from "../actions";

interface DegreeGroupDetail {
  degree_group_uuid: string;
  degree_group_name_en: string;
  degree_group_name_ar: string | null;
  degree_group_sort_order: number | null;
  skip_major: number | null;
  degree_group_created_at: Date | null;
  degree_group_updated_at: Date | null;
}

export function DegreeGroupDetailForm({
  group
}: {
  group: DegreeGroupDetail;
}) {
  const [nameEn, setNameEn] = useState(group.degree_group_name_en);
  const [nameAr, setNameAr] = useState(group.degree_group_name_ar ?? "");
  const [sortOrder, setSortOrder] = useState(String(group.degree_group_sort_order ?? 0));
  const [skipMajor, setSkipMajor] = useState((group.skip_major ?? 0) === 1);

  const [deleteError, setDeleteError] = useState("");

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("degree_group_name_en", nameEn);
    formData.set("degree_group_name_ar", nameAr || "");
    formData.set("degree_group_sort_order", sortOrder);
    formData.set("skip_major", skipMajor ? "1" : "0");

    await updateDegreeGroup(group.degree_group_uuid, {
      degree_group_name_en: nameEn,
      degree_group_name_ar: nameAr || undefined,
      degree_group_sort_order: Number(sortOrder) || 0,
      skip_major: skipMajor ? 1 : 0,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  const handleDelete = async () => {
    try {
      setDeleteError("");
      await deleteDegreeGroup(group.degree_group_uuid);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Degree Group</CardTitle>
          <CardDescription>
            Update the degree group name, sort order, and skip-major flag.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree_group_name_en">Name (English)</Label>
                <Input
                  id="degree_group_name_en"
                  name="degree_group_name_en"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree_group_name_ar">Name (Arabic)</Label>
                <Input
                  id="degree_group_name_ar"
                  name="degree_group_name_ar"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree_group_sort_order">Sort Order</Label>
                <Input
                  id="degree_group_sort_order"
                  name="degree_group_sort_order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skip_major">Skip Major</Label>
                <Select
                  value={skipMajor ? "1" : "0"}
                  onValueChange={(val) => setSkipMajor(val === "1")}
                >
                  <SelectTrigger id="skip_major" className="w-full">
                    <SelectValue placeholder="No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[#2e7d32] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[#d32f2f]/20">
        <CardHeader>
          <CardTitle className="text-[#d32f2f]">Danger Zone</CardTitle>
          <CardDescription>
            Delete this degree group. Only possible if no degrees are assigned to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleDelete}>
            <Button type="submit" variant="destructive">
              Delete Degree Group
            </Button>
          </form>
          {deleteError && (
            <p className="text-sm text-[#d32f2f] mt-2">{deleteError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
