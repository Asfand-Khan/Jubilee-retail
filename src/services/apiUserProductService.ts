import prisma from "../config/db";
import {
  ApiUserProductListingType,
  ApiUserProductType,
  ExternalSingleApiUserProductType,
} from "../validations/apiUserProductValidations";

export const getAllApiUserProducts = async (
  data: ApiUserProductListingType
) => {
  const filters: string[] = [];

  let query = `
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
    WHERE aup.is_deleted = 0
  `;

  if (data.date && (!data.api_user_id || data.api_user_id.length === 0)) {
    const [start, end] = data.date.split(" to ");
    filters.push(`DATE(aup.created_at) BETWEEN '${start}' AND '${end}'`);
  }

  if (data.api_user_id && data.api_user_id.length > 0) {
    const ids = data.api_user_id.join(", ");
    filters.push(`au.id IN (${ids})`);
  }

  if (filters.length > 0) {
    query += " AND " + filters.join(" AND ");
  }

  const flatRecords: any[] = await prisma.$queryRawUnsafe(query);

  // Process the flat results to group products by API User
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
    if (product.product_id) {
      // Only add if a product exists (i.e., LEFT JOIN was successful)
      acc[userId].products.push(product);
    }

    return acc;
  }, {});

  // Convert the grouped object back into an array
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
    if (product.product_id) {
      // Only add if a product exists (i.e., LEFT JOIN was successful)
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

export const getExternalSingleApiUserProducts = async (
  data: ExternalSingleApiUserProductType,
  id: number
) => {
  // Step 1: Extract product_ids from data
  const { product_ids } = data;

  // Step 2: Build conditional SQL dynamically
  let whereClause = `WHERE aup.api_user_id = ${id}`;
  if (product_ids && product_ids.length > 0) {
    whereClause += ` AND aup.product_id IN (${product_ids.join(",")})`;
  }

  // Step 3: Fetch data using prisma.$queryRawUnsafe to include dynamic SQL safely
  const flatRecords: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      au.id AS user_id,
      au.name,
      au.email,
      au.phone,
      aup.id AS api_user_product_id,
      p.id AS product_id,
      p.product_name,
      p.product_type,
      wam.parent_sku,
      wam.child_sku,
      p.product_category_id,
      aup.is_active,
      aup.created_at,
      aup.updated_at,
      aup.deleted_at
    FROM
      ApiUserProduct aup
    LEFT JOIN ApiUser au ON au.id = aup.api_user_id
    LEFT JOIN Product p ON p.id = aup.product_id
     LEFT JOIN WebappMapper wam ON p.id = wam.product_id
    ${whereClause}
  `);

  // Setp 4. Process the flat results to group products by API User
  const groupedProducts = flatRecords.reduce((acc, current) => {
    const userId = current.user_id;

    // Structure the product object
    const product = {
      product_id: current.product_id,
      product_name: current.product_name,
      product_type: current.product_type,
      product_category_id: current.product_category_id,
       parent_sku: current.parent_sku,
      child_sku: current.child_sku,
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
    if (product.product_id) {
      // Only add if a product exists (i.e., LEFT JOIN was successful)
      acc[userId].products.push(product);
    }

    return acc;
  }, {});

  // Step 5. Convert the grouped object back into an array
  return Object.values(groupedProducts);
};
