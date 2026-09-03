"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugifyOrFallback } from "@/app/lib/slug";
import { countGraphemes } from "@/app/lib/text";
import { post as apiPost } from "@/lib/apiClient";
import { CategoryListItem } from "@/lib/admin-types";
import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { InputLanguageToggle } from "@/components/admin/input-language-toggle";
import {
  handleNepaliInputBlur,
  handleNepaliInputCommit,
} from "@/app/lib/nepali-input";

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) >= 2, "Name must contain at least 2 characters.")
    .refine((value) => countGraphemes(value) <= 80, "Name must contain at most 80 characters."),
  slug: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 100, "Slug must contain at most 100 characters.")
    .refine((val) => val === "" || /^[a-z0-9-]+$/.test(val), {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    })
    .optional(),
  description: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 500, "Description must contain at most 500 characters.")
    .nullable()
    .optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a six-digit hex value (e.g., #3b82f6).")
    .nullable()
    .optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be an integer.")
    .nonnegative("Sort order cannot be negative."),
});

type CategoryFormValues = {
  name: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type CategoryFormProps = {
  mode: "create" | "edit";
  initialData?: CategoryListItem;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CategoryForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { dictionary, language } = useAdminI18n();
  const [loading, setLoading] = useState(false);
  const [nepaliTypingEnabled, setNepaliTypingEnabled] = useState(language === "np");
  const slugManuallyEdited = useRef(mode === "edit");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      color: initialData?.color ?? "#3b82f6",
      isActive: initialData?.isActive ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedName = watch("name");
  const watchedColor = watch("color");
  const {
    onBlur: onNameBlur,
    ...nameField
  } = register("name");
  const {
    onBlur: onDescriptionBlur,
    ...descriptionField
  } = register("description");

  // Auto-generate slug from name if not manually edited (only in create mode)
  useEffect(() => {
    if (mode === "create" && !slugManuallyEdited.current && watchedName) {
      setValue("slug", slugifyOrFallback(watchedName, "category"), {
        shouldValidate: true,
      });
    }
  }, [watchedName, setValue, mode]);

  useEffect(() => {
    setNepaliTypingEnabled(language === "np");
  }, [language]);

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    const slugSource = values.slug?.trim() || values.name;
    const finalSlug = slugifyOrFallback(slugSource, "category");

    const payload = {
      ...values,
      slug: finalSlug,
    };

    try {
      if (mode === "create") {
        await apiPost("/api/categories", payload);
        toast.success(dictionary.categories.created);
      } else {
        if (!initialData?.id) return;
        await apiPost(`/api/categories/${initialData.id}`, payload, {
          headers: { "X-HTTP-Method-Override": "PATCH" },
        });
        toast.success(dictionary.categories.updated);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? dictionary.common.somethingWentWrong);
      if (err.details?.issues) {
        // Map backend validation issues to fields
        err.details.issues.forEach((issue: any) => {
          const path = issue.path[0] as keyof CategoryFormValues;
          if (path) {
            form.setError(path, { type: "manual", message: issue.message });
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{dictionary.categories.name}</Label>
        <Input
          id="name"
          placeholder={dictionary.categories.namePlaceholder}
          disabled={loading}
          onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
          onBlur={(event) => {
            onNameBlur(event);
            handleNepaliInputBlur(event, nepaliTypingEnabled);
          }}
          {...nameField}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <InputLanguageToggle
        enabled={nepaliTypingEnabled}
        onChange={setNepaliTypingEnabled}
        label={dictionary.articleForm.typingLabel}
        disabled={loading}
      />

      <div className="space-y-2">
        <Label htmlFor="slug">{dictionary.categories.slug}</Label>
        <Input
          id="slug"
          placeholder={dictionary.categories.slugPlaceholder}
          disabled={loading}
          {...register("slug", {
            onChange: () => {
              slugManuallyEdited.current = true;
            },
          })}
        />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{dictionary.categories.descriptionOptional}</Label>
        <Textarea
          id="description"
          placeholder={dictionary.categories.descriptionPlaceholder}
          disabled={loading}
          onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
          onBlur={(event) => {
            onDescriptionBlur(event);
            handleNepaliInputBlur(event, nepaliTypingEnabled);
          }}
          {...descriptionField}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">{dictionary.categories.themeColor}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="color-picker"
              disabled={loading}
              value={watchedColor ?? "#3b82f6"}
              onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
              className="w-12 h-10 p-1 shrink-0 cursor-pointer"
            />
            <Input
              id="color"
              placeholder="#3b82f6"
              disabled={loading}
              {...register("color")}
              className="font-mono"
            />
          </div>
          {errors.color && (
            <p className="text-xs text-destructive">{errors.color.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">{dictionary.categories.sortOrder}</Label>
          <Input
            type="number"
            id="sortOrder"
            disabled={loading}
            {...register("sortOrder")}
          />
          {errors.sortOrder && (
            <p className="text-xs text-destructive">{errors.sortOrder.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border rounded-md p-3">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-sm font-medium">
            {dictionary.categories.activeStatus}
          </Label>
          <p className="text-xs text-muted-foreground">
            {dictionary.categories.inactiveHint}
          </p>
        </div>
        <Switch
          id="isActive"
          disabled={loading}
          checked={watch("isActive")}
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {dictionary.common.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading
            ? dictionary.common.saving
            : mode === "create"
              ? dictionary.categories.create
              : dictionary.categories.saveChanges}
        </Button>
      </div>
    </form>
  );
}
