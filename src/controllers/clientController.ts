import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import { createClient, getAllClients, getClientById, getClientByIGISClientCode, updateClient } from "../services/clientService";
import { validateClient, validateClientListing, validateClientUpdate } from "../validations/clientValidations";

// Module --> Clients
// Method --> GET (Protected)
// Endpoint --> /api/v1/clients
// Description --> Fetch all clients
export const getAllClientsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateClientListing.parse(req.body);
    const clients = await getAllClients(parsed);
    return res.status(200).json({
      status: 1,
      message: "Clients fetched successfully",
      payload: clients,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Clients
// Method --> POST (Protected)
// Endpoint --> /api/v1/clients
// Description --> Create Client
export const createClientHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedClient = validateClient.parse(req.body);

    const clientByClientCode = await getClientByIGISClientCode(
      parsedClient.igis_client_code
    );

    if (clientByClientCode) {
      return res.status(400).json({
        status: 0,
        message: "Client with this client code already exists",
        payload: [],
      });
    }

    const newClient = await createClient(parsedClient, user.id);

    return res.status(201).json({
      status: 1,
      message: "Client created successfully",
      payload: [newClient],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Client
// Method --> GET (Protected)
// Endpoint --> /api/v1/clients/:id
// Description --> Get single client
export const getSingleClientHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId) || clientId <= 0) {
      throw new Error("Invalid client id");
    }

    const singleClient = await getClientById(clientId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single client successfully",
      payload: [singleClient],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Client
// Method --> PUT (Protected)
// Endpoint --> /api/v1/clients/
// Description --> Update client
export const updateClientHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedClient = validateClientUpdate.parse(req.body);

    const updatedClient = await updateClient(parsedClient);

    return res.status(200).json({
      status: 1,
      message: "Updated client successfully",
      payload: [updatedClient],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
