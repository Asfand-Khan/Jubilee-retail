import prisma from "../config/db";
import {
  ProductOptionType,
  ProductOptionUpdateType,
} from "../validations/productOptionValidations";

export const getAllProductOptions = async () => {
  try {
    const getAllProductOptions = await prisma.productOption.findMany({
      where: {
        is_deleted: false,
      },
    });
    return getAllProductOptions;
  } catch (error: any) {
    throw new Error(`Failed to fetch all product options: ${error.message}`);
  }
};

export const createProductOption = async (
  option: ProductOptionType,
  createdBy: number
) => {
  try {
    let dataToSend = {
      option_name: option.option_name,
      administrative_subcharges: option.administrative_subcharges,
      end_limit: option.end_limit,
      duration_type: option.duration_type,
      duration: option.duration,
      start_limit: option.start_limit,
      price: option.price,
      product_id: option.product_id,
      start_limit_mother: option.start_limit_mother,
      end_limit_mother: option.end_limit_mother,
      federal_insurance_fee: option.federal_insurance_fee,
      gross_premium: option.gross_premium,
      sales_tax: option.sales_tax,
      stamp_duty: option.stamp_duty,
      subtotal: option.subtotal,
      created_by: createdBy,
    } as any;

    if (option.plan_code) {
      dataToSend["plan_code"] = option.plan_code;
    }

    const newProductOption = await prisma.productOption.create({
      data: dataToSend,
    });

    return newProductOption;
  } catch (error: any) {
    throw new Error(`Failed to create a product option: ${error.message}`);
  }
};

export const getProductOptionById = async (optionId: number) => {
  try {
    const productOption = await prisma.productOption.findUnique({
      where: { id: optionId },
    });
    return productOption;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single product option by id: ${error.message}`
    );
  }
};

export const updateProductOptionById = async (
  option: ProductOptionUpdateType
) => {
  try {
    let dataToSend = {
      option_name: option.option_name,
      administrative_subcharges: option.administrative_subcharges,
      end_limit: option.end_limit,
      duration_type: option.duration_type,
      duration: option.duration,
      start_limit: option.start_limit,
      price: option.price,
      product_id: option.product_id,
      start_limit_mother: option.start_limit_mother,
      end_limit_mother: option.end_limit_mother,
      federal_insurance_fee: option.federal_insurance_fee,
      gross_premium: option.gross_premium,
      sales_tax: option.sales_tax,
      stamp_duty: option.stamp_duty,
      subtotal: option.subtotal,
    } as any;

    if (option.plan_code) {
      dataToSend["plan_code"] = option.plan_code;
    }

    const updatedProductOption = await prisma.productOption.update({
      data: dataToSend,
      where: { id: option.product_option_id },
    });

    return updatedProductOption;
  } catch (error: any) {
    throw new Error(`Failed to update a product option: ${error.message}`);
  }
};
