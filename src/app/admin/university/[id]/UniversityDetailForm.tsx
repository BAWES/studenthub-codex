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
  deleted: number;
  university_created_at: Date | null;
  university_updated_at: Date | null;
}

export function UniversityDetailForm({ university }: { university: UniversityDetail }) {
  const [nameEn, setNameEn] = useState(university.university_name_en ?? "");
  const [nameAr, setNameAr] = useState(university.university_name_ar ?? "");

  const updateAction = async () => {
    await updateUniversity(university.university_id, { university_name_en: nameEn, university_name_ar: nameAr || undefined });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit University</CardTitle>
          <CardDescription>Update the university name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university_name_en">Name (English)</Label>
                <Input id="university_name_en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university_name_ar">Name (Arabic)</Label>
                <Input id="university_name_ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Changes"}</Button>
              {state?.success && <span className="text-sm text-green-700 font-medium">Saved successfully</span>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Separator />
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Soft-delete this university. It will no longer appear in lists.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => { await deleteUniversity(university.university_id); }}>
            <Button type="submit" variant="destructive">Delete University</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
