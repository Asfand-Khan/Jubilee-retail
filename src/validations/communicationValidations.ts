import { z } from "zod";

export const validateCommunication = z.object({
  type: z
    .string({
      invalid_type_error: "Type must be a string",
    })
    .nullable()
    .optional(),

  status: z
    .string({
      invalid_type_error: "Status must be a string",
    })
    .nullable()
    .optional(),

  recipient: z
    .string({
      invalid_type_error: "Recipient must be a string",
    })
    .optional()
    .nullable(),

  page: z
    .number({
      invalid_type_error: "Page must be a number",
    })
    .int({
      message: "Page must be an integer",
    })
    .default(1),

  limit: z
    .number({
      invalid_type_error: "Limit must be a number",
    })
    .int({
      message: "Limit must be an integer",
    })
    .default(20),
});

export const validateRepushCommunication = z.object({
  communication_log_id: z
    .number({
      required_error: "Communication Log ID is required",
      invalid_type_error: "Communication Log ID must be a number",
    })
    .int({
      message: "Type must be an integer",
    }),
});

export type ICommunication = z.infer<typeof validateCommunication>;
export type IRepushCommunication = z.infer<typeof validateRepushCommunication>;
