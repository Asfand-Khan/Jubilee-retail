import { z } from "zod";

export const validateCommunication = z.object({
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
