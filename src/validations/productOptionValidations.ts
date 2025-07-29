import { z } from "zod";

export const validateProductOptionCreate = z.object({
  product_id: z
    .number({ invalid_type_error: "Product ID must be a number" })
    .int({ message: "Product ID must be an integer" }),

  option_name: z
    .string({ required_error: "Option name is required" })
    .min(1, { message: "Option name is required" })
    .max(100, { message: "Option name must be at most 100 characters" }),

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative({ message: "Price must be a positive value" }),

  duration_type: z
    .string({ required_error: "Duration type is required" })
    .min(1, { message: "Duration type is required" })
    .max(20, { message: "Duration type must be at most 20 characters" }),

  duration: z
    .number({ invalid_type_error: "Duration must be a number" })
    .int()
    .nonnegative({ message: "Duration must be a non-negative number" }),

  start_limit: z
    .number({
      invalid_type_error: "Start limit must be a number",
      required_error: "Start limit is required",
    })
    .int({ message: "Start limit must be an integer" })
    .nonnegative({ message: "Start limit must be a non-negative number" }),

  end_limit: z
    .number({
      invalid_type_error: "End limit must be a number",
      required_error: "End limit is required",
    })
    .int({
      message: "End limit must be an integer",
    })
    .nonnegative({
      message: "End limit must be a non-negative number",
    }),

  stamp_duty: z
    .number({
      invalid_type_error: "Stamp Duty must be a number",
      required_error: "Stamp Duty is required",
    })
    .int({
      message: "Stamp Duty must be an integer",
    })
    .nonnegative({
      message: "Stamp Duty must be a non-negative number",
    }),

  sales_tax: z
    .number({
      invalid_type_error: "Sales Tax must be a number",
      required_error: "Sales Tax is required",
    })
    .int({
      message: "Sales Tax must be an integer",
    })
    .nonnegative({
      message: "Sales Tax must be a non-negative number",
    }),

  federal_insurance_fee: z
    .number({
      invalid_type_error: "Federal Insurance Fee must be a number",
      required_error: "Federal Insurance Fee is required",
    })
    .int({
      message: "Federal Insurance Fee must be an integer",
    })
    .nonnegative({
      message: "Federal Insurance Fee must be a non-negative number",
    }),

  gross_premium: z
    .number({
      invalid_type_error: "Gross Premium must be a number",
      required_error: "Gross Premium is required",
    })
    .int({
      message: "Gross Premium must be an integer",
    })
    .nonnegative({
      message: "Gross Premium must be a non-negative number",
    }),

  subtotal: z
    .number({
      invalid_type_error: "Subtotal must be a number",
      required_error: "Subtotal is required",
    })
    .int({
      message: "Subtotal must be an integer",
    })
    .nonnegative({
      message: "Subtotal must be a non-negative number",
    }),

  administrative_subcharges: z
    .number({
      invalid_type_error: "Administrative Subcharges must be a number",
      required_error: "Administrative Subcharges is required",
    })
    .int({
      message: "Administrative Subcharges must be an integer",
    })
    .nonnegative({
      message: "Administrative Subcharges must be a non-negative number",
    }),

  start_limit_mother: z
    .number({
      required_error: "Start limit mother is required",
      invalid_type_error: "Start limit mother must be a number",
    })
    .int({
      message: "Start limit mother must be an integer",
    })
    .nonnegative({
      message: "Start limit mother must be a non-negative number",
    }),

  end_limit_mother: z
    .number({
      required_error: "End limit mother is required",
      invalid_type_error: "End limit mother must be a number",
    })
    .int({
      message: "End limit mother must be an integer",
    })
    .nonnegative({
      message: "End limit mother must be a non-negative number",
    }),

  plan_code: z
    .string()
    .max(45, { message: "Plan code must be at most 45 characters" })
    .optional(),
});

export const validateProductOptionUpdate = validateProductOptionCreate.extend({
  product_option_id: z
    .number({ required_error: "Product Option ID is required" })
    .int({ message: "Product Option ID must be an integer" })
    .positive({ message: "Product Option ID must be a positive number" }),
});

export type ProductOptionType = z.infer<typeof validateProductOptionCreate>;
export type ProductOptionUpdateType = z.infer<typeof validateProductOptionUpdate>;