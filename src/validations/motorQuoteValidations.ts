import { z } from "zod";

export const MotorQuoteStatusEnum = z.enum([
  "approved",
  "cancelled",
  "pending",
]);

export const validateMotorQuote = z.object({
  quote_id: z
    .string({ required_error: "Quote ID is required" })
    .max(50, "Quote ID must not exceed 50 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .max(50, "Name must not exceed 50 characters"),
  policy_type: z.string().max(50).nullable().optional(),
  mobile: z.string().max(15).nullable().optional(),
  email: z.string().email().max(50).nullable().optional(),

  premium_value: z.number().int().nullable().optional(),
  rate: z.number().int().nullable().optional(),

  vehicle_make: z.string().max(50).nullable().optional(),
  vehicle_submake: z.string().max(50).nullable().optional(),
  vehicle_model: z.string().max(50).nullable().optional(),
  vehicle_value: z.string().max(50).nullable().optional(),
  vehicle_track: z.string().max(50).nullable().optional(),
  vehicle_body: z.string().max(50).nullable().optional(),
  vehicle_color: z.string().max(50).nullable().optional(),

  reg_no: z.string().max(50).nullable().optional(),
  engine_no: z.string().max(50).nullable().optional(),
  chassis_no: z.string().max(50).nullable().optional(),

  status: MotorQuoteStatusEnum.default("pending"),

  city_id: z.number().int().nullable().optional(),
  agent_id: z.number().int().nullable().optional(),
  branch_id: z.number().int().nullable().optional(),
});

export const validateMotorQuoteUpdate = z.object({
  motor_quote_id: z
    .number({
      required_error: "Motor Quote ID is required",
      invalid_type_error: "Motor Quote ID must be a number",
    })
    .int({
      message: "Motor Quote ID must be an integer",
    }),
  agent_id: z.number().int().nullable().optional(),
  branch_id: z.number().int().nullable().optional(),
});

export const validateMotorQuoteStatusUpdate = z.object({
  motor_quote_id: z
    .number({
      required_error: "Motor Quote ID is required",
      invalid_type_error: "Motor Quote ID must be a number",
    })
    .int({
      message: "Motor Quote ID must be an integer",
    }),
  status: z.enum(["approved", "cancelled"]),
});

export const validateMotorQuoteListing = z.object({
  status: z
    .array(
      z.enum(["approved", "cancelled", "pending"], {
        invalid_type_error:
          "Status must be one of 'approved', 'cancelled', or 'pending'.",
      })
    )
    .optional()
    .nullable(),
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

export type MotorQuote = z.infer<typeof validateMotorQuote>;
export type MotorQuoteUpdateType = z.infer<typeof validateMotorQuoteUpdate>;
export type MotorQuoteStatusUpdateType = z.infer<
  typeof validateMotorQuoteStatusUpdate
>;
export type MotorQuoteListingType = z.infer<typeof validateMotorQuoteListing>;
