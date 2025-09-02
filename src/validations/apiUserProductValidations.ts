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

export type ApiUserProductType = z.infer<typeof validateApiUserProductSchema>;
export type SingleApiUserProductType = z.infer<typeof validateSingleApiUserProductSchema>;