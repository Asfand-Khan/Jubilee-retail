import prisma from "../config/db";

export const getAllMotorQuotes = async () => {
  try {
    const allQuotes = await prisma.motorQuote.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allQuotes;
  } catch (error: any) {
    throw new Error(`Failed to fetch all motor quotes: ${error.message}`);
  }
};