import prisma from "../config/db";
import { ApiUserProductType } from "../validations/apiUserProductValidations";

export const getAllApiUserProducts = async () => {
  // 1. Fetch the raw, flat data (similar to your original query)
  const flatRecords: any[] = await prisma.$queryRaw`
    SELECT
      au.id AS user_id,
      au.name,
      au.email,
      au.phone,
      aup.id AS api_user_product_id,
      p.id AS product_id,
      p.product_name,
      p.product_type,
      p.product_category_id,
      aup.is_active,
      aup.created_at,
      aup.updated_at,
      aup.deleted_at
    FROM
      ApiUserProduct aup
    LEFT JOIN ApiUser au ON au.id = aup.api_user_id
    LEFT JOIN Product p ON p.id = aup.product_id
  `;

  // 2. Process the flat results to group products by API User
  const groupedProducts = flatRecords.reduce((acc, current) => {
    const userId = current.user_id;

    // Structure the product object
    const product = {
      product_id: current.product_id,
      product_name: current.product_name,
      product_type: current.product_type,
      product_category_id: current.product_category_id,
    };

    // If the API User is not in the accumulator, create the user object
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: current.name,
        email: current.email,
        phone: current.phone,
        api_user_id: userId, // Keeping this for consistency with your desired payload
        products: [],
        is_active: current.is_active,
        created_at: current.created_at,
        updated_at: current.updated_at,
        deleted_at: current.deleted_at,
      };

      // Remove redundant fields from the user object that are specific to the join table
      delete acc[userId].api_user_product_id;
    }

    // Add the product to the user's products array
    if (product.product_id) { // Only add if a product exists (i.e., LEFT JOIN was successful)
      acc[userId].products.push(product);
    }

    return acc;
  }, {});

  // 3. Convert the grouped object back into an array
  return Object.values(groupedProducts);
};

export const getSingleApiUserProducts = async (id: number) => {
  // 1. Fetch the raw, flat data (similar to your original query)
  const flatRecords: any[] = await prisma.$queryRaw`
    SELECT
      au.id AS user_id,
      au.name,
      au.email,
      au.phone,
      aup.id AS api_user_product_id,
      p.id AS product_id,
      p.product_name,
      p.product_type,
      p.product_category_id,
      aup.is_active,
      aup.created_at,
      aup.updated_at,
      aup.deleted_at
    FROM
      ApiUserProduct aup
    LEFT JOIN ApiUser au ON au.id = aup.api_user_id
    LEFT JOIN Product p ON p.id = aup.product_id
    where aup.api_user_id = ${id}
  `;
  // 2. Process the flat results to group products by API User
  const groupedProducts = flatRecords.reduce((acc, current) => {
    const userId = current.user_id;

    // Structure the product object
    const product = {
      product_id: current.product_id,
      product_name: current.product_name,
      product_type: current.product_type,
      product_category_id: current.product_category_id,
    };

    // If the API User is not in the accumulator, create the user object
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: current.name,
        email: current.email,
        phone: current.phone,
        api_user_id: userId, // Keeping this for consistency with your desired payload
        products: [],
        is_active: current.is_active,
        created_at: current.created_at,
        updated_at: current.updated_at,
        deleted_at: current.deleted_at,
      };

      // Remove redundant fields from the user object that are specific to the join table
      delete acc[userId].api_user_product_id;
    }

    // Add the product to the user's products array
    if (product.product_id) { // Only add if a product exists (i.e., LEFT JOIN was successful)
      acc[userId].products.push(product);
    }

    return acc;
  }, {});

  // 3. Convert the grouped object back into an array
  return Object.values(groupedProducts);
};

export const createApiUserProduct = async (
  data: ApiUserProductType,
  createdBy: number
) => {
  const apiUserProductArray = data.product_id.map((id: number) => {
    return {
      product_id: id,
      api_user_id: data.api_user_id,
      created_by: createdBy,
    };
  });

  await prisma.apiUserProduct.createMany({
    data: apiUserProductArray,
  });

  return [];
};

export const updateApiUserProduct = async (
  data: ApiUserProductType,
  createdBy: number
) => {
  const updateApiUserProductTx = await prisma.$transaction(async (tx) => {
    await tx.apiUserProduct.deleteMany({
      where: {
        api_user_id: data.api_user_id,
      },
    });

    const apiUserProductArray = data.product_id.map((id: number) => {
      return {
        product_id: id,
        api_user_id: data.api_user_id,
        created_by: createdBy,
      };
    });

    await tx.apiUserProduct.createMany({
      data: apiUserProductArray,
    });

    return [];
  });

  return updateApiUserProductTx;
};
