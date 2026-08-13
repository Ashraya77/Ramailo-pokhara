"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countGraphemes, hasVisibleText } from "@/app/lib/text";
import {
  createFallbackSlug,
  slugify,
  slugifyOrFallback,
} from "@/app/lib/slug";
import { apiPost, apiPatch } from "@/lib/api-client";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { ArticleListItem } from "@/lib/admin-types";
import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { InputLanguageToggle } from "@/components/admin/input-language-toggle";
import {
  handleNepaliInputBlur,
  handleNepaliInputCommit,
} from "@/app/lib/nepali-input";

// Schema for client-side validation, mapping exactly to backend Zod schemas
const articleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) >= 5, "Title must contain at least 5 characters.")
    .refine((value) => countGraphemes(value) <= 200, "Title must contain at most 200 characters."),
  slug: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 220, "Slug must contain at most 220 characters.")
    .refine((val) => val === "" || /^[a-z0-9-]+$/.test(val), {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    })
    .optional(),
  excerpt: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 500, "Excerpt must contain at most 500 characters.")
    .nullable()
    .optional(),
  content: z
    .string()
    .refine((val) => hasVisibleText(val), {
      message: "Article content cannot be empty.",
    }),
  featuredImage: z.string().trim().nullable().optional(),
  featuredImageAlt: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 200, "Alt text must contain at most 200 characters.")
    .nullable()
    .optional(),
  youtubeUrl: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
          if (hostname === "youtu.be") return url.pathname.slice(1).length > 0;
          if (hostname === "youtube.com" || hostname === "m.youtube.com") {
            return (
              (url.pathname === "/watch" && Boolean(url.searchParams.get("v"))) ||
              (url.pathname.startsWith("/embed/") && url.pathname.length > 7)
            );
          }
          return false;
        } catch {
          return false;
        }
      },
      { message: "Invalid YouTube URL format." }
    ),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  categoryId: z.string().trim().min(1, "Category is required."),
  metaTitle: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 70, "Meta title must contain at most 70 characters.")
    .nullable()
    .optional(),
  metaDescription: z
    .string()
    .trim()
    .refine((value) => countGraphemes(value) <= 170, "Meta description must contain at most 170 characters.")
    .nullable()
    .optional(),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type ArticleFormProps = {
  mode: "create" | "edit";
  initialData?: ArticleListItem & { content?: string; categoryId?: string };
  categories: CategoryOption[];
};

export function ArticleForm({ mode, initialData, categories }: ArticleFormProps) {
  const router = useRouter();
  const { dictionary, language } = useAdminI18n();
  const [saving, setSaving] = useState(false);
  const [nepaliTypingEnabled, setNepaliTypingEnabled] = useState(language === "np");
  const slugManuallyEdited = useRef(mode === "edit");

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      featuredImage: initialData?.featuredImage ?? null,
      featuredImageAlt: initialData?.featuredImageAlt ?? "",
      youtubeUrl: initialData?.youtubeUrl ?? "",
      status: initialData?.status ?? "DRAFT",
      isFeatured: initialData?.isFeatured ?? false,
      isBreaking: initialData?.isBreaking ?? false,
      categoryId: initialData?.categoryId ?? "",
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedTitle = watch("title");
  const watchedMetaTitle = watch("metaTitle");
  const watchedMetaDescription = watch("metaDescription");
  const {
    onBlur: onTitleBlur,
    ...titleField
  } = register("title");
  const {
    onBlur: onExcerptBlur,
    ...excerptField
  } = register("excerpt");
  const {
    onBlur: onMetaTitleBlur,
    ...metaTitleField
  } = register("metaTitle");
  const {
    onBlur: onMetaDescriptionBlur,
    ...metaDescriptionField
  } = register("metaDescription");
  const statusItems = [
    { value: "DRAFT", label: dictionary.status.draft },
    { value: "PUBLISHED", label: dictionary.status.published },
    { value: "ARCHIVED", label: dictionary.status.archived },
  ];
  const categoryItems = categories
    .filter((category) => {
      const currentCategoryId = initialData?.categoryId ?? initialData?.category?.id;
      return category.isActive || category.id === currentCategoryId;
    })
    .map((category) => ({
      value: category.id,
      label: `${category.name}${category.isActive ? "" : ` (${dictionary.articleForm.inactive})`}`,
    }));

  // Auto-generate slug from title in create mode
  useEffect(() => {
    if (mode === "create" && !slugManuallyEdited.current && watchedTitle) {
      setValue("slug", slugifyOrFallback(watchedTitle, "news"), {
        shouldValidate: true,
      });
    }
  }, [watchedTitle, setValue, mode]);

  useEffect(() => {
    setNepaliTypingEnabled(language === "np");
  }, [language]);

  const handleRegenerateSlug = () => {
    if (watchedTitle) {
      setValue("slug", slugifyOrFallback(watchedTitle, "news"), {
        shouldValidate: true,
      });
    } else {
      toast.error(dictionary.articleForm.enterTitleFirst);
    }
  };

  const onSubmit = async (values: ArticleFormValues) => {
    setSaving(true);
    const slugSource = values.slug?.trim() || values.title;
    const finalSlug =
      slugify(slugSource) ||
      (mode === "edit" && initialData?.slug ? initialData.slug : createFallbackSlug("news"));

    const payload = {
      ...values,
      slug: finalSlug,
      // map empty strings to null for nullable database columns
      excerpt: values.excerpt || null,
      featuredImage: values.featuredImage || null,
      featuredImageAlt: values.featuredImageAlt || null,
      youtubeUrl: values.youtubeUrl || null,
      metaTitle: values.metaTitle || null,
      metaDescription: values.metaDescription || null,
    };

    try {
      if (mode === "create") {
        const response = await apiPost<ArticleListItem>("/api/articles", payload);
        toast.success(dictionary.articleForm.created);
        router.push(`/admin/articles/${response.data.id}/edit`);
      } else {
        if (!initialData?.id) return;
        await apiPatch(`/api/articles/${initialData.id}`, payload);
        toast.success(dictionary.articleForm.updated);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? dictionary.articleForm.saveError);
      if (err.details?.issues) {
        err.details.issues.forEach((issue: any) => {
          const path = issue.path[0] as keyof ArticleFormValues;
          if (path) {
            form.setError(path, { type: "manual", message: issue.message });
          }
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            nativeButton={false}
            render={<Link href="/admin/articles" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {mode === "create"
                ? dictionary.articleForm.createTitle
                : dictionary.articleForm.editTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? dictionary.articleForm.createDescription
                : dictionary.articleForm.editDescription}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={saving}
            nativeButton={false}
            render={<Link href="/admin/articles" />}
          >
            {dictionary.common.cancel}
          </Button>
          <Button type="submit" disabled={saving} className="gap-1.5">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? dictionary.common.saving : dictionary.articleForm.save}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{dictionary.articleForm.title}</Label>
                <Input
                  id="title"
                  placeholder={dictionary.articleForm.titlePlaceholder}
                  disabled={saving}
                  onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
                  onBlur={(event) => {
                    onTitleBlur(event);
                    handleNepaliInputBlur(event, nepaliTypingEnabled);
                  }}
                  {...titleField}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <InputLanguageToggle
                enabled={nepaliTypingEnabled}
                onChange={setNepaliTypingEnabled}
                label={dictionary.articleForm.typingLabel}
                disabled={saving}
              />

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{dictionary.articleForm.slug}</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder={dictionary.articleForm.slugPlaceholder}
                    disabled={saving}
                    {...register("slug", {
                      onChange: () => {
                        slugManuallyEdited.current = true;
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateSlug}
                    disabled={saving}
                    title={dictionary.articleForm.regenerateTitle}
                    className="shrink-0 gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {dictionary.articleForm.regenerate}
                  </Button>
                </div>
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">{dictionary.articleForm.excerpt}</Label>
                <Textarea
                  id="excerpt"
                  placeholder={dictionary.articleForm.excerptPlaceholder}
                  className="h-20 resize-none"
                  disabled={saving}
                  onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
                  onBlur={(event) => {
                    onExcerptBlur(event);
                    handleNepaliInputBlur(event, nepaliTypingEnabled);
                  }}
                  {...excerptField}
                />
                {errors.excerpt && (
                  <p className="text-xs text-destructive">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label>{dictionary.articleForm.body}</Label>
                <RichTextEditor
                  content={watch("content")}
                  onChange={(html) => setValue("content", html, { shouldValidate: true })}
                  nepaliTypingEnabled={nepaliTypingEnabled}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          {/* Status & Category */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">
                {dictionary.articleForm.publishSettings}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">{dictionary.articleForm.publishStatus}</Label>
                <Select
                  items={statusItems}
                  value={watch("status")}
                  onValueChange={(val: any) => setValue("status", val ?? "DRAFT")}
                  disabled={saving}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {dictionary.articleForm.statusHint}
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{dictionary.articleForm.category}</Label>
                <Select
                  items={categoryItems}
                  value={watch("categoryId")}
                  onValueChange={(val: string | null) => setValue("categoryId", val ?? "", { shouldValidate: true })}
                  disabled={saving}
                >
                  <SelectTrigger id="category">
                    <SelectValue>
                      {(value: string) =>
                        categoryItems.find((item) => item.value === value)?.label ??
                        dictionary.articleForm.selectCategory
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categoryItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFeatured" className="text-sm font-medium">
                      {dictionary.articleForm.featured}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {dictionary.articleForm.featuredHint}
                    </p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={watch("isFeatured")}
                    onCheckedChange={(val) => setValue("isFeatured", val)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isBreaking" className="text-sm font-medium">
                      {dictionary.articleForm.breaking}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {dictionary.articleForm.breakingHint}
                    </p>
                  </div>
                  <Switch
                    id="isBreaking"
                    checked={watch("isBreaking")}
                    onCheckedChange={(val) => setValue("isBreaking", val)}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Section */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">
                {dictionary.articleForm.featuredMedia}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              <ImageUpload
                value={watch("featuredImage")}
                onChange={(url) => setValue("featuredImage", url)}
                altText={watch("featuredImageAlt")}
                onAltTextChange={(alt) => setValue("featuredImageAlt", alt)}
                nepaliTypingEnabled={nepaliTypingEnabled}
              />

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">{dictionary.articleForm.youtubeUrl}</Label>
                <Input
                  id="youtubeUrl"
                  placeholder={dictionary.articleForm.youtubeUrlPlaceholder}
                  disabled={saving}
                  {...register("youtubeUrl")}
                />
                {errors.youtubeUrl && (
                  <p className="text-xs text-destructive">{errors.youtubeUrl.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-semibold">
                {dictionary.articleForm.seoSettings}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaTitle">{dictionary.articleForm.metaTitle}</Label>
                  <span
                    className={`text-[10px] font-medium ${
                      countGraphemes(watchedMetaTitle ?? "") > 60
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {countGraphemes(watchedMetaTitle ?? "")} / 70 {dictionary.common.characters}
                  </span>
                </div>
                <Input
                  id="metaTitle"
                  placeholder={dictionary.articleForm.metaTitlePlaceholder}
                  disabled={saving}
                  onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
                  onBlur={(event) => {
                    onMetaTitleBlur(event);
                    handleNepaliInputBlur(event, nepaliTypingEnabled);
                  }}
                  {...metaTitleField}
                />
                {errors.metaTitle && (
                  <p className="text-xs text-destructive">{errors.metaTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaDescription">
                    {dictionary.articleForm.metaDescription}
                  </Label>
                  <span
                    className={`text-[10px] font-medium ${
                      countGraphemes(watchedMetaDescription ?? "") > 160
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {countGraphemes(watchedMetaDescription ?? "")} / 170 {dictionary.common.characters}
                  </span>
                </div>
                <Textarea
                  id="metaDescription"
                  placeholder={dictionary.articleForm.metaDescriptionPlaceholder}
                  className="h-20 resize-none text-xs"
                  disabled={saving}
                  onKeyDown={(event) => handleNepaliInputCommit(event, nepaliTypingEnabled)}
                  onBlur={(event) => {
                    onMetaDescriptionBlur(event);
                    handleNepaliInputBlur(event, nepaliTypingEnabled);
                  }}
                  {...metaDescriptionField}
                />
                {errors.metaDescription && (
                  <p className="text-xs text-destructive">{errors.metaDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
