import { z } from "zod";

export const validateWebappMapperCreate = z.object({
  parent_sku: z
    .string({ required_error: "Parent SKU is required" })
    .min(1, { message: "Parent SKU cannot be empty" })
    .max(200, { message: "Parent SKU must not exceed 200 characters" }),

  child_sku: z
    .string({ required_error: "Child SKU is required" })
    .min(1, { message: "Child SKU cannot be empty" })
    .max(200, { message: "Child SKU must not exceed 200 characters" }),

  plan_id: z
    .number({ required_error: "Plan ID is required" })
    .int({ message: "Plan ID must be an integer" }),

  product_id: z
    .number({ required_error: "Product ID is required" })
    .int({ message: "Product ID must be an integer" }),

  option_id: z
    .number({ required_error: "Option ID is required" })
    .int({ message: "Option ID must be an integer" }),
});

export const validateWebappMapperUpdate = validateWebappMapperCreate.extend({
  webapp_mapper_id: z
    .number({ required_error: "Webapp Mapper ID is required" })
    .int({ message: "Webapp Mapper ID must be an integer" }),
});

export type WebappMapper = z.infer<typeof validateWebappMapperCreate>;
export type WebappMapperUpdate = z.infer<typeof validateWebappMapperUpdate>;