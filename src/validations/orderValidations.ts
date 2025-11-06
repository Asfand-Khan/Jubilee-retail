import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const decimalRegex = /^\d+(\.\d{1,2})?$/;

export const validateOrderSchema = z.object({
  order_code: z
    .string({ required_error: "Order code is required." })
    .min(3, "Order code must be atleast 03 characters."),

  parent_id: z
    .number({ invalid_type_error: "Parent ID must be a number." })
    .int({ message: "Parent ID must be an integer." })
    .positive({ message: "Parent ID must be a positive number." })
    .optional()
    .nullable(),

  customer_name: z
    .string({ required_error: "Customer name is required." })
    .min(3, "Customer name must be atleast 03 characters.")
    .max(100, "Customer name must not exceed 100 characters."),

  customer_cnic: z
    .string()
    .regex(/^\d{13}$/, "CNIC must be 13 digits without dashes.")
    .optional()
    .nullable(),

  customer_dob: z
    .string()
    .regex(dateRegex, "Customer DOB must be in YYYY-MM-DD format.")
    .optional()
    .nullable(),

  customer_email: z
    .string({
      required_error: "Customer email is required",
    })
    .email("Invalid email format.")
    .max(150, { message: "Customer email must not exceed 150 characters." }),

  customer_contact: z
    .string({
      required_error: "Customer contact is required",
    })
    .regex(
      /^03\d{9}$/,
      "Customrt contact must be a valid Pakistani number (e.g. 03001234567)."
    ),

  customer_address: z
    .string()
    .max(255, { message: "Customer address must not exceed 255 characters." })
    .optional()
    .nullable(),

  customer_city: z
    .number({
      invalid_type_error: "Customer city must be a number.",
      required_error: "Customer city is required.",
    })
    .int({ message: "Customer city must be an integer." }),

  customer_occupation: z
    .string()
    .max(100, {
      message: "Customer occupation must not exceed 100 characters.",
    })
    .optional()
    .nullable(),

  status: z
    .enum(
      [
        "accepted",
        "cancelled",
        "pendingCOD",
        "rejected",
        "unverified",
        "verified",
        "pending",
      ],
      {
        message:
          "Status must be one of the following: accepted, cancelled, pendingCOD, rejected, unverified, verified, pending.",
      }
    )
    .default("pending"),

  payment_method_id: z
    .number({ required_error: "Payment method ID is required." })
    .int({ message: "Payment method ID must be an integer." })
    .positive({ message: "Payment method ID must be a positive number." }),

  coupon_id: z
    .number({ invalid_type_error: "Coupon ID must be a number." })
    .int({ message: "Coupon ID must be an integer." })
    .positive({ message: "Coupon ID must be a positive number." })
    .optional()
    .nullable(),

  discount_amount: z
    .string()
    .regex(decimalRegex, "Discount amount must be a valid decimal.")
    .default("0.00"),

  received_premium: z
    .string()
    .regex(decimalRegex, "Received premium must be a valid decimal.")
    .default("0.00"),

  branch_id: z
    .number()
    .int({ message: "Branch ID must be an integer." })
    .positive({ message: "Branch ID must be a positive number." })
    .optional()
    .nullable(),

  branch_name: z
    .string()
    .max(150, { message: "Branch name must not exceed 150 characters." })
    .optional()
    .nullable(),

  agent_id: z
    .number()
    .int({ message: "Agent ID must be an integer." })
    .optional()
    .nullable(),

  agent_name: z
    .string()
    .max(150, { message: "Agent name must not exceed 150 characters." })
    .optional()
    .nullable(),

  client_id: z
    .number()
    .int({ message: "Client ID must be an integer." })
    .optional()
    .nullable(),

  development_office_id: z
    .number()
    .int({ message: "Development office ID must be an integer." })
    .optional()
    .nullable(),

  shipping_method: z
    .string()
    .max(100, { message: "Shipping method must not exceed 100 characters." })
    .optional()
    .nullable(),

  shipping_charges: z
    .string()
    .regex(decimalRegex, "Shipping charges must be a valid decimal.")
    .default("0.00"),

  shipping_name: z
    .string()
    .max(150, { message: "Shipping name must not exceed 150 characters." })
    .optional()
    .nullable(),

  shipping_address: z
    .string()
    .max(255, { message: "Shipping address must not exceed 255 characters." })
    .optional()
    .nullable(),

  shipping_email: z
    .string()
    .email("Invalid email format.")
    .max(150, { message: "Shipping email must not exceed 150 characters." })
    .optional()
    .nullable(),

  shipping_phone: z
    .string()
    .regex(
      /^03\d{9}$/,
      "Shipping phone must be a valid Pakistani number (e.g. 03001234567)."
    )
    .optional()
    .nullable(),

  tracking_number: z
    .string()
    .max(100, { message: "Tracking number must not exceed 100 characters." })
    .optional()
    .nullable(),

  courier_status: z
    .string()
    .max(50, { message: "Courier status must not exceed 50 characters." })
    .optional()
    .nullable(),

  delivery_date: z
    .string()
    .regex(dateRegex, "Delivery date must be in YYYY-MM-DD format.")
    .optional()
    .nullable(),

  refunded: z
    .boolean({
      required_error: "Refunded is required.",
      invalid_type_error: "Refunded must be a boolean.",
    })
    .default(false),

  staff_comments: z.string().optional().nullable(),

  cc_transaction_id: z
    .string()
    .max(100, { message: "CC transaction ID must not exceed 100 characters." })
    .optional()
    .nullable(),

  cc_approval_code: z
    .string()
    .max(100, { message: "CC approval code must not exceed 100 characters." })
    .optional()
    .nullable(),

  jazzcash_date_time: z
    .string()
    .regex(dateRegex, "Jazzcash date must be in YYYY-MM-DD format.")
    .optional()
    .nullable(),

  channel: z
    .string()
    .max(100, { message: "Channel must not exceed 100 characters." })
    .optional()
    .nullable(),

  idev: z
    .string()
    .max(100, { message: "Idev must not exceed 100 characters." })
    .optional()
    .nullable(),

  referred_by: z
    .string()
    .max(100, { message: "Referred by must not exceed 100 characters." })
    .optional()
    .nullable(),

  kiosk_pin: z
    .string()
    .max(20, { message: "Kiosk pin must not exceed 20 characters." })
    .optional()
    .nullable(),

  kiosk_last_digit: z
    .string()
    .max(5, { message: "Kiosk last digit must not exceed 5 characters." })
    .optional()
    .nullable(),

  test_book: z
    .boolean({
      invalid_type_error: "Test book must be a boolean.",
      required_error: "Test book is required.",
    })
    .default(false),

  api_user_id: z
    .number()
    .int({ message: "API user ID must be an integer." })
    .positive({ message: "API user ID must be a positive number." })
    .optional()
    .nullable(),

  start_date: z
    .string({ required_error: "Start date is required." })
    .regex(dateRegex, "Start date must be in YYYY-MM-DD format."),

  expiry_date: z
    .string({ required_error: "Expiry date is required." })
    .regex(dateRegex, "Expiry date must be in YYYY-MM-DD format."),

  issue_date: z
    .string({ required_error: "Issue date is required." })
    .regex(dateRegex, "Issue date must be in YYYY-MM-DD format."),

  is_renewed: z
    .boolean({
      invalid_type_error: "Is renewed must be a boolean.",
    })
    .optional()
    .nullable(),

  quantity: z
    .number()
    .int({ message: "Quantity must be an integer." })
    .positive({ message: "Quantity must be a positive number." })
    .optional()
    .nullable(),

  // product details
  product_details: z.object({
    item_name: z
      .string({
        required_error: "Product details item name is required.",
        invalid_type_error: "Product details item name must be a string.",
      })
      .min(1, { message: "Product details item name cannot be empty" }),
    sku: z
      .string({
        required_error: "Product details SKU is required.",
        invalid_type_error: "Product details SKU must be a string.",
      })
      .min(1, { message: "Product details SKU cannot be empty" }),
    parent_sku: z
      .string({
        required_error: "Product details Parent SKU is required.",
        invalid_type_error: "Product details Parent SKU must be a string.",
      })
      .min(1, { message: "Product details Parent SKU cannot be empty" }),
    item_price: z
      .string({
        required_error: "Product details item price is required.",
        invalid_type_error: "Product details item price must be a string.",
      })
      .min(1, { message: "Product details item price cannot be empty" }),
    sum_insured: z
      .string({
        required_error: "Product details sum insured is required.",
        invalid_type_error: "Product details sum insured be a string.",
      })
      .min(1, { message: "Product details sum insured cannot be empty" }),
    product_type: z
      .string({
        required_error: "Product details product type is required.",
        invalid_type_error: "Product details product type be a string.",
      })
      .min(1, { message: "Product details product type cannot be empty" }),
    sub_products: z
      .array(
        z.object({
          sku: z
            .string({
              required_error: "Product details - Sub product SKU is required.",
              invalid_type_error:
                "Product details - Sub product SKU must be a string.",
            })
            .min(1, {
              message: "Product details - Sub product SKU cannot be empty",
            }),
        })
      )
      .optional()
      .nullable(),
  }),

  // customer details
  customer_details: z.array(
    z.object({
      insurance_title: z
        .string({
          invalid_type_error:
            "Customer details - Insurance title must be a string.",
        })
        .optional()
        .nullable(),

      type: z
        .string({
          invalid_type_error: "Customer details - Type must be a string.",
          required_error: "Customer details - Type is required.",
        })
        .min(1, { message: "Customer details - Type cannot be empty" })
        .toLowerCase(),

      insurance_name: z
        .string({
          invalid_type_error:
            "Customer details - Insurance name must be a string.",
          required_error: "Customer details - Insurance name is required.",
        })
        .min(1, {
          message: "Customer details - Insurance name cannot be empty",
        }),

      insurance_dob: z
        .string({
          invalid_type_error:
            "Customer details - Insurance DOB must be a string.",
        })
        .regex(dateRegex, "Insurance DOB must be in YYYY-MM-DD format.")
        .optional()
        .nullable(),

      insurance_cnic: z
        .string({
          invalid_type_error:
            "Customer details - Insurance CNIC must be a string.",
        })
        .regex(
          /^\d{13}$/,
          "Insurance CNIC must be exactly 13 digits without dashes."
        )
        .optional()
        .nullable(),

      insurance_cnic_issue_date: z
        .string({
          invalid_type_error:
            "Customer details - Insurance cnic issue date must be a string.",
        })
        .regex(
          dateRegex,
          "Insurance cnic issue date must be in YYYY-MM-DD format."
        )
        .optional()
        .nullable(),

      insurance_email: z
        .string({
          invalid_type_error:
            "Customer details - Insurance email must be a string.",
        })
        .email("Invalid email format.")
        .optional()
        .nullable(),

      insurance_mobile: z
        .string({
          invalid_type_error:
            "Customer details - Insurance mobile must be a string.",
        })
        .regex(
          /^03\d{9}$/,
          "Customer details - Insurance mobile must be a valid Pakistani number (e.g. 03001234567)."
        )
        .optional()
        .nullable(),

      insurance_gender: z
        .enum(["male", "female"], {
          invalid_type_error:
            "Customer details - Insurance gender must be a string.",
        })
        .optional()
        .nullable(),

      insurance_passport_no: z
        .string({
          invalid_type_error:
            "Customer details - Insurance passport no must be a string.",
        })
        .optional()
        .nullable(),

      insurance_poc: z
        .string({
          invalid_type_error:
            "Customer details - Insurance POC no must be a string.",
        })
        .optional()
        .nullable(),

      insurance_nicop: z
        .string({
          invalid_type_error:
            "Customer details - Insurance NICOP no must be a string.",
        })
        .optional()
        .nullable(),

      insurance_relationship: z
        .string({
          invalid_type_error:
            "Customer details - Insurance relation no must be a string.",
        })
        .min(1, {
          message: "Customer details - Insurance relation cannot be empty",
        }),
    })
  ),

  // travel details
  travel_details: z
    .object({
      travel_from: z
        .string({
          invalid_type_error: "Travel details - Travel from is required.",
        })
        .min(1, { message: "Travel details - Travel from cannot be empty" }),
      no_of_days: z
        .string({
          invalid_type_error: "Travel details - No of days is required.",
        })
        .min(1, { message: "Travel details - No of days cannot be empty" }),
      destination: z
        .string({
          invalid_type_error: "Travel details - Destination is required.",
        })
        .min(1, { message: "Travel details - Destination cannot be empty" }),
      tution_fee: z.boolean().default(false),
      travel_end_date: z
        .string({
          invalid_type_error: "Travel details - Travel end date is required.",
        })
        .regex(dateRegex, "Travel end date must be in YYYY-MM-DD format."),
      travel_start_date: z
        .string({
          invalid_type_error: "Travel details - Travel start date is required.",
        })
        .regex(dateRegex, "Travel start date must be in YYYY-MM-DD format."),
      sponsor: z
        .string({
          invalid_type_error: "Travel details - Sponsor must be a string.",
        })
        .optional()
        .nullable(),
      sponsor_address: z
        .string({
          invalid_type_error:
            "Travel details - Sponsor address must be a string.",
        })
        .optional()
        .nullable(),
      sponsor_contact: z
        .string({
          invalid_type_error:
            "Travel details - Sponsor contact must be a string.",
        })
        .optional()
        .nullable(),
      institute: z
        .string({
          invalid_type_error: "Travel details - Institute must be a string.",
        })
        .optional()
        .nullable(),
      program: z
        .string({
          invalid_type_error: "Travel details - Program must be a string.",
        })
        .optional()
        .nullable(),
      offer_letter_ref_no: z
        .string({
          invalid_type_error:
            "Travel details - Offer letter ref no must be a string.",
        })
        .optional()
        .nullable(),
      travel_purpose: z
        .string({
          invalid_type_error:
            "Travel details - Travel purpose must be a string.",
        })
        .optional()
        .nullable(),
      type: z
        .string({
          invalid_type_error: "Travel details - Type must be a string.",
        })
        .optional()
        .nullable(),
      program_duration: z
        .string({
          invalid_type_error:
            "Travel details - Program duration must be a string.",
        })
        .optional()
        .nullable(),
      travel_type: z
        .string({
          invalid_type_error: "Travel details - Travel type must be a string.",
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // homecare details
  homecare_details: z
    .array(
      z.object({
        ownership_status: z
          .string({
            required_error: "Homecare details - Ownership status is required.",
            invalid_type_error:
              "Homecare details - Ownership status must be a string.",
          })
          .min(1, {
            message: "Homecare details - Ownership status cannot be empty",
          }),

        structure_type: z
          .string({
            required_error: "Homecare details - Structure type is required.",
            invalid_type_error:
              "Homecare details - Structure type must be a string.",
          })
          .min(1, {
            message: "Homecare details - Structure type cannot be empty",
          }),

        plot_area: z
          .string({
            required_error: "Homecare details - Plot area is required.",
            invalid_type_error:
              "Homecare details - Plot area must be a string.",
          })
          .min(1, {
            message: "Homecare details - Plot area cannot be empty",
          }),

        address: z
          .string({
            required_error: "Homecare details - Address is required.",
            invalid_type_error: "Homecare details - Address must be a string.",
          })
          .min(1, {
            message: "Homecare details - Address cannot be empty",
          }),

        city: z
          .string({
            required_error: "Homecare details - City is required.",
            invalid_type_error: "Homecare details - City must be a string.",
          })
          .min(1, {
            message: "Homecare details - City cannot be empty",
          }),

        building: z
          .string({
            invalid_type_error: "Homecare details - Building must be a string.",
          })
          .optional()
          .nullable(),

        rent: z
          .string({
            invalid_type_error: "Homecare details - Rent must be a string.",
          })
          .optional()
          .nullable(),

        content: z
          .string({
            invalid_type_error: "Homecare details - Content must be a string.",
          })
          .optional()
          .nullable(),

        jewelry: z
          .string({
            invalid_type_error: "Homecare details - Jewelry must be a string.",
          })
          .optional()
          .nullable(),
      })
    )
    .optional()
    .nullable(),

  // purchase protection details
  purchase_protection: z
    .object({
      duration: z
        .number({
          required_error: "Purchase protection details - Duration is required.",
          invalid_type_error:
            "Purchase protection details - Duration must be a number.",
        })
        .min(1, {
          message: "Purchase protection details - Duration cannot be empty",
        }),
      duration_type: z.enum(["days", "months", "years"], {
        message:
          "Duration is required - can only be one from 'days', 'months', 'years'",
      }),
      name: z
        .string({
          required_error: "Purchase protection details - Name is required.",
          invalid_type_error:
            "Purchase protection details - Name must be a string.",
        })
        .min(1, {
          message: "Purchase protection details - Name cannot be empty",
        }),
      total_price: z
        .string({
          required_error:
            "Purchase protection details - Total price is required.",
          invalid_type_error:
            "Purchase protection details - Total price must be a string.",
        })
        .min(1, {
          message: "Purchase protection details - Total price cannot be empty",
        }),
      imei: z
        .string({
          invalid_type_error:
            "Purchase protection details - IMEI must be a string.",
        })
        .optional()
        .nullable(),
      serial_number: z
        .string({
          invalid_type_error:
            "Purchase protection details - Serial number must be a string.",
        })
        .optional()
        .nullable(),
      retailer_sku: z
        .string({
          invalid_type_error:
            "Purchase protection details - Retailer SKU must be a string.",
        })
        .optional()
        .nullable(),
    })
    .nullable()
    .optional(),

  // qna details
  qna_details: z
    .array(
      z.object({
        answer: z
          .string({
            required_error: "QnA details - Answer is required.",
            invalid_type_error: "QnA details - Answer must be string.",
          })
          .min(1, {
            message: "QnA details - Answer cannot be empty",
          }),

        q_id: z
          .number({
            required_error: "QnA details - Question ID is required.",
            invalid_type_error: "QnA details - Question ID must be a number.",
          })
          .int({ message: "QnA details - Question ID must be an integer." })
          .positive({
            message: "QnA details - Question ID cannot be negative.",
          }),
      })
    )
    .optional()
    .nullable(),
});

export const validateCCTransactionSchema = z.object({
  order_code: z
    .string({
      required_error: "Order code is required.",
      invalid_type_error: "Order code must be a string.",
    })
    .min(1, "Order code can not be empty"),

  approval_code: z
    .string({
      invalid_type_error: "Approval code must be a string.",
    })
    .optional()
    .nullable(),

  transaction_id: z
    .string({
      invalid_type_error: "Transaction ID must be a string.",
    })
    .optional()
    .nullable(),

  reason_code: z
    .string({
      invalid_type_error: "Reason code must be a string.",
    })
    .optional()
    .nullable(),
});

export const validateOrderPolicyStatusSchema = z.object({
  policy_id: z
    .number({
      required_error: "Policy Id is required.",
      invalid_type_error: "Policy Id must be a number.",
    })
    .min(1, "Policy Id can not be empty"),

  status: z.enum(["IGISposted", "HISposted", "cancelled"], {
    required_error: "Status is required.",
    invalid_type_error:
      "Status must be either 'IGISposted', 'HISposted', or 'cancelled'.",
  }),

  branch_id: z
    .number({
      invalid_type_error: "Branch Id must be a number.",
    })
    .optional()
    .nullable(),

  agent_id: z
    .number({
      invalid_type_error: "Agent Id must be a number.",
    })
    .optional()
    .nullable(),

  client_id: z
    .number({
      invalid_type_error: "Client Id must be a number.",
    })
    .optional()
    .nullable(),
});

export const validateListSchema = z.object({
  mode: z
    .enum(["orders", "policies", "cbo", "renewal"], {
      invalid_type_error:
        "Mode must be either 'orders', 'policies', 'cbo', or 'renewal'.",
    })
    .default("orders"),

  month: z
    .array(
      z.enum(
        [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ],
        {
          invalid_type_error:
            "Month must be one of 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', or 'december'.",
        }
      )
    )
    .optional()
    .nullable(),

  api_user_id: z
    .array(
      z
        .number({
          invalid_type_error: "API user ID must be a number.",
        })
        .int({ message: "API user ID must be an integer." })
    )
    .optional()
    .nullable(),

  order_status: z
    .array(
      z.enum(
        [
          "accepted",
          "cancelled",
          "pendingCOD",
          "rejected",
          "unverified",
          "verified",
          "pending",
        ],
        {
          invalid_type_error:
            "Order status must be one of 'accepted', 'cancelled', 'pendingCOD', 'rejected', 'unverified', 'verified', or 'pending'.",
        }
      )
    )
    .optional()
    .nullable(),

  policy_status: z
    .array(
      z.enum(
        [
          "cancelled",
          "HISposted",
          "IGISposted",
          "pendingIGIS",
          "unverified",
          "verified",
          "pending",
          "pendingCOD",
          "pendingCBO",
        ],
        {
          invalid_type_error:
            "Order status must be one of 'accepted', 'cancelled', 'pendingCOD', 'rejected', 'unverified', 'verified', or 'pending'.",
        }
      )
    )
    .optional()
    .nullable(),

  date: z
    .string({
      required_error: "Date range is required.",
      invalid_type_error: "Date range must be a string.",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/,
      "Date must be in format 'YYYY-MM-DD to YYYY-MM-DD'."
    )
    .optional()
    .nullable(),

  product_id: z
    .array(
      z
        .number({
          invalid_type_error: "Product ID must be a number.",
        })
        .int({ message: "Product ID must be an integer." })
    )
    .optional()
    .nullable(),

  branch_id: z
    .array(
      z
        .number({
          invalid_type_error: "Branch ID must be a number.",
        })
        .int({ message: "Branch ID must be an integer." })
    )
    .optional()
    .nullable(),

  payment_mode_id: z
    .array(
      z
        .number({
          invalid_type_error: "Payment mode ID must be a number.",
        })
        .int({ message: "Payment mode ID must be an integer." })
    )
    .optional()
    .nullable(),

  cnic: z
    .string({
      invalid_type_error: "CNIC must be a string.",
    })
    .regex(/^\d{13}$/, "CNIC must be 13 digits without dashes.")
    .optional()
    .nullable(),

  contact: z
    .string({
      invalid_type_error: "Contact must be a string.",
    })
    .regex(
      /^03\d{9}$/,
      "Contact must be a valid Pakistani number (e.g. 03001234567)."
    )
    .optional()
    .nullable(),
});

export const validateOrderCode = z.object({
  order_code: z
    .string({
      required_error: "Order code is required.",
      invalid_type_error: "Order code must be a string.",
    })
    .min(1, "Order code can not be empty"),
});

export const validateGenerateHIS = z.object({
  date: z
    .string({
      required_error: "Date range is required.",
      invalid_type_error: "Date range must be a string.",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/,
      "Date must be in format 'YYYY-MM-DD to YYYY-MM-DD'."
    )
    .optional()
    .nullable(),
  option: z.enum([".xlsx", ".txt"], {
    required_error: "Export option is required.",
  }),
});

export type OrderSchema = z.infer<typeof validateOrderSchema>;
export type CCTransactionSchema = z.infer<typeof validateCCTransactionSchema>;
export type ListSchema = z.infer<typeof validateListSchema>;
export type OrderCodeSchema = z.infer<typeof validateOrderCode>;
export type GenerateHISSchema = z.infer<typeof validateGenerateHIS>;
export type OrderPolicyStatusSchema = z.infer<
  typeof validateOrderPolicyStatusSchema
>;
