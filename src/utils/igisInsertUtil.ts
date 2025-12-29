import axios, { AxiosError } from "axios";

export const igisInsert = async (policy: any, responseStatus: string) => {
  try {
    const customerData = policy.policyDetails.find(
      (detail: any) => detail.type.toLowerCase() === "customer"
    );
    const beneficiaryData = policy.policyDetails.find(
      (detail: any) => detail.type.toLowerCase() === "beneficiary"
    );
    const travelData = policy.PolicyTravel[0];

    let body = {
      BR_CD: policy.takaful_policy
        ? policy.order.branch?.igis_branch_takaful_code
        : policy.order.branch?.igis_branch_code,
      PDP_DEPT_CODE: "101",
      POLICY_TYPE: policy.product.productCategory.igis_product_code,
      DOC_NO: policy.policy_code,
      YEAR: new Date().getFullYear().toString(),
      CLIENT_ID: policy.order.client_id!.toString(),
      ISS_DATE: policy.issue_date!,
      PRD_FR: policy.start_date!,
      PRD_TO: policy.expiry_date!,
      SUM_INSURED: policy.sum_insured!,
      NET_PREMIUM: policy.received_premium!,
      AGENT_CD: policy.order.agent_id!.toString(),
      INDIVIDUAL_CLIENT: customerData?.name,
      ADDRSS_INSURED: customerData?.address,
      PHONE_1: customerData?.contact_number,
      EMAIL_ADDRESS: customerData?.email,
      GENDER: customerData?.gender == "male" ? "M" : "F",
      INSURED_DOB: customerData?.dob,
      PASSPORT_NO: customerData?.passport_no,
      OCCUPATION: customerData?.occupation,
      CNIC_INSURED: customerData?.cnic,
      BENEFICIARY_NAME: beneficiaryData?.name,
      CNIC_BNF: beneficiaryData?.cnic,
      RELATIONSHIP: beneficiaryData?.relation,
      CONTACT_BNF: beneficiaryData?.contact_number,
      ADDRESS_BNF: beneficiaryData?.address,
      DESINATION: travelData?.destination,
      PRODUCT_NAME: policy.product.product_name,
      PLAN: policy.plan.name,
      COVERAGE_DAYS: travelData?.no_of_days,
      STAY_DAY: travelData?.no_of_days,
      GDH_CNIC_ISSUE_DATE_INSURED: customerData?.cnic_issue_date,
      GDH_DOB_INSURED: customerData?.dob,
      GDH_HIGH_RISK: responseStatus == "clear" ? "N" : "Y",
      GDH_CNIC_COPY_OBT_INSURED: "N",
      GDH_CNIC_ISSUE_DATE_BNF: beneficiaryData?.cnic_issue_date,
      GDH_CNIC_COPY_OBT_BNF: "N",
    };

    const response = await axios.post(`${process.env.IGIS_INSERT_URL}`, body, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "jgi-api-gateway",
      },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("IGIS Insert Axios Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });

      return {
        success: false,
        error: true,
        message: "Axios error while calling IGIS Insert API",
        details: error.response?.data || error.message,
      };
    }

    console.error("IGIS Insert Unknown Error:", error);

    return {
      success: false,
      error: true,
      message: "Unknown error while calling IGIS Insert API",
    };
  }
};
