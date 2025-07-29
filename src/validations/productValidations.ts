import { z } from "zod";

export const productTypeEnum = z.enum(["nonhealth", "health", "travel"]);

export const validateProductCreate = z.object({
  product_name: z
    .string()
    .min(1, { message: "Product name is required" })
    .max(100, { message: "Product name must be at most 100 characters" }),

  product_type: productTypeEnum,

  product_category_id: z
    .number({ invalid_type_error: "Product category ID must be a number" })
    .int({ message: "Product category ID must be an integer" }),
});

export const validateProductUpdate = validateProductCreate.extend({
  product_id: z
    .number({ required_error: "Product ID is required" })
    .int({ message: "Product ID must be an integer" })
    .positive({ message: "Product ID must be a positive number" }),
});

export type ProductType = z.infer<typeof validateProductCreate>;
export type ProductUpdateType = z.infer<typeof validateProductUpdate>;