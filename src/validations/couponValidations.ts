import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isFutureOrTodayKarachi = (val: string) => {
  if (!dateRegex.test(val)) return false;

  const inputDate = dayjs.tz(val, "YYYY-MM-DD", "Asia/Karachi").startOf("day");
  const todayKarachi = dayjs().tz("Asia/Karachi").startOf("day");

  return inputDate.isSame(todayKarachi) || inputDate.isAfter(todayKarachi);
};

export const validateCouponSchema = z.object({
  code: z
    .string({ required_error: "Coupon code is required." })
    .min(6, "Coupon code must be at least 06 characters.")
    .max(6, "Coupon code must be at most 06 characters."),
  campaign_name: z
    .string({ required_error: "Campaign name is required." })
    .min(2, "Campaign name must be at least 2 characters.")
    .max(150, "Campaign name must be at most 150 characters.")
    .optional(),
  expiry_date: z
    .string({ required_error: "Expiry date is required." })
    .regex(dateRegex, "Expiry date must be in the format YYYY-MM-DD.")
    .refine(
      isFutureOrTodayKarachi,
      "Expiry date must be today or in the future (Asia/Karachi timezone)."
    ),
  application_date: z
    .string()
    .regex(dateRegex, "Application date must be in the format YYYY-MM-DD.")
    .refine(
      isFutureOrTodayKarachi,
      "Application date must be today or in the future (Asia/Karachi timezone)."
    )
    .optional(),
  quantity: z
    .number({ required_error: "Quantity is required." })
    .int("Quantity must be an integer.")
    .positive("Quantity must be a positive number."),
  discount_value: z
    .string({ required_error: "Discount value is required." })
    .min(2, "Discount value must be at least 2 characters.")
    .max(50, "Discount value must be at most 50 characters."),
  use_per_customer: z
    .number({ required_error: "Use per customer is required." })
    .int("Use per customer must be an integer.")
    .positive("Use per customer must be a positive number."),
  coupon_type: z.enum(["percentage", "flat", "other"], {
    required_error: "Coupon type is required.",
    invalid_type_error:
      "Coupon type must be one of: percentage, flat, or other.",
  }),
  products: z
    .array(z.number(), { required_error: "Products are required." })
    .optional(),
});

export const validateGetCouponSchema = z.object({
  code: z
    .string({ required_error: "Coupon code is required." }),
  cnic: z
    .string({ required_error: "CNIC is required." })
    .regex(/^\d{13}$/, "CNIC must be exactly 13 digits without dashes.")
    .optional(),
});

export const validateCouponListingSchema = z.object({
  product_id: z
    .array(z.number(), { required_error: "Products are required." })
    .optional()
    .nullable(),
});

export type CouponSchema = z.infer<typeof validateCouponSchema>;
export type GetCouponSchema = z.infer<typeof validateGetCouponSchema>;
export type CouponListingSchema = z.infer<typeof validateCouponListingSchema>;
