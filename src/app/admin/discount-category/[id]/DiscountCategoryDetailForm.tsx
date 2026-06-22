"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateDiscountCategory, deleteDiscountCategory } from "../actions";

interface DiscountCategoryDetail {
  category_id: number;
  name_en: string;
  name_ar: string | null;
  image: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export function DiscountCategoryDetailForm({
  category,
}: {
  category: DiscountCategoryDetail;
}) {
  const [nameEn, setNameEn] = useState(category.name_en);
  const [nameAr, setNameAr] = useState(category.name_ar ?? "");
  const [image, setImage] = useState(category.image ?? "");

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("name_en", nameEn);
    formData.set("name_ar", nameAr || "");
    formData.set("image", image || "");

    await updateDiscountCategory(category.category_id, {
      name_en: nameEn,
      name_ar: nameAr || undefined,
      image: image || null,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Discount Category</CardTitle>
          <CardDescription>
            Update the discount category name and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  name="name_en"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_ar">Name (Arabic)</Label>
                <Input
                  id="name_ar"
                  name="name_ar"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[var(--sh-success)] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[var(--sh-error)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--sh-error)]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this discount category will also remove it from all associated
            discounts. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteDiscountCategory(category.category_id);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Discount Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
