import { z } from "zod";

export const validateCallUsData = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),

  contact: z
    .string()
    .max(20, "Contact number must be at most 20 characters.")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address.")
    .max(255, "Email must be at most 255 characters."),

  is_active: z
    .boolean({ invalid_type_error: "is_active must be true or false." })
    .default(true),
});

export const validateCallUsDataUpdate = validateCallUsData.extend({
  call_us_data_id: z
    .number({ required_error: "City ID is required." })
    .int("City ID must be an integer."),
});

export type CallUsDataType = z.infer<typeof validateCallUsData>;
export type CallUsDataUpdateType = z.infer<typeof validateCallUsDataUpdate>;
