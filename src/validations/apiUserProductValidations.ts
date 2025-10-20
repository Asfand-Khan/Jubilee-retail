import { z } from "zod";

export const validateApiUserProductSchema = z.object({
  api_user_id: z
    .number({ required_error: "Api User ID is required" })
    .int({ message: "Api User ID must be an integer" }),
  product_id: z
    .array(
      z
        .number({ required_error: "Api User ID is required" })
        .int({ message: "Api User ID must be an integer" })
    )
    .min(1, { message: "Product ID is required" }),
});

export const validateSingleApiUserProductSchema = z.object({
  api_user_id: z
    .number({ required_error: "Api User ID is required" })
    .int({ message: "Api User ID must be an integer" }),
});

export const validateApiUserProductListingSchema = z.object({
  date: z
    .string({
      invalid_type_error: "Date range must be a string.",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/,
      "Date must be in format 'YYYY-MM-DD to YYYY-MM-DD'."
    )
    .optional()
    .nullable(),
  api_user_id: z
    .array(
      z.number({
        invalid_type_error: "Api User ID must be a number.",
      })
    )
    .optional()
    .nullable(),
});

export type ApiUserProductType = z.infer<typeof validateApiUserProductSchema>;
export type SingleApiUserProductType = z.infer<
  typeof validateSingleApiUserProductSchema
>;
export type ApiUserProductListingType = z.infer<
  typeof validateApiUserProductListingSchema
>;
