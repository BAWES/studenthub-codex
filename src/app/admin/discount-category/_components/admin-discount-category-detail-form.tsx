"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSection } from "@/modules/workspace/DetailPanels";

import type { DiscountCategoryItem } from "../schemas";
import { updateDiscountCategory, deleteDiscountCategory } from "../actions";

type Props = {
  category: DiscountCategoryItem;
};

export function DiscountCategoryDetailForm({ category }: Props) {
  const router = useRouter();

  return (
    <>
      <DetailSection
        title="Discount Category Details"
        facts={[
          { label: "Name (EN)", value: category.name_en },
          { label: "Name (AR)", value: category.name_ar ?? "—" },
          {
            label: "Image",
            value: category.image ? (
              <a
                href={category.image}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                View Image
              </a>
            ) : (
              "—"
            ),
          },
          {
            label: "Created",
            value: category.created_at
              ? new Date(category.created_at).toLocaleDateString()
              : "—",
          },
          {
            label: "Updated",
            value: category.updated_at
              ? new Date(category.updated_at).toLocaleDateString()
              : "—",
          },
        ]}
      />

      <Card className="mt-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Edit Discount Category
          </h3>
          <EditForm category={category} onDone={() => router.refresh()} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-destructive">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Deleting this category is permanent and cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={async () => {
              if (
                confirm(
                  `Permanently delete discount category "${category.name_en}"?`,
                )
              ) {
                const result = await deleteDiscountCategory(
                  category.category_id,
                );
                if (result.operation === "error") {
                  alert(result.message);
                } else {
                  router.push("/admin/discount-category");
                }
              }
            }}
          >
            Delete Category
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function EditForm({
  category,
  onDone,
}: {
  category: DiscountCategoryItem;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const name_en = formData.get("name_en") as string;
      const name_ar = formData.get("name_ar") as string | null;
      const image = formData.get("image") as string | null;
      const result = await updateDiscountCategory(
        category.category_id,
        name_en,
        name_ar || null,
        image || null,
      );
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1.5">
        <Label htmlFor="edit_name_en">Name (EN) *</Label>
        <Input
          id="edit_name_en"
          name="name_en"
          defaultValue={category.name_en}
          required
          maxLength={255}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="edit_name_ar">Name (AR)</Label>
        <Input
          id="edit_name_ar"
          name="name_ar"
          defaultValue={category.name_ar ?? ""}
          maxLength={255}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="edit_image">Image URL</Label>
        <Input
          id="edit_image"
          name="image"
          defaultValue={category.image ?? ""}
          maxLength={255}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Changes"}
      </Button>
      {state?.error ? (
        <Alert variant="destructive" className="w-full mt-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
