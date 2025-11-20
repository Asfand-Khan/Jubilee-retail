import axios, { AxiosError } from "axios";

export const pepScan = async (cnic: string) => {
  try {
    const response = await axios.get(`${process.env.PEP_SCAN_URL}`, {
      params: {
        searchtype: "fuzzy",
        cnic,
      },
      headers: {
        Authorization: `${process.env.PEP_SCAN_TOKEN}`,
        "Content-Type": "application/json",
      },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("PEP Scan Axios Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });

      return {
        success: false,
        error: true,
        message: "Axios error while calling PEP Scan API",
        details: error.response?.data || error.message,
      };
    }

    console.error("PEP Scan Unknown Error:", error);

    return {
      success: false,
      error: true,
      message: "Unknown error while calling PEP Scan API",
    };
  }
};
