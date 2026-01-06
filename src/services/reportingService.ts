import prisma from "../config/db";
import { ReportValidations } from "../validations/reportValidations";

export const getReport = async (data: ReportValidations) => {
  try {
    let whereClauses: string[] = [];
    let params: any[] = [];

    // --- STRING FILTERS ---
    if (data.policy_code) {
      whereClauses.push("pol.policy_code LIKE ?");
      params.push(`%${data.policy_code}%`);
    }

    if (data.order_id) {
      whereClauses.push("ord.id = ?");
      params.push(data.order_id);
    }

    if (data.customer_firstname) {
      whereClauses.push("ord.customer_name LIKE ?");
      params.push(`%${data.customer_firstname}%`);
    }

    if (data.customer_lastname) {
      whereClauses.push("ord.customer_name LIKE ?");
      params.push(`%${data.customer_lastname}%`);
    }

    if (data.customer_cnic) {
      whereClauses.push("ord.customer_cnic LIKE ?");
      params.push(`%${data.customer_cnic}%`);
    }

    if (data.customer_city) {
      whereClauses.push("ord.customer_address LIKE ?");
      params.push(`%${data.customer_city}%`);
    }

    if (data.tracking_number) {
      whereClauses.push("ord.tracking_number LIKE ?");
      params.push(`%${data.tracking_number}%`);
    }

    // --- DATE FILTERS ---
    const applyDateFilter = (
      field: string,
      obj?: { date: string; mode: string }
    ) => {
      if (!obj) return;
      const column = `pol.${field}`;
      if (obj.mode === "greater") {
        whereClauses.push(`DATE(${column}) >= ?`);
        params.push(obj.date);
      } else if (obj.mode === "lesser") {
        whereClauses.push(`DATE(${column}) <= ?`);
        params.push(obj.date);
      } else if (obj.mode === "between" && obj.date.includes("to")) {
        const [start, end] = obj.date.split(" to ");
        if (!start || !end) {
          throw new Error(
            "Invalid date format, expected 'start date to end date'"
          );
        }
        whereClauses.push(`DATE(${column}) BETWEEN ? AND ?`);
        params.push(start, end);
      }
    };

    // Apply date filters (or default 1-year range)
    if (
      !data.issue_date &&
      !data.start_date &&
      !data.expiry_date &&
      !data.modified_date
    ) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);

      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];

      whereClauses.push(`DATE(pol.created_at) BETWEEN ? AND ?`);
      params.push(formattedStart, formattedEnd);
    } else {
      applyDateFilter("issue_date", data.issue_date || undefined);
      applyDateFilter("start_date", data.start_date || undefined);
      applyDateFilter("expiry_date", data.expiry_date || undefined);
      applyDateFilter("updated_at", data.modified_date || undefined);
    }

    // --- AMOUNT FILTER ---
    if (data.amount_assured) {
      const col = "pol.received_premium";
      if (data.amount_assured.mode === "greater") {
        whereClauses.push(`${col} >= ?`);
        params.push(data.amount_assured.amount);
      } else if (data.amount_assured.mode === "lesser") {
        whereClauses.push(`${col} <= ?`);
        params.push(data.amount_assured.amount);
      }
    }

    // --- ARRAY FILTERS ---
    const addArrayFilter = (column: string, values?: number[] | string[]) => {
      if (values && values.length > 0) {
        const placeholders = values.map(() => "?").join(", ");
        whereClauses.push(`${column} IN (${placeholders})`);
        params.push(...values);
      }
    };

    addArrayFilter("pol.status", data.policy_status || undefined);
    addArrayFilter("ord.agent_id", data.agentids || undefined);
    addArrayFilter("ord.branch_id", data.branchids || undefined);
    addArrayFilter("ord.client_id", data.clientids || undefined);
    addArrayFilter("ord.development_office_id", data.doids || undefined);
    addArrayFilter("pol.product_id", data.productids || undefined);
    addArrayFilter("pol.plan_id", data.planids || undefined);
    addArrayFilter("ord.api_user_id", data.partnerids || undefined);

    // --- FINAL QUERY CONSTRUCTION ---
    let query = `
      SELECT
        pol.id AS 'POLICY_ID',
        au.name AS 'PARTNER NAME',
        ord.order_code AS 'ORDER CODE',
        pol.policy_code AS 'POLICY NUMBER',
        pol.status AS 'POLICY STATUS',
        DATE_FORMAT(pol.issue_date, '%d-%b-%Y') AS 'POLICY ISSUE DATE',
        DATE_FORMAT(pol.start_date, '%d-%b-%Y') AS 'POLICY START DATE',
        DATE_FORMAT(pol.expiry_date, '%d-%b-%Y') AS 'POLICY EXPIRY DATE',
        pol.received_premium AS 'TOTAL PRICE',
        ord.discount_amount AS 'DISCOUNT',
        c.code AS 'COUPON NAME',
        ord.customer_name AS 'CUSTOMER NAME',
        ord.customer_email AS 'CUSTOMER EMAIL',
        ord.customer_contact AS 'CUSTOMER CONTACT',
        ord.customer_cnic AS 'CUSTOMER CNIC',
        ord.customer_address AS 'CUSTOMER ADDRESS',
        pol.qr_doc_url AS 'DOCUMENT URL',
        p.name AS 'PLAN NAME',
        prod.product_name AS 'PRODUCT NAME',
        ord.agent_name AS 'AGENT NAME',
        ag.igis_agent_code AS 'AGENT CODE',
        ord.branch_name AS 'BRANCH NAME',
        b.igis_branch_code AS 'BRANCH CODE',
        b.igis_branch_takaful_code AS 'BRANCH TAKAFUL CODE',
        cl.name AS 'CLIENT NAME',
        cl.igis_client_code AS 'CLIENT CODE',
        devo.name AS 'DEVELOPMENT OFFICER NAME',
        devo.igis_do_code AS 'DEVELOPMENT OFFICE CODE',
        ord.tracking_number AS 'TRACKING NUMBER',
        pm.name AS 'PAYMENT MODE NAME',
        ord.cc_transaction_id AS 'TRANSACTION ID',
        ord.cc_approval_code AS 'APPROVAL CODE',
        CAST( COUNT( pd.id ) AS CHAR ) AS 'POLICY DETAIL COUNT',
	      GROUP_CONCAT(pd.type ORDER BY pd.id SEPARATOR ', ') AS 'POLICY DETAIL'
      FROM \`Order\` ord
      LEFT JOIN Policy pol ON pol.order_id = ord.id
      LEFT JOIN ApiUser au ON ord.api_user_id = au.id
      LEFT JOIN Coupon c ON c.id = ord.coupon_id
      LEFT JOIN Plan p ON p.id = pol.plan_id
      LEFT JOIN Product prod ON prod.id = pol.product_id
      LEFT JOIN Agent ag ON ag.id = ord.agent_id
      LEFT JOIN Branch b ON b.id = ord.branch_id
      LEFT JOIN Client cl ON cl.id = ord.client_id
      LEFT JOIN DevelopmentOfficer devo ON devo.id = ord.development_office_id
      LEFT JOIN PaymentMode pm ON pm.id = ord.payment_method_id
      LEFT JOIN PolicyDetail pd ON pd.policy_id = pol.id AND UPPER(pd.type) NOT IN ('CUSTOMER')
    `;

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += `GROUP BY pol.id ORDER BY pol.id DESC`;

    const result = (await prisma.$queryRawUnsafe(query, ...params)) as any[];
    return result;
  } catch (error: any) {
    throw new Error(`Failed to fetch report: ${error.message}`);
  }
};

export const getReportWithDetails = async (data: ReportValidations) => {
  const report = await getReport(data);

  const policyIds = report.map((r: any) => r.POLICY_ID).filter(Boolean);

  if (policyIds.length === 0) return { policy: report, policy_details: [] };

  const details = await getPolicyDetailsByIds(policyIds);

  return { policy: report, policy_details: details };
};

export const getPolicyDetailsByIds = async (policyIds: number[]) => {
  try {
    if (!policyIds || policyIds.length === 0) {
      throw new Error("Policy IDs array cannot be empty");
    }
    const placeholders = policyIds.map(() => "?").join(", ");
    const query = `SELECT * FROM PolicyDetail pd WHERE pd.policy_id IN (${placeholders}) ORDER BY pd.policy_id DESC`;
    const result = (await prisma.$queryRawUnsafe(query, ...policyIds)) as any[];
    return result;
  } catch (error: any) {
    throw new Error(`Failed to fetch policy details: ${error.message}`);
  }
};

export const getMISReport = async () => {
  try {
    const confirmedQuery = `
    SELECT
      CAST(ac.api_user_name AS CHAR) AS api_user_name,
      CAST(ac.product_name AS CHAR) AS product_name,
      CAST(ac.product_type AS CHAR) AS product_type,
      (CASE WHEN ac.is_takaful = '1' THEN 'Takaful' ELSE 'Insurance' END) AS product_category,
      CAST(COALESCE(dd.daily_count, 0) AS CHAR) AS daily_count,
      CAST(COALESCE(dd.daily_amount, 0) AS CHAR) AS daily_amount,
      CAST(COALESCE(mtd.mtd_count, 0) AS CHAR) AS mtd_count,
      CAST(COALESCE(mtd.mtd_amount, 0) AS CHAR) AS mtd_amount,
      CAST(COALESCE(ytd.ytd_count, 0) AS CHAR) AS ytd_count,
      CAST(COALESCE(ytd.ytd_amount, 0) AS CHAR) AS ytd_amount
    FROM (
      SELECT DISTINCT
        CAST(au.name AS CHAR) AS api_user_name,
        CAST(p.product_name AS CHAR) AS product_name,
        CAST(p.product_type AS CHAR) AS product_type,
        CAST(p.is_takaful AS CHAR) AS is_takaful
      FROM Policy pol
        LEFT JOIN Product p ON p.id = pol.product_id
        LEFT JOIN ApiUser au ON au.id = pol.api_user_id
      WHERE
        au.is_active = 1
        AND au.is_deleted = '0'
    ) ac
    LEFT JOIN (
      SELECT
        CAST(au.name AS CHAR) AS api_user_name,
        CAST(p.product_name AS CHAR) AS product_name,
        CAST(p.product_type AS CHAR) AS product_type,
        CAST(p.is_takaful AS CHAR) AS is_takaful,
        CAST(COUNT(pol.id) AS CHAR) AS daily_count,
        CAST(SUM(CAST(pol.received_premium AS DECIMAL(10,2))) AS CHAR) AS daily_amount
      FROM Policy pol
        LEFT JOIN Product p ON p.id = pol.product_id
        LEFT JOIN ApiUser au ON au.id = pol.api_user_id
      WHERE
        DATE(pol.issue_date) = CURDATE() - INTERVAL 1 DAY
        AND ISNULL(pol.policy_code) = 0
        AND au.is_active = 1
        AND au.is_deleted = '0'
      GROUP BY
        au.name,
        p.product_name
    ) dd ON ac.api_user_name = dd.api_user_name
        AND ac.product_name = dd.product_name
    LEFT JOIN (
      SELECT
        CAST(au.name AS CHAR) AS api_user_name,
        CAST(p.product_name AS CHAR) AS product_name,
        CAST(p.product_type AS CHAR) AS product_type,
        CAST(p.is_takaful AS CHAR) AS is_takaful,
        CAST(COUNT(pol.id) AS CHAR) AS mtd_count,
        CAST(SUM(CAST(pol.received_premium AS DECIMAL(10,2))) AS CHAR) AS mtd_amount
      FROM Policy pol
        LEFT JOIN Product p ON p.id = pol.product_id
        LEFT JOIN ApiUser au ON au.id = pol.api_user_id
      WHERE
        YEAR(pol.issue_date) = YEAR(CURDATE() - INTERVAL 1 DAY)
        AND MONTH(pol.issue_date) = MONTH(CURDATE() - INTERVAL 1 DAY)
        AND DATE(pol.issue_date) BETWEEN DATE_FORMAT(CURDATE() - INTERVAL 1 DAY, '%Y-%m-01')
            AND (CURDATE() - INTERVAL 1 DAY)
        AND ISNULL(pol.policy_code) = 0
        AND au.is_active = 1
        AND au.is_deleted = '0'
      GROUP BY
        au.name,
        p.product_name
    ) mtd ON ac.api_user_name = mtd.api_user_name
         AND ac.product_name = mtd.product_name
    LEFT JOIN (
      SELECT
        CAST(au.name AS CHAR) AS api_user_name,
        CAST(p.product_name AS CHAR) AS product_name,
        CAST(p.product_type AS CHAR) AS product_type,
        CAST(p.is_takaful AS CHAR) AS is_takaful,
        CAST(COUNT(pol.id) AS CHAR) AS ytd_count,
        CAST(SUM(CAST(pol.received_premium AS DECIMAL(10,2))) AS CHAR) AS ytd_amount
      FROM Policy pol
        LEFT JOIN Product p ON p.id = pol.product_id
        LEFT JOIN ApiUser au ON au.id = pol.api_user_id
      WHERE
        YEAR(pol.issue_date) = YEAR(CURDATE() - INTERVAL 1 DAY)
        AND DATE(pol.issue_date) <= (CURDATE() - INTERVAL 1 DAY)
        AND ISNULL(pol.policy_code) = 0
        AND au.is_active = 1
        AND au.is_deleted = '0'
      GROUP BY
        au.name,
        p.product_name
    ) ytd ON ac.api_user_name = ytd.api_user_name
         AND ac.product_name = ytd.product_name
    ORDER BY
      ac.api_user_name,
      ac.product_name
    `;

    const pendingQuery = confirmedQuery; // Your confirmed and pending queries are identical

    const result = await Promise.all([
      prisma.$queryRawUnsafe(confirmedQuery),
      prisma.$queryRawUnsafe(pendingQuery),
    ]);

    return {
      confirmed: result[0],
      pending: result[1],
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch MIS details: ${error.message}`);
  }
};
