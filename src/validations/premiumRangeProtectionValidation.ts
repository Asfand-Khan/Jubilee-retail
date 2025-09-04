import { z } from "zod";

export const validatePremiumRangeProtectionSchema = z.object({
  premium_start: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message:
        "Premium start must be a valid decimal number with up to 2 decimal places.",
    })
    .min(1, { message: "Premium start is required." }),

  premium_end: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message:
        "Premium end must be a valid decimal number with up to 2 decimal places.",
    })
    .min(1, { message: "Premium end is required." }),

  net_premium: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message:
        "Net premium must be a valid decimal number with up to 2 decimal places.",
    })
    .min(1, { message: "Net premium is required." }),

  api_user_id: z
    .number()
    .int({ message: "API User ID must be an integer." })
    .positive({ message: "API User ID must be a positive number." }),

  duration: z
    .number()
    .int({ message: "Duration must be an integer." })
    .positive({ message: "Duration must be a positive number." }),

  duration_type: z.enum(["days", "months", "years"], {
    message: "Duration type must be one of: days, months, or years.",
  }),
});

export const validateSinglePremiumRangeProtectionSchema = z.object({
  id: z
    .number()
    .int({ message: "ID must be an integer." })
    .positive({ message: "ID must be a positive number." }),
});

export const validateUpdatePremiumRangeProtectionSchema =
  validateSinglePremiumRangeProtectionSchema.extend({
    ...validatePremiumRangeProtectionSchema.shape,
  });

export type PremiumRangeProtectionSchema = z.infer<typeof validatePremiumRangeProtectionSchema>;
export type SinglePremiumRangeProtectionSchema = z.infer<typeof validateSinglePremiumRangeProtectionSchema>;
export type UpdatePremiumRangeProtectionSchema = z.infer<typeof validateUpdatePremiumRangeProtectionSchema>;
