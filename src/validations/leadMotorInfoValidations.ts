import { z } from "zod";

export const LeadStatusEnum = z.enum([
  "pending",
  "waiting",
  "interested",
  "not_interested",
  "callback_scheduled",
  "cancelled",
]);

const phoneNumber = z
  .string()
  .regex(
    /^03[0-9]{9}$/,
    "Mobile number must start with 03 and be exactly 11 digits"
  )
  .optional();

export const validateLeadMotorInfoSchema = z.object({
  full_name: z
    .string({
      required_error: "Full name is required",
      invalid_type_error: "Full name must be a string",
    })
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name cannot exceed 255 characters"),

  policy_type: z
    .string({
      invalid_type_error: "Policy type must be a string",
    })
    .max(255, "Policy type cannot exceed 255 characters")
    .optional()
    .nullable(),

  mobile: phoneNumber,

  email: z
    .string({
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address format")
    .max(255, "Email cannot exceed 255 characters")
    .optional()
    .nullable(),

  vehicle_make: z
    .string()
    .max(100, "Vehicle make cannot exceed 100 characters")
    .optional()
    .nullable(),

  vehicle_submake: z
    .string()
    .max(100, "Vehicle sub-make cannot exceed 100 characters")
    .optional()
    .nullable(),

  vehicle_model: z
    .string()
    .max(50, "Vehicle model cannot exceed 50 characters")
    .optional()
    .nullable(),

  vehicle_value: z
    .number({
      invalid_type_error: "Vehicle value must be a number",
    })
    .nonnegative("Vehicle value must be a positive number")
    .optional()
    .nullable(),

  vehicle_track_yesno: z
    .boolean({
      invalid_type_error: "Vehicle track yes/no must be true or false",
    })
    .optional()
    .nullable(),

  vehicle_track: z
    .string()
    .max(50, "Vehicle track cannot exceed 50 characters")
    .optional()
    .nullable(),

  premium: z
    .number({
      invalid_type_error: "Premium must be a number",
    })
    .nonnegative("Premium must be a positive number")
    .optional()
    .nullable(),
});

export const validateLeadMotorInfoUpdateSchema = z.object({
  lead_motor_info_id: z
    .number({ required_error: "Lead Motor Info ID is required" })
    .int({ message: "Lead Motor Info ID must be an integer" }),
  status: LeadStatusEnum,
});

export type LeadMotorInfoType = z.infer<typeof validateLeadMotorInfoSchema>;
export type LeadMotorInfoUpdateType = z.infer<
  typeof validateLeadMotorInfoUpdateSchema
>;
