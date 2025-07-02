import { z } from "zod";

export const validateCourier = z.object({
  name: z
    .string({
      required_error: "Courier name is required",
      invalid_type_error: "Courier name must be a string",
    })
    .min(1, { message: "Courier name cannot be empty" })
    .max(50, { message: "Courier name must not exceed 50 characters" }),

  api_code: z
    .string({
      required_error: "API code is required",
      invalid_type_error: "API code must be a string",
    })
    .min(1, { message: "API code cannot be empty" })
    .max(100, { message: "API code must not exceed 100 characters" }),

  account_number: z
    .string({
      required_error: "Account number is required",
      invalid_type_error: "Account number must be a string",
    })
    .min(1, { message: "Account number cannot be empty" })
    .max(100, { message: "Account number must not exceed 100 characters" }),

  user: z
    .string({
      required_error: "User is required",
      invalid_type_error: "User must be a string",
    })
    .min(1, { message: "User cannot be empty" })
    .max(100, { message: "User must not exceed 100 characters" }),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(1, { message: "Password cannot be empty" })
    .max(100, { message: "Password must not exceed 100 characters" }),

  book_url: z
    .string({
      invalid_type_error: "Book URL must be a string",
    })
    .max(255, { message: "Book URL must not exceed 255 characters" })
    .url({ message: "Invalid book URL" })
    .optional()
    .nullable(),

  tracking_url: z
    .string({
      invalid_type_error: "Tracking URL must be a string",
    })
    .max(255, { message: "Tracking URL must not exceed 255 characters" })
    .url({ message: "Invalid tracking URL" })
    .optional()
    .nullable(),

  is_takaful: z
    .boolean({
      invalid_type_error: "is_takaful must be true or false",
    })
    .optional()
    .default(false),
});

export const validateCourierUpdate = validateCourier.extend({
  courier_id: z
    .number({
      required_error: "Courier ID is required",
    })
    .int({
      message: "Courier ID must be an integer",
    }),
});

export type CourierType = z.infer<typeof validateCourier>;
export type CourierUpdateType = z.infer<typeof validateCourierUpdate>;
