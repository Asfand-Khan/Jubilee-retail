import prisma from "../config/db";
import {
  ProductCategoryType,
  ProductCategoryUpdateType,
} from "../validations/productCategoryValidations";

export const getAllProductCategories = async () => {
  try {
    const allProductCategories = await prisma.productCategory.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allProductCategories;
  } catch (error: any) {
    throw new Error(`Failed to fetch all product categories: ${error.message}`);
  }
};

export const createProductCategory = async (
  productCategory: ProductCategoryType,
  createdBy: number
) => {
  try {
    let dataToSend = {
      name: productCategory.name,
      igis_product_code: productCategory.igis_product_code,
      created_by: createdBy,
    } as any;

    if (productCategory.department_id) {
      dataToSend["department_id"] = productCategory.department_id;
    }

    const newProductCategory = await prisma.productCategory.create({
      data: dataToSend,
    });
    return newProductCategory;
  } catch (error: any) {
    throw new Error(`Failed to create a product category: ${error.message}`);
  }
};

export const getProductCategoryByProductIGISCode = async (code: string) => {
  try {
    const result = await prisma.productCategory.findFirst({
      where: { igis_product_code: code },
    });
    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to single product category by igis code: ${error.message}`
    );
  }
};

export const getProductCategoryByCategoryId = async (catId: number) => {
  try {
    const productCategory = await prisma.productCategory.findUnique({
      where: { id: catId },
    });
    return productCategory;
  } catch (error: any) {
    throw new Error(
      `Failed to single product category by id: ${error.message}`
    );
  }
};

export const updateProductCategoryById = async (
  productCategory: ProductCategoryUpdateType
) => {
  try {
    let dataToSend = {
      name: productCategory.name,
      igis_product_code: productCategory.igis_product_code,
    } as any;

    if (productCategory.department_id) {
      dataToSend["department_id"] = productCategory.department_id;
    }

    const updatedProductCategory = await prisma.productCategory.update({
      data: dataToSend,
      where: { id: productCategory.product_category_id },
    });
    return updatedProductCategory;
  } catch (error: any) {
    throw new Error(`Failed to update a product category: ${error.message}`);
  }
};
