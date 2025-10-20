import { z } from "zod";

export const validateCommonDelete = z.object({
  module: z.enum(
    [
      "User",
      "ApiUser",
      "Menu",
      "Branch",
      "DevelopmentOfficer",
      "Agent",
      "Client",
      "Courier",
      "Country",
      "City",
      "CallUsData",
      "BusinessRegion",
      "IgisMake",
      "IgisSubMake",
      "MotorQuote",
      "Plan",
      "ProductCategory",
      "Product",
      "ProductOption",
      "ProductType",
      "RelationMapping",
      "WebappMapper",
      "LeadInfo",
      "LeadMotorInfo",
      "ApiUserProduct",
      "PaymentMode",
      "PremiumRangeProtection",
      "Coupon",
      "Order",
    ],
    { required_error: "Module is required" }
  ),
  record_id: z.number({
    required_error: "Record ID is required",
    invalid_type_error: "Record ID must be a number",
  }),
});

export type CommonDelete = z.infer<typeof validateCommonDelete>;
