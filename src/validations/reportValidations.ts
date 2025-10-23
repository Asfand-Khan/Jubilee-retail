import { z } from "zod";

export const validateReport = z.object({
  policy_code: z
    .string({
      invalid_type_error: "Policy code must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  order_id: z
    .string({
      invalid_type_error: "Order Id must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  customer_firstname: z
    .string({
      invalid_type_error: "Customer First Name must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  customer_lastname: z
    .string({
      invalid_type_error: "Customer Last Name must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  customer_cnic: z
    .string({
      invalid_type_error: "Customer Cnic must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  customer_city: z
    .string({
      invalid_type_error: "Customer City must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  customer_email: z
    .string({
      invalid_type_error: "Customer email must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  coupon_code: z
    .string({
      invalid_type_error: "Coupon Code must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  tracking_number: z
    .string({
      invalid_type_error: "Tracking Number must be a string",
    })
    .trim()
    .optional()
    .nullable(),
  issue_date: z
    .object({
      date: z.string({
        invalid_type_error: "Date must be a string",
      }),
      mode: z.enum(["greater", "lesser", "between"]),
    })
    .optional()
    .nullable(),
  modified_date: z
    .object({
      date: z.string({
        invalid_type_error: "Date must be a string",
      }),
      mode: z.enum(["greater", "lesser", "between"]),
    })
    .optional()
    .nullable(),
  expiry_date: z
    .object({
      date: z.string({
        invalid_type_error: "Date must be a string",
      }),
      mode: z.enum(["greater", "lesser", "between"]),
    })
    .optional()
    .nullable(),
  start_date: z
    .object({
      date: z.string({
        invalid_type_error: "Date must be a string",
      }),
      mode: z.enum(["greater", "lesser", "between"]),
    })
    .optional()
    .nullable(),
  amount_assured: z
    .object({
      amount: z.string({
        invalid_type_error: "Amount must be a string",
      }),
      mode: z.enum(["greater", "lesser"]),
    })
    .optional()
    .nullable(),
  policy_status: z
    .array(
      z
        .string({
          invalid_type_error: "Policy status must be a string",
        })
        .min(1, "Policy status is required")
    )
    .optional()
    .nullable(),
  agentids: z
    .array(
      z
        .number({
          invalid_type_error: "Agent must be a number",
        })
        .int({
          message: "Agent must be an integer",
        })
    )
    .optional()
    .nullable(),
  branchids: z
    .array(
      z
        .number({
          invalid_type_error: "Branch must be a number",
        })
        .int({
          message: "Branch must be an integer",
        })
    )
    .optional()
    .nullable(),
  clientids: z
    .array(
      z
        .number({
          invalid_type_error: "Client must be a number",
        })
        .int({
          message: "Client must be an integer",
        })
    )
    .optional()
    .nullable(),
  doids: z
    .array(
      z
        .number({
          invalid_type_error: "Development Officer must be a number",
        })
        .int({
          message: "Development Officer must be an integer",
        })
    )
    .optional()
    .nullable(),
  productids: z
    .array(
      z
        .number({
          invalid_type_error: "Product must be a number",
        })
        .int({
          message: "Product must be an integer",
        })
    )
    .optional()
    .nullable(),
  planids: z
    .array(
      z
        .number({
          invalid_type_error: "Plan must be a number",
        })
        .int({
          message: "Plan must be an integer",
        })
    )
    .optional()
    .nullable(),
  partnerids: z
    .array(
      z
        .number({
          invalid_type_error: "Partner must be a number",
        })
        .int({
          message: "Partner must be an integer",
        })
    )
    .optional()
    .nullable(),
});

export type ReportValidations = z.infer<typeof validateReport>;
