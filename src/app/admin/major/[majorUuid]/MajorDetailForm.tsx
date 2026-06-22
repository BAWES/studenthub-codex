"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateMajor, deleteMajor } from "../actions";

interface MajorDetail {
  major_uuid: string;
  major_name_en: string;
  major_name_ar: string;
  data_source: number | null;
  major_created_at: Date | null;
  major_updated_at: Date | null;
}

export function MajorDetailForm({ major }: { major: MajorDetail }) {
  const [nameEn, setNameEn] = useState(major.major_name_en);
  const [nameAr, setNameAr] = useState(major.major_name_ar);

  const updateAction = async () => {
    await updateMajor(major.major_uuid, { major_name_en: nameEn, major_name_ar: nameAr });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Major</CardTitle>
          <CardDescription>Update the major name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="major_name_en">Name (English)</Label>
                <Input id="major_name_en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major_name_ar">Name (Arabic)</Label>
                <Input id="major_name_ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
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
          <CardDescription>Deleting this major will remove it from all candidate education records.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => { await deleteMajor(major.major_uuid); }}>
            <Button type="submit" variant="destructive">Delete Major</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
