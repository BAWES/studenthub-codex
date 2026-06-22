"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateUniversity, deleteUniversity } from "../actions";

interface UniversityDetail {
  university_id: number;
  university_name_en: string | null;
  university_name_ar: string | null;
  university_data_source: number | null;
  university_created_at: Date | null;
  university_updated_at: Date | null;
  deleted: number;
}

export function UniversityDetailForm({
  university,
}: {
  university: UniversityDetail;
}) {
  const [nameEn, setNameEn] = useState(university.university_name_en ?? "");
  const [nameAr, setNameAr] = useState(university.university_name_ar ?? "");
  const [dataSource, setDataSource] = useState(String(university.university_data_source ?? 0));

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("university_name_en", nameEn);
    formData.set("university_name_ar", nameAr || "");
    formData.set("university_data_source", dataSource);

    await updateUniversity(university.university_id, {
      university_name_en: nameEn,
      university_name_ar: nameAr || undefined,
      university_data_source: Number(dataSource) || null,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit University</CardTitle>
          <CardDescription>
            Update the university name and data source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university_name_en">Name (English)</Label>
                <Input
                  id="university_name_en"
                  name="university_name_en"
                  value={nameEn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEn(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university_name_ar">Name (Arabic)</Label>
                <Input
                  id="university_name_ar"
                  name="university_name_ar"
                  value={nameAr}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameAr(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university_data_source">Data Source</Label>
              <Input
                id="university_data_source"
                name="university_data_source"
                type="number"
                value={dataSource}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataSource(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-green-700 font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Soft-deleting this university will hide it from selection but preserve
            existing candidate and education references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteUniversity(university.university_id);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete University
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
