import { countGraphemes } from "@/app/lib/text";
import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .refine(
    (value) => countGraphemes(value) >= 2,
    "Name must contain at least 2 characters.",
  )
  .refine(
    (value) => countGraphemes(value) <= 80,
    "Name must contain at most 80 characters.",
  );

const slugSchema = z
  .string()
  .trim()
  .refine(
    (value) => countGraphemes(value) <= 100,
    "Slug must contain at most 100 characters.",
  );

const descriptionSchema = z
  .string()
  .trim()
  .refine(
    (value) => countGraphemes(value) <= 500,
    "Description must contain at most 500 characters.",
  )
  .nullable();

const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a six-digit hex value.")
  .nullable();

const categoryFields = {
  name: nameSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema.optional(),
  color: colorSchema.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z
    .number()
    .int("Sort order must be an integer.")
    .nonnegative("Sort order cannot be negative.")
    .optional(),
};

export const createCategorySchema = z
  .object({
    ...categoryFields,
    isActive: categoryFields.isActive.default(true),
    sortOrder: categoryFields.sortOrder.default(0),
  })
  .strict();

export const updateCategorySchema = z
  .object(categoryFields)
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be supplied.",
  });

export const categoryListQuerySchema = z
  .object({
    active: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    search: z.string().trim().max(100).optional(),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
