import prisma from "../config/db";
import {
  ProductListingType,
  ProductType,
  ProductUpdateType,
} from "../validations/productValidations";

export const getAllProducts = async (data: ProductListingType) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    if (data.date) {
      const [start, end] = data.date.split("to").map((d) => d.trim());
      whereClause.created_at = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }
    const allProducts = await prisma.product.findMany({
      where: whereClause,
    });
    return allProducts;
  } catch (error: any) {
    throw new Error(`Failed to fetch all products: ${error.message}`);
  }
};

export const createProduct = async (
  product: ProductType,
  createdBy: number
) => {
  try {
    const newProduct = await prisma.product.create({
      data: {
        product_name: product.product_name,
        product_type: product.product_type,
        product_category_id: product.product_category_id,
        is_cbo: product.is_cbo,
        is_takaful: product.is_takaful,
        created_by: createdBy,
      },
    });
    return newProduct;
  } catch (error: any) {
    throw new Error(`Failed to create a product: ${error.message}`);
  }
};

export const getProductByProductName = async (name: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { product_name: name },
    });
    return product;
  } catch (error: any) {
    throw new Error(`Failed to single product by name: ${error.message}`);
  }
};

export const getProductById = async (productId: number) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product;
  } catch (error: any) {
    throw new Error(`Failed to single product by id: ${error.message}`);
  }
};

export const updateProductById = async (product: ProductUpdateType) => {
  try {
    const updatedProduct = await prisma.product.update({
      where: {
        id: product.product_id,
      },
      data: {
        product_name: product.product_name,
        product_type: product.product_type,
        product_category_id: product.product_category_id,
        is_cbo: product.is_cbo,
        is_takaful: product.is_takaful,
      },
    });
    return updatedProduct;
  } catch (error: any) {
    throw new Error(`Failed to update a product: ${error.message}`);
  }
};
