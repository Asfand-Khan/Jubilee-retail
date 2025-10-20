import prisma from "../config/db";
import {
  ClientListingType,
  ClientType,
  ClientUpdateType,
} from "../validations/clientValidations";

export const getAllClients = async (data: ClientListingType) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    if (data.date && (!data.branch || data.branch.length === 0)) {
      const [start, end] = data.date.split("to").map((d) => d.trim());
      whereClause.created_at = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    if (data.branch && data.branch.length > 0) {
      whereClause.branch_id = {
        in: data.branch,
      };
    }

    const allClients = await prisma.client.findMany({
      where: whereClause,
    });
    return allClients;
  } catch (error: any) {
    throw new Error(`Failed to fetch all clients: ${error.message}`);
  }
};

export const createClient = async (client: ClientType, createdBy: number) => {
  try {
    const newClient = await prisma.client.create({
      data: {
        name: client.name,
        address: client.address,
        igis_client_code: client.igis_client_code,
        branch_id: client.branch_id,
        created_by: createdBy,
        contact_person: client.contact_person,
        telephone: client.telephone,
      },
    });
    return newClient;
  } catch (error: any) {
    throw new Error(`Failed to create a client: ${error.message}`);
  }
};

export const updateClient = async (client: ClientUpdateType) => {
  try {
    const updatedClient = await prisma.client.update({
      data: {
        name: client.name,
        address: client.address,
        igis_client_code: client.igis_client_code,
        branch_id: client.branch_id,
        contact_person: client.contact_person,
        telephone: client.telephone,
      },
      where: {
        id: client.client_id,
      },
    });
    return updatedClient;
  } catch (error: any) {
    throw new Error(`Failed to update a client: ${error.message}`);
  }
};

export const getClientByIGISClientCode = async (code: string) => {
  return prisma.client.findFirst({
    where: { igis_client_code: code },
  });
};

export const getClientById = async (id: number) => {
  return prisma.client.findUnique({
    where: { id },
  });
};
