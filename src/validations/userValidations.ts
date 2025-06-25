import { z } from "zod";

// Base64 regex for validating base64 strings
const base64Regex = /^(data:[\w\-/]+;base64,)?([A-Za-z0-9+/=]|\r|\n)*$/;

export const UserSchema = z.object({
  created_by: z.number().int(),
});

export const validateUserRegister = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .toLowerCase()
    .trim()
    .min(3, { message: "Username should be at least 3 characters" }),
  fullname: z
    .string({ required_error: "Fullname is required" })
    .trim()
    .min(3, { message: "Fullname should be at least 3 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  phone: z
    .string({ required_error: "Phone number is required" })
    .max(20, { message: "Phone number should not exceed 20 characters" })
    .min(11, { message: "Phone number should be at least 11 characters" })
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password should be at least 8 characters" })
    .trim(),
  image: z
    .string()
    .regex(base64Regex, { message: "Invalid base64 string" })
    .optional(),
  user_type: z.enum(["dashboard_user", "api_user"]).default("dashboard_user"),
  is_active: z.boolean().default(false),
  created_by: z
    .number({
      required_error: "Created by is required",
    })
    .int(),
  menu_rights: z
    .array(
      z.object({
        menu_id: z.number({
          required_error: "Menu ID is required",
        }),
        can_view: z
          .boolean({
            required_error: "Can view is required",
          })
          .default(true),
        can_create: z
          .boolean({
            required_error: "Can create is required",
          })
          .default(false),
        can_edit: z
          .boolean({
            required_error: "Can edit is required",
          })
          .default(false),
        can_delete: z
          .boolean({
            required_error: "Can delete is required",
          })
          .default(false),
      }),
      { required_error: "Menu rights are required" }
    )
    .min(1, { message: "At least one menu right is required" }),
});

export const validateUserUpdate = z.object({
  user_id: z
    .number({
      required_error: "User ID is required",
    })
    .int({
      message: "User ID must be an integer",
    }),
  username: z
    .string({ required_error: "Username is required" })
    .toLowerCase()
    .trim()
    .min(3, { message: "Username should be at least 3 characters" }),
  fullname: z
    .string({ required_error: "Fullname is required" })
    .trim()
    .min(3, { message: "Fullname should be at least 3 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  phone: z
    .string({ required_error: "Phone number is required" })
    .max(20, { message: "Phone number should not exceed 20 characters" })
    .min(11, { message: "Phone number should be at least 11 characters" })
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password should be at least 8 characters" })
    .trim()
    .optional(),
  image: z
    .string()
    .regex(base64Regex, { message: "Invalid base64 string" })
    .optional(),
  is_active: z.boolean().default(false),
  is_locked: z.boolean().default(false),
  user_type: z.enum(["dashboard_user", "api_user"]),
  menu_rights: z
    .array(
      z.object({
        menu_id: z.number({
          required_error: "Menu ID is required",
        }),
        can_view: z
          .boolean({
            required_error: "Can view is required",
          })
          .default(true),
        can_create: z
          .boolean({
            required_error: "Can create is required",
          })
          .default(false),
        can_edit: z
          .boolean({
            required_error: "Can edit is required",
          })
          .default(false),
        can_delete: z
          .boolean({
            required_error: "Can delete is required",
          })
          .default(false),
      }),
      { required_error: "Menu rights are required" }
    )
    .min(1, { message: "At least one menu right is required" }),
});

export const validateUserLogin = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .toLowerCase()
    .trim()
    .min(3, { message: "Username should be at least 3 characters" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password should be at least 8 characters" })
    .trim(),
});

export const validateSendOtp = z.object({
  username: z
    .string({ required_error: "username is required" })
    .toLowerCase()
    .trim(),
  type: z.enum(["email", "sms"], { required_error: "Type is required" }),
});

export const verifyOtp = z.object({
  username: z
    .string({ required_error: "username is required" })
    .toLowerCase()
    .trim(),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .min(6, { message: "OTP should be 6 digits" })
    .max(6, { message: "OTP should be 6 digits" }),
});

export type VerifyOtp = z.infer<typeof verifyOtp>;
export type SendOtp = z.infer<typeof validateSendOtp>;
export type UserLogin = z.infer<typeof validateUserLogin>;
export type UserRegister = z.infer<typeof validateUserRegister>;
export type UserUpdate = z.infer<typeof validateUserUpdate>;
