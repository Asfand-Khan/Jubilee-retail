import { z } from "zod";

export const validateProductTypeCreate = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string.",
    })
    .max(200, "Name must be 200 characters or less."),
  days: z
    .number({
      required_error: "Days is required.",
      invalid_type_error: "Days must be a number.",
    })
    .int({
      message: "Days must be an integer.",
    })
    .positive(),
});

export const validateProductTypeUpdate = validateProductTypeCreate.extend({
  product_type_id: z
    .number({
      required_error: "Product Type ID is required",
      invalid_type_error: "Product Type ID must be a number",
    })
    .int({
      message: "Product Type ID must be an integer",
    }),
});

export type ProductType = z.infer<typeof validateProductTypeCreate>;
export type ProductTypeUpdate = z.infer<typeof validateProductTypeUpdate>;
