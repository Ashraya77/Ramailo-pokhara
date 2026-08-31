"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  FileEdit,
  Eye,
  Search,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleListItem, ArticleListMeta } from "@/frontend/lib/admin-types";
import { apiGet, apiDelete, apiPatch } from "@/frontend/lib/api-client";
import { useAdminI18n } from "@/components/admin/admin-language-provider";

type ArticleTableProps = {
  initialArticles: ArticleListItem[];
  initialMeta: ArticleListMeta;
  categories: Array<{ id: string; name: string }>;
};

export function ArticleTable({
  initialArticles,
  initialMeta,
  categories,
}: ArticleTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dictionary, locale } = useAdminI18n();

  const [articles, setArticles] = useState<ArticleListItem[]>(initialArticles);
  const [meta, setMeta] = useState<ArticleListMeta>(initialMeta);
  const [loading, setLoading] = useState(false);

  // Filter States synced with URL or defaults
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "ALL");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") ?? "ALL");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));

  // Delete Alert States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<ArticleListItem | undefined>(undefined);
  const statusItems = [
    { value: "ALL", label: dictionary.articles.allStatuses },
    { value: "DRAFT", label: dictionary.status.draft },
    { value: "PUBLISHED", label: dictionary.status.published },
    { value: "ARCHIVED", label: dictionary.status.archived },
  ];
  const categoryItems = [
    { value: "ALL", label: dictionary.articles.allCategories },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];
  const numberFormatter = new Intl.NumberFormat(locale);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state with URL change (e.g., when browser back button pressed)
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setStatus(searchParams.get("status") ?? "ALL");
    setCategoryId(searchParams.get("categoryId") ?? "ALL");
    setPage(Number(searchParams.get("page") ?? "1"));
    fetchArticles();
  }, [searchParams]);

  const updateUrlParams = (newPage = page, newStatus = status, newCategoryId = categoryId) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (newStatus !== "ALL") params.set("status", newStatus);
    if (newCategoryId !== "ALL") params.set("categoryId", newCategoryId);
    if (newPage > 1) params.set("page", String(newPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchArticles = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      admin: "true",
      page: String(page),
      limit: "10",
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== "ALL" ? { status } : {}),
      ...(categoryId !== "ALL" ? { categoryId } : {}),
    });

    try {
      const response = await apiGet<ArticleListItem[]>(`/api/articles?${queryParams.toString()}`);
      setArticles(response.data);
      if (response.meta) {
        setMeta(response.meta as ArticleListMeta);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(dictionary.articles.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (val: string | null) => {
    if (!val) return;
    setStatus(val);
    setPage(1);
    updateUrlParams(1, val, categoryId);
  };

  const handleCategoryChange = (val: string | null) => {
    if (!val) return;
    setCategoryId(val);
    setPage(1);
    updateUrlParams(1, status, val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(newPage, status, categoryId);
  };

  const handleToggleStatus = async (article: ArticleListItem) => {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await apiPatch(`/api/articles/${article.id}`, { status: nextStatus });
      toast.success(dictionary.articles.statusUpdated);
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? dictionary.articles.updateError);
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    try {
      await apiDelete(`/api/articles/${articleToDelete.id}`);
      toast.success(dictionary.articles.deleted);
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? dictionary.articles.deleteError);
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
          <Input
            type="search"
            placeholder={`${dictionary.articles.search}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            items={statusItems}
            value={status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[130px]">
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

          {/* Category Filter */}
          <Select
            items={categoryItems}
            value={categoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
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
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{dictionary.articles.image}</TableHead>
              <TableHead>{dictionary.articles.titleColumn}</TableHead>
              <TableHead>{dictionary.articles.category}</TableHead>
              <TableHead>{dictionary.articles.status}</TableHead>
              <TableHead>{dictionary.articles.badges}</TableHead>
              <TableHead>{dictionary.articles.updated}</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">{dictionary.common.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="h-10 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-60 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : articles.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-6">
                    <FileEdit className="h-10 w-10 mb-2" />
                    <p className="font-semibold text-sm">
                      {dictionary.articles.noArticlesFound}
                    </p>
                    <p className="text-xs max-w-xs mt-1">
                      {dictionary.articles.noArticlesMatch}
                    </p>
                    {(search || status !== "ALL" || categoryId !== "ALL") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setStatus("ALL");
                          setCategoryId("ALL");
                          updateUrlParams(1, "ALL", "ALL");
                        }}
                        className="mt-4"
                      >
                        {dictionary.articles.clearFilters}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Actual Table Rows
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative h-10 w-16 bg-muted border rounded overflow-hidden flex items-center justify-center">
                      {article.featuredImage ? (
                        <Image
                          src={article.featuredImage}
                          alt={article.featuredImageAlt ?? ""}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="font-medium text-sm line-clamp-1">
                      {article.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      /{article.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.category && (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded font-medium text-[10px]"
                        style={{
                          backgroundColor: `${article.category.color}15`,
                          color: article.category.color ?? "inherit",
                        }}
                      >
                        {article.category.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === "PUBLISHED"
                          ? "default"
                          : article.status === "DRAFT"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {article.status === "PUBLISHED"
                        ? dictionary.status.published
                        : article.status === "DRAFT"
                          ? dictionary.status.draft
                          : dictionary.status.archived}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {article.isFeatured && (
                        <span title={dictionary.articles.featured}>
                          <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500 shrink-0" />
                        </span>
                      )}
                      {article.isBreaking && (
                        <span title={dictionary.articles.breakingNews}>
                          <Zap className="h-4.5 w-4.5 text-rose-500 fill-rose-500 shrink-0" />
                        </span>
                      )}
                      {!article.isFeatured && !article.isBreaking && (
                        <span className="text-muted-foreground text-xs font-normal">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(article.updatedAt))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{dictionary.common.openMenu}</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{dictionary.common.actions}</DropdownMenuLabel>
                        <DropdownMenuItem
                          render={<Link href={`/admin/articles/${article.id}/edit`} />}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {dictionary.articles.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(article)}>
                          {article.status === "PUBLISHED" ? (
                            <>
                              <FileEdit className="mr-2 h-4 w-4" />
                              {dictionary.articles.moveToDraft}
                            </>
                          ) : (
                            <>
                              <Globe className="mr-2 h-4 w-4" />
                              {dictionary.articles.publish}
                            </>
                          )}
                        </DropdownMenuItem>
                        {article.status === "PUBLISHED" && (
                          <DropdownMenuItem
                            render={<Link href={`/articles/${article.slug}`} target="_blank" />}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {dictionary.articles.viewPublic}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setArticleToDelete(article);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {dictionary.articles.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {dictionary.common.page} {numberFormatter.format(meta.page)} {dictionary.common.of}{" "}
            {numberFormatter.format(meta.totalPages)} ({numberFormatter.format(meta.total)}{" "}
            {dictionary.common.totalItems})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage || loading}
              onClick={() => handlePageChange(meta.page - 1)}
            >
              {dictionary.common.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || loading}
              onClick={() => handlePageChange(meta.page + 1)}
            >
              {dictionary.common.next}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.articles.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.articles.deleteDescription}
              {articleToDelete && (
                <strong className="text-foreground font-semibold">
                  {" "}
                  &ldquo;{articleToDelete.title}&rdquo;
                </strong>
              )}{" "}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArticleToDelete(undefined)}>
              {dictionary.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {dictionary.articles.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
