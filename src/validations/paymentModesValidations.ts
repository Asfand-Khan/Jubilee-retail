import { z } from "zod";

export const validatePaymentModeSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name cannot be empty" }),
  payment_code: z
    .string({ required_error: "Payment Code is required" })
    .min(1, { message: "Payment Code cannot be empty" }),
});

export const validateSinglePaymentModeSchema = z.object({
  payment_mode_id: z
    .number({ required_error: "Payment Mode ID is required" })
    .int({ message: "Payment Mode ID must be an integer" }),
});

export const validateUpdatePaymentModeSchema = validatePaymentModeSchema.extend({
  payment_mode_id: z
    .number({ required_error: "Payment Mode ID is required" })
    .int({ message: "Payment Mode ID must be an integer" }),
})

export type PaymentModeType = z.infer<typeof validatePaymentModeSchema>;
export type SinglePaymentModeType = z.infer<typeof validateSinglePaymentModeSchema>;
export type UpdatePaymentModeType = z.infer<typeof validateUpdatePaymentModeSchema>;