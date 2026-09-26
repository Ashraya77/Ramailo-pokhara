"use client";

import { useState } from "react";
import {
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Search,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryListItem } from "@/lib/admin-types";
import { CategoryForm } from "@/components/admin/category-form";
import {
  delete as apiDelete,
  get as apiGet,
} from "@/lib/apiClient";
import { useAdminI18n } from "@/components/admin/admin-language-provider";

type CategoryTableProps = {
  initialCategories: CategoryListItem[];
};

export function CategoryTable({ initialCategories }: CategoryTableProps) {
  const { dictionary, locale } = useAdminI18n();
  const [categories, setCategories] = useState<CategoryListItem[]>(initialCategories);
  const [search, setSearch] = useState("");

  // Dialog / AlertDialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<CategoryListItem | undefined>(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryListItem | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const numberFormatter = new Intl.NumberFormat(locale);

  // Refresh categories data from API
  const refreshData = async () => {
    try {
      const response = await apiGet<{
        success: true;
        data: CategoryListItem[];
      }>("/api/categories");
      setCategories(response.data);
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : dictionary.categories.loadError,
      );
    }
  };

  // Delete category
  const handleDelete = async () => {
    const category = categoryToDelete;
    if (!category || isDeleting) return;

    setIsDeleting(true);
    try {
      await apiDelete(`/api/categories/${category.id}`);
      setCategories((currentCategories) =>
        currentCategories.filter(({ id }) => id !== category.id),
      );
      toast.success(dictionary.categories.deleted);
      setDeleteDialogOpen(false);
      setCategoryToDelete(undefined);
    } catch (error: unknown) {
      console.error(error);
      const errorCode =
        error !== null && typeof error === "object" && "code" in error
          ? error.code
          : undefined;

      if (errorCode === "CATEGORY_IN_USE") {
        toast.error(dictionary.categories.inUseError);
      } else {
        toast.error(
          error instanceof Error ? error.message : dictionary.categories.deleteError,
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
          <Input
            type="search"
            placeholder={`${dictionary.categories.search}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          onClick={() => {
            setDialogMode("create");
            setSelectedCategory(undefined);
            setDialogOpen(true);
          }}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {dictionary.categories.add}
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>{dictionary.categories.name}</TableHead>
              <TableHead>{dictionary.categories.slug}</TableHead>
              <TableHead>{dictionary.categories.articleCount}</TableHead>
              <TableHead>{dictionary.categories.sortOrder}</TableHead>
              <TableHead>{dictionary.categories.status}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mb-2" />
                    <p className="font-medium">{dictionary.categories.noCategories}</p>
                    <p className="text-xs">{dictionary.categories.noCategoriesHint}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: category.color ?? "#9ca3af" }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                  <TableCell>{numberFormatter.format(category._count.articles)}</TableCell>
                  <TableCell>{numberFormatter.format(category.sortOrder)}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive
                        ? dictionary.status.active
                        : dictionary.status.inactive}
                    </Badge>
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
                          onClick={() => {
                            setDialogMode("edit");
                            setSelectedCategory(category);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {dictionary.categories.editDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {dictionary.categories.delete}
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

      {/* Create/Edit Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? dictionary.categories.create
                : dictionary.categories.edit}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? dictionary.categories.createDescription
                : dictionary.categories.editDescription}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            mode={dialogMode}
            initialData={selectedCategory}
            onSuccess={() => {
              setDialogOpen(false);
              refreshData();
            }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setDeleteDialogOpen(open);
          if (!open) setCategoryToDelete(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.categories.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.categories.deleteDescription}
              {categoryToDelete && (
                <strong className="text-foreground font-semibold">
                  {" "}
                  &ldquo;{categoryToDelete.name}&rdquo;
                </strong>
              )}{" "}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setCategoryToDelete(undefined)}>
              {dictionary.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? dictionary.common.deleting : dictionary.categories.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
