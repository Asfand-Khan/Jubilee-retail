import prisma from "../config/db";
import { DashboardType } from "../validations/dashboardValidations";

const getDateRange = (dateRange?: string | null) => {
  if (dateRange) {
    const [start, end] = dateRange.split(" to ");
    return [`${start} 00:00:00`, `${end} 23:59:59`];
  }
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} 23:59:59`;
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);
  const start = `${weekAgo.getFullYear()}-${String(
    weekAgo.getMonth() + 1
  ).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")} 00:00:00`;
  return [start, end];
};

const serializeBigInt = (rows: any[]) =>
  rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "bigint" ? Number(value) : value,
      ])
    )
  );

export const policyStatusCardStats = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        COUNT(DISTINCT o.id) AS total_orders,
        COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END) AS total_valid_policies,
        COALESCE(SUM(CAST(o.received_premium AS DECIMAL(15, 2))),0) AS order_received_premium,
        COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END), 0) AS policy_received_premium
    FROM
        \`Order\` o
        LEFT JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
    WHERE
        o.is_deleted = 0`;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];

    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch all policy status stats: ${error.message}`
    );
  }
};

export const top5ProductsDetailWise = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
      SELECT
          prod.product_name AS product_name,
          COUNT(DISTINCT o.id) AS total_orders,
          COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END) AS total_valid_policies,
          COALESCE(SUM(CAST(o.received_premium AS DECIMAL(15, 2))), 0) AS order_amount,
          COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END), 0) AS policy_amount
      FROM
          \`Order\` o
          INNER JOIN \`Policy\` p ON o.id = p.order_id AND p.is_deleted = 0
          INNER JOIN \`Product\` prod ON p.product_id = prod.id
      WHERE
          o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `
      GROUP BY prod.id, prod.product_name
      ORDER BY policy_amount DESC
      LIMIT 5
    `;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];

    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch top 5 products detail wise: ${error.message}`
    );
  }
};

export const top5ProductsByProductAmount = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        prod.product_name,
        COUNT(DISTINCT o.id) AS total_orders,
        COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END ) AS total_valid_policies,
        COALESCE( SUM(CAST(o.received_premium AS DECIMAL(15, 2))), 0 ) AS order_amount,
        COALESCE( SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END ), 0) AS policy_amount
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        INNER JOIN \`Product\` prod ON p.product_id = prod.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `
    GROUP BY prod.id, prod.product_name
    ORDER BY policy_amount DESC LIMIT 5
    `;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];

    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch top 5 products by product amount: ${error.message}`
    );
  }
};

export const top5ApiUsersByPolicyAmount = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        au.name AS api_user_name,
        au.email AS api_user_email,
        COUNT(DISTINCT o.id) AS total_orders,
        COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END ) AS total_valid_policies,
        COALESCE(SUM(CAST(o.received_premium AS DECIMAL(15, 2))), 0) AS order_amount,
        COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END), 0) AS policy_amount
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        INNER JOIN \`ApiUser\` au ON o.api_user_id = au.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `
    GROUP BY
        au.id,
        au.name,
        au.email
    ORDER BY
        policy_amount DESC LIMIT 5
    `;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];

    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch top 5 api users by product amount: ${error.message}`
    );
  }
};

export const monthlyOrdersAndPolicies = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        DATE (o.created_at) AS sale_date,
        COUNT(DISTINCT o.id) AS daily_orders,
        COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END) AS daily_policies
    FROM
        \`Order\` o
        LEFT JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `
    GROUP BY
        sale_date
    ORDER BY
        sale_date;
    `;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    console.log("QUERY ", query);
    console.log("RESULT", result);
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch weekly orders and policies: ${error.message}`
    );
  }
};

export const productShareOfPolicyAmountByAmount = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        prod.product_name,
        COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END), 0) AS policy_amount
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        INNER JOIN \`Product\` prod ON p.product_id = prod.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `
    GROUP BY prod.id, prod.product_name
    HAVING policy_amount > 0
    ORDER BY policy_amount DESC;
    `;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch product share of policy amount: ${error.message}`
    );
  }
};

export const policyStatusBreakdownValidInvalid = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        CASE WHEN p.status IN ('cancelled', 'unverified', 'pending', 'expired') OR p.is_deleted = 1 THEN 'Invalid' ELSE 'Valid' END AS status_group,
        COUNT(p.id) AS count
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += ` GROUP BY status_group`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(
      `Failed to fetch product status breakdown valid vs invalid: ${error.message}`
    );
  }
};

export const recentOrders = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        o.order_code,
        o.customer_name,
        o.customer_contact,
        prod.product_name,
        o.received_premium,
        p.status,
        o.created_at
    FROM
        \`Order\` o
    INNER JOIN \`Policy\` p ON o.id = p.order_id
    AND p.is_deleted = 0
    INNER JOIN \`Product\` prod ON p.product_id = prod.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += ` ORDER BY o.created_at DESC LIMIT 10`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to fetch recent orders: ${error.message}`);
  }
};

export const top5Agents = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        a.name AS agent_name,
        COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END), 0) AS policy_amount
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        INNER JOIN \`Agent\` a ON o.agent_id = a.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += ` GROUP BY a.id, a.name ORDER BY policy_amount DESC LIMIT 5`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to fetch top 5 agents: ${error.message}`);
  }
};

export const top5Branches = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        b.name AS branch_name,
        COALESCE(SUM(CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN CAST(p.received_premium AS DECIMAL(15, 2)) ELSE 0 END),0) AS policy_amount
    FROM
        \`Order\` o
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        INNER JOIN \`Branch\` b ON o.branch_id = b.id
    WHERE
        o.is_deleted = 0
    `;

    if (apiUserId) {
      query += ` AND o.api_user_id = ${apiUserId}`;
    }

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += ` GROUP BY b.id,b.name ORDER BY policy_amount DESC LIMIT 5`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to fetch top 5 branches: ${error.message}`);
  }
};

export const couponUsage = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        c.code AS coupon_code,
        c.campaign_name AS coupon_name,
        COUNT(o.id) AS total_uses,
        COALESCE(SUM(CAST(o.discount_amount AS DECIMAL(15, 2))), 0) AS total_discount_amount
    FROM
        \`Order\` o
        INNER JOIN \`Coupon\` c ON o.coupon_id = c.id
        AND c.is_deleted = 0
        INNER JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
        AND p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired')
    WHERE
        o.is_deleted = 0
    `;

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `  GROUP BY c.id, c.code, c.campaign_name ORDER BY total_discount_amount DESC`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to fetch coupon usage: ${error.message}`);
  }
};

export const paymentMode = async (
  data: DashboardType,
  apiUserId: number | null | undefined
) => {
  try {
    let query = `
    SELECT
        pm.name AS payment_mode,
        pm.payment_code,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(CAST(o.received_premium AS DECIMAL(15, 2))),0) AS total_received_amount,
        COUNT(DISTINCT CASE WHEN p.status NOT IN ('cancelled', 'unverified', 'pending', 'expired') AND p.is_deleted = 0 THEN p.id ELSE NULL END) AS valid_policies_count,
        COALESCE(SUM(CAST(o.discount_amount AS DECIMAL(15, 2))), 0) AS total_discount_given
    FROM
        \`Order\` o
        INNER JOIN \`PaymentMode\` pm ON o.payment_method_id = pm.id
        AND pm.is_deleted = 0
        LEFT JOIN \`Policy\` p ON o.id = p.order_id
        AND p.is_deleted = 0
    WHERE
        o.is_deleted = 0
    `;

    const [startDate, endDate] = getDateRange(data.date);

    query += ` AND o.created_at >= '${startDate}' AND o.created_at <= '${endDate}'`;

    query += `  GROUP BY pm.id, pm.name, pm.payment_code ORDER BY total_received_amount DESC`;

    const result = (await prisma.$queryRawUnsafe(query)) as any[];
    return serializeBigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to fetch payment mode: ${error.message}`);
  }
};
