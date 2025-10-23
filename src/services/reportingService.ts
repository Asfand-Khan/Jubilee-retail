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
        pol.policy_code AS 'POLICY NUMBER',
        pol.status AS 'POLICY STATUS',
        pol.issue_date AS 'POLICY ISSUE DATE',
        pol.start_date AS 'POLICY START DATE',
        pol.expiry_date AS 'POLICY EXPIRY DATE',
        pol.received_premium AS 'TOTAL PRICE',
        ord.discount_amount AS 'DISCOUNT',
        c.campaign_name AS 'COUPON NAME',
        ord.customer_name AS 'CUSTOMER NAME',
        ord.customer_email AS 'CUSTOMER EMAIL',
        ord.customer_contact AS 'CUSTOMER CONTACT',
        ord.customer_cnic AS 'CUSTOMER CNIC',
        ord.customer_address AS 'CUSTOMER ADDRESS',
        pol.qr_doc_url AS 'DOCUMENT URL',
        p.name AS 'PLAN NAME',
        prod.product_name AS 'PRODUCT NAME',
        ag.name AS 'AGENT NAME',
        ag.igis_agent_code AS 'AGENT CODE',
        b.name AS 'BRANCH NAME',
        b.igis_branch_code AS 'BRANCH CODE',
        b.igis_branch_takaful_code AS 'BRANCH TAKAFUL CODE',
        cl.name AS 'CLIENT NAME',
        cl.igis_client_code AS 'CLIENT CODE',
        devo.name AS 'DEVELOPMENT OFFICER NAME',
        devo.igis_do_code AS 'DEVELOPMENT OFFICE CODE',
        ord.tracking_number AS 'TRACKING NUMBER',
        ord.id AS 'ORDER ID',
        pm.name AS 'PAYMENT MODE NAME',
        ord.cc_transaction_id AS 'TRANSACTION ID',
        ord.cc_approval_code AS 'APPROVAL CODE'
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
    `;

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` ORDER BY pol.id DESC`;

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
    const result = await prisma.$queryRawUnsafe(query, ...policyIds) as any[];
    return result;
  } catch (error: any) {
    throw new Error(`Failed to fetch policy details: ${error.message}`);
  }
};
