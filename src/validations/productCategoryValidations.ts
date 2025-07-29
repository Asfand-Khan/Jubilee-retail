import { z } from "zod";

export const validateProductCategoryCreate = z.object({
  name: z
    .string({
      required_error: "Product Category name is required",
      invalid_type_error: "Product Category name must be a string",
    })
    .min(1, { message: "Product Category is required" })
    .max(100, { message: "Product Category must be at most 100 characters" }),
  igis_product_code: z
    .string({
      required_error: "IGIS Product Code is required",
      invalid_type_error: "IGIS Product Code must be a string",
    })
    .min(6, { message: "IGIS Product Code must be at least 6 characters" })
    .max(8, { message: "IGIS Product Code must be at least 8 characters" }),
  department_id: z
    .number({
      invalid_type_error: "Department ID must be a number",
    })
    .int({
      message: "Department ID must be an integer",
    })
    .positive({
      message: "Department ID must be a positive number",
    })
    .optional()
    .nullable(),
});

export const validateProductCategoryUpdate =
  validateProductCategoryCreate.extend({
    product_category_id: z
      .number({
        required_error: "Product Category ID is required",
        invalid_type_error: "Product Category ID must be a number",
      })
      .int({
        message: "Product Category ID must be an integer",
      }),
  });

export type ProductCategoryType = z.infer<typeof validateProductCategoryCreate>;
export type ProductCategoryUpdateType = z.infer<
  typeof validateProductCategoryUpdate
>;