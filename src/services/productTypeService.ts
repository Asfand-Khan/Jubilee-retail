import prisma from "../config/db";
import {
  ProductType,
  ProductTypeUpdate,
} from "../validations/productTypeValidations";

export const getAllProductTypes = async () => {
  try {
    const allProductTypes = await prisma.productType.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allProductTypes;
  } catch (error: any) {
    throw new Error(`Failed to fetch all product types: ${error.message}`);
  }
};

export const createProductType = async (
  productType: ProductType,
  createdBy: number
) => {
  try {
    const newProductType = await prisma.productType.create({
      data: {
        name: productType.name,
        days: productType.days,
        created_by: createdBy,
      },
    });
    return newProductType;
  } catch (error: any) {
    throw new Error(`Failed to create a product type: ${error.message}`);
  }
};

export const getProductTypeById = async (productTypeId: number) => {
  try {
    const productType = await prisma.productType.findUnique({
      where: { id: productTypeId },
    });
    return productType;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single product type by id: ${error.message}`
    );
  }
};

export const updateProductTypeById = async (productType: ProductTypeUpdate) => {
  try {
    const updatedProductType = await prisma.productType.update({
      where: {
        id: productType.product_type_id,
      },
      data: {
        name: productType.name,
        days: productType.days,
      },
    });
    return updatedProductType;
  } catch (error: any) {
    throw new Error(`Failed to update a product type: ${error.message}`);
  }
};
