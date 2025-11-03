import crypto from "crypto";
import prisma from "../config/db";
import { ApiUser, User } from "@prisma/client";
import { comparePassword, hashPassword } from "../utils/authHelpers";
import {
  UserList,
  UserPasswordUpdate,
  UserRegister,
  UserUpdate,
} from "../validations/userValidations";
import { generateRandomString } from "../utils/commonUtils";
import {
  extractImageAndExtension,
  saveBase64Image,
} from "../utils/base64ToImage";

export const createUser = async (input: UserRegister): Promise<User> => {
  const {
    username,
    fullname,
    email,
    phone,
    password,
    is_active,
    image,
    created_by,
    menu_rights,
    user_type,
    redirection_url,
  } = input;
  try {
    const hashedPassword = await hashPassword(password);

    const userData = {
      username,
      fullname,
      email,
      phone,
      password: hashedPassword,
      is_active,
      created_by,
      user_type,
      redirection_url,
    };

    let imageFileName: string | undefined;
    if (image) {
      const { image: imageBase64, extension } = extractImageAndExtension(image);
      imageFileName = `${username}-${new Date().getTime()}.${extension}`;
      const customDirectory = "uploads/users";
      const { success } = await saveBase64Image(
        imageBase64,
        imageFileName,
        customDirectory
      );
      if (!success) throw new Error("Failed to save user image");
    }

    const user = await prisma.$transaction(async (prisma) => {
      let newUser = await prisma.user.create({
        data: {
          ...userData,
          image: imageFileName,
        },
      });

      const menuRightsData = menu_rights.map((right) => ({
        user_id: newUser.id,
        menu_id: right.menu_id,
        can_view: right.can_view ?? true,
        can_create: right.can_create ?? false,
        can_edit: right.can_edit ?? false,
        can_delete: right.can_delete ?? false,
      }));

      await prisma.userMenuRight.createMany({
        data: menuRightsData,
      });

      return newUser;
    });

    return user;
  } catch (error: any) {
    throw new Error(`Failed to register user: ${error.message}`);
  }
};

export const updateUserEntry = async (
  input: UserUpdate,
  createdBy: number
): Promise<User> => {
  const {
    username,
    fullname,
    email,
    phone,
    password,
    is_active,
    image,
    menu_rights,
    user_id,
    is_locked,
    user_type,
  } = input;
  try {
    const userData: any = {
      username,
      fullname,
      email,
      phone,
      is_active,
      is_locked,
      user_type,
      created_by: createdBy,
    };

    if (password) {
      const hashedPassword = await hashPassword(password);
      userData["password"] = hashedPassword;
    }

    let imageFileName: string | undefined;
    if (image) {
      const { image: imageBase64, extension } = extractImageAndExtension(image);
      imageFileName = `${username}-${new Date().getTime()}.${extension}`;
      const customDirectory = "uploads/users";
      const { success } = await saveBase64Image(
        imageBase64,
        imageFileName,
        customDirectory
      );
      if (!success) throw new Error("Failed to save user image");
    }

    const user = await prisma.$transaction(async (prisma) => {
      let updatedUser = await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          ...userData,
          image: imageFileName,
        },
      });

      if (menu_rights && menu_rights.length > 0) {
        const menuRightsData = menu_rights.map((right) => ({
          user_id: updatedUser.id,
          menu_id: right.menu_id,
          can_view: right.can_view,
          can_create: right.can_create,
          can_edit: right.can_edit,
          can_delete: right.can_delete,
        }));

        await prisma.userMenuRight.deleteMany({
          where: {
            user_id: updatedUser.id,
          },
        });

        await prisma.userMenuRight.createMany({
          data: menuRightsData,
        });
      }

      return updatedUser;
    });

    return user;
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

export const updateUserPasswordEntry = async (
  input: UserPasswordUpdate,
  userId: number
): Promise<User> => {
  const { oldPassword, newPassword } = input;

  try {
    // 🔍 Fetch existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // 🔐 Verify old password
    const isMatch = await comparePassword(oldPassword, existingUser.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    // 🚀 Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 💾 Update user password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return updatedUser;
  } catch (error: any) {
    throw new Error(`Failed to update user password: ${error.message}`);
  }
};

export const createApiUser = async (input: User): Promise<ApiUser> => {
  const { username, email, phone, created_by, id } = input;
  try {
    const apiPassword = generateRandomString(16);
    const apiKey = generateRandomString(64);

    const apiUser = await prisma.apiUser.create({
      data: {
        api_key: apiKey,
        api_password: apiPassword,
        name: username,
        email,
        created_by,
        phone,
        user_id: id,
      },
    });

    return apiUser;
  } catch (error: any) {
    throw new Error(`Failed to create API user: ${error.message}`);
  }
};

export const updateApiUser = async (input: User): Promise<ApiUser> => {
  const { username, email, phone, created_by, id } = input;
  try {
    const apiUser = await prisma.apiUser.update({
      where: {
        user_id: id,
      },
      data: {
        name: username,
        email,
        created_by,
        phone,
        user_id: id,
      },
    });

    return apiUser;
  } catch (error: any) {
    throw new Error(`Failed to update API user: ${error.message}`);
  }
};

export const getProfiles = async (data: UserList) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    if (data.date) {
      const [start, end] = data.date.split("to").map((d) => d.trim());
      whereClause.created_at = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const allUsers = await prisma.user.findMany({
      where: whereClause,
    });
    return allUsers;
  } catch (error: any) {
    throw new Error(`Failed to fetch all user: ${error.message}`);
  }
};

export const getApiProfiles = async (data: UserList) => {
  try {
    let whereClause = {
      is_deleted: false,
    } as any;

    if (data.date) {
      const [start, end] = data.date.split("to").map((d) => d.trim());
      whereClause.created_at = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const allApiUsers = await prisma.apiUser.findMany({
      where: whereClause,
    });
    return allApiUsers;
  } catch (error: any) {
    throw new Error(`Failed to fetch all API user: ${error.message}`);
  }
};

export const resetFailedAttempts = async (username: string) => {
  const user = await prisma.user.update({
    where: { username },
    data: {
      failed_attempt: 0,
      last_login_date: new Date(),
    },
  });

  return user.failed_attempt;
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: { email },
  });
};

export const getUserByContact = async (contact: string) => {
  return prisma.user.findFirst({
    where: { phone: contact },
  });
};

export const getUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      user_menu_rights: {
        include: {
          menu: true,
        },
      },
    },
  });
};

export const deleteUserById = async (id: number) => {
  return prisma.user.update({
    where: { id },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};

export const incFailedAttempts = async (username: string): Promise<number> => {
  try {
    const user = await prisma.user.update({
      where: { username },
      data: {
        failed_attempt: { increment: 1 },
      },
    });

    return user.failed_attempt;
  } catch (error) {
    console.error("Error incrementing failed attempts:", error);
    return 0; // Default to 0 if there's an error
  }
};

export const lockAccount = async (username: string): Promise<boolean> => {
  try {
    await prisma.user.update({
      where: { username },
      data: { is_locked: true, lock_time: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Error locking account:", error);
    return false;
  }
};

export const uploadUserImage = async (userId: number, image: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { image },
  });
};

export const generateOTP = async (username: string) => {
  return await prisma.user.update({
    select: { otp_token: true, otp_time: true },
    where: { username },
    data: {
      otp_token: crypto.randomInt(100000, 1000000).toString(),
      otp_time: new Date(),
    },
  });
};

export const updateLastLoginDateTime = async (userId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { last_login_date: new Date(), otp_time: null, otp_token: null },
  });
};

export const resetLockedUser = async (userId: number) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      is_locked: false,
      failed_attempt: 0,
      lock_time: null,
    },
  });
};

export const getApiUserById = async (id: number) => {
  return prisma.apiUser.findUnique({
    where: { id },
  });
};

export const getApiUserByUserId = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  if (user.user_type === "api_user") {
    return prisma.apiUser.findUnique({
      where: {
        user_id: id,
      },
    });
  } else {
    return null;
  }
};

export const updateApiUserCredentials = async (
  apiUserId: number
): Promise<ApiUser> => {
  try {
    const apiPassword = generateRandomString(16);
    const apiKey = generateRandomString(64);

    const apiUser = await prisma.apiUser.update({
      where: {
        id: apiUserId,
      },
      data: {
        api_key: apiKey,
        api_password: apiPassword,
      },
    });

    return apiUser;
  } catch (error: any) {
    throw new Error(`Failed to update API user creds: ${error.message}`);
  }
};

export const getUserMenus = async (userId: number) => {
  const userMenus = await prisma.userMenuRight.findMany({
    where: {
      user_id: userId,
    },
    include: {
      menu: true,
    },
  });

  // Transform to desired response
  const formattedMenus = userMenus.map((userMenu) => ({
    menu_id: userMenu.menu.id,
    menu_name: userMenu.menu.name,
    icon: userMenu.menu.icon,
    sorting: userMenu.menu.sorting,
    url: userMenu.menu.url,
    parent_id: userMenu.menu.parent_id,
    can_view: userMenu.can_view ? "1" : "0",
    can_create: userMenu.can_create ? "1" : "0",
    can_edit: userMenu.can_edit ? "1" : "0",
    can_delete: userMenu.can_delete ? "1" : "0",
  }));

  return formattedMenus;
};
