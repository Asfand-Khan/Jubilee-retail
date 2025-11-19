import { Request, Response } from "express";
import { z } from "zod";
import { User } from "@prisma/client";
import { AuthRequest } from "../types/types";
import { comparePassword, generateToken } from "../utils/authHelpers";
import { sendEmail } from "../utils/sendEmail";
import { compareOtp } from "../utils/compareOtp";
import { sendSms } from "../utils/sendSms";
import { formatMillisecondsToDHMS } from "../utils/dateFormat";
import {
  createApiUser,
  createUser,
  deleteUserById,
  generateOTP,
  getApiProfiles,
  getApiUserById,
  getProfiles,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  getUserMenus,
  incFailedAttempts,
  lockAccount,
  resetFailedAttempts,
  resetLockedUser,
  updateApiUser,
  updateApiUserCredentials,
  updateLastLoginDateTime,
  updateUserEntry,
  updateUserPasswordEntry,
} from "../services/userService";
import {
  verifyOtp as verifyOtpSchema,
  validateSendOtp,
  validateUserLogin,
  validateUserRegister,
  validateUserUpdate,
  validateUserList,
  validateUserPasswordUpdate,
} from "../validations/userValidations";
import { getOTPEmailTemplate } from "../utils/getOtpTemplate";

// Module --> User
// Method --> POST (Protected)
// Endpoint --> /api/v1/users/register
// Description --> Register a new user
export const registerUser = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedUser = validateUserRegister.parse(req.body);

    const existingUserWithEmail = await getUserByEmail(parsedUser.email);
    if (existingUserWithEmail) {
      return res.status(400).json({
        status: 0,
        message: "User with this email already exists",
        payload: [],
      });
    }

    const existingUserWithUsername = await getUserByUsername(
      parsedUser.username
    );
    if (existingUserWithUsername) {
      return res.status(400).json({
        status: 0,
        message: "User with this username already exists",
        payload: [],
      });
    }

    const newUser = await createUser(parsedUser, user.id);

    if (parsedUser.user_type === "api_user") {
      await createApiUser(newUser, user.id);
    }

    return res.status(201).json({
      status: 1,
      message: "User registered successfully",
      payload: [newUser],
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

// Module --> User
// Method --> POST (Protected)
// Endpoint --> /api/v1/users
// Description --> Update existing user
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedUser = validateUserUpdate.parse(req.body);

    const newUser = await updateUserEntry(parsedUser, user.id);

    if (parsedUser.user_type === "api_user") {
      await updateApiUser(newUser);
    }

    return res.status(200).json({
      status: 1,
      message: "User updated successfully",
      payload: [newUser],
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

// Module --> User
// Method --> PUT (Protected)
// Endpoint --> /api/v1/users/password
// Description --> Update User's Password existing user
export const updateUserPassword = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedUser = validateUserPasswordUpdate.parse(req.body);

    const newUser = await updateUserPasswordEntry(parsedUser, user.id);

    return res.status(200).json({
      status: 1,
      message: "User password updated successfully",
      payload: [newUser],
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

// Module --> User
// Method --> GET (Protected)
// Endpoint --> /api/v1/users/:id
// Description --> Fetch single user details
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    const user = await getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return res.status(200).json({
      status: 1,
      message: "User profile fetched successfully",
      payload: [
        {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          contact: user.phone,
          image: user.image,
          isActive: user.is_active,
          isLocked: user.is_locked,
          userType: user.user_type,
          redirectionUrl: user.redirection_url,
          rights: user.user_menu_rights,
        },
      ],
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

// Module --> User
// Method --> GET (Protected)
// Endpoint --> /api/v1/users/my-profile
// Description --> Fetch logged in user details
export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    return res.status(200).json({
      status: 1,
      message: "User profile fetched successfully",
      payload: [
        {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          contact: user.phone,
          image: user.image,
          isActive: user.is_active,
          lastLoginDate: user.last_login_date,
        },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> User
// Method --> GET (Protected)
// Endpoint --> /api/v1/users
// Description --> Fetch all user
export const getUserProfiles = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateUserList.parse(req.body);
    const profiles = await getProfiles(parsed);
    return res.status(200).json({
      status: 1,
      message: "User profiles fetched successfully",
      payload: profiles,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> User
// Method --> DELETE (Protected)
// Endpoint --> /api/v1/users/:id
// Description --> Soft deletes a user
export const deleteUserProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    const deletedUser = await deleteUserById(userId);

    return res.status(200).json({
      status: 1,
      message: "User profile deleted successfully.",
      payload: [
        {
          id: deletedUser.id,
          username: deletedUser.username,
          fullname: deletedUser.fullname,
          email: deletedUser.email,
          contact: deletedUser.phone,
          image: deletedUser.image,
          isActive: deletedUser.is_active,
        },
      ],
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

// Module --> Auth
// Method --> POST (Protected)
// Endpoint --> /api/v1/users/login
// Description --> Authenticate a user
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedUser = validateUserLogin.parse(req.body);

    // Step 1: Check if user exists
    const user = await getUserByUsername(parsedUser.username);
    if (!user) {
      return res.status(400).json({
        status: 0,
        message: "Invalid username or password",
        payload: [],
      });
    }

    // Step 2: Handle locked account logic
    if (user.is_locked) {
      const lockTime = user.lock_time?.getTime();
      const currentTime = Date.now();
      const oneHourInMs = 60 * 60 * 1000;

      if (lockTime) {
        const timeElapsed = currentTime - lockTime;

        // If 1 hour has passed, unlock user
        if (timeElapsed >= oneHourInMs) {
          await resetLockedUser(user.id);
        } else {
          // Still locked
          const timeLockedFor = formatMillisecondsToDHMS(timeElapsed);
          return res.status(403).json({
            status: 0,
            message: `Your account is locked for 1 hour. Time passed since lock: ${timeLockedFor}`,
            payload: [],
          });
        }
      }
    }

    // Step 3: Check if email is verified
    if (!user.email_verified_at) {
      return res.status(403).json({
        status: 0,
        message: "Please verify your email first",
        payload: [],
      });
    }

    // Step 4: Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        status: 0,
        message: "Please activate your account first",
        payload: [],
      });
    }

    // Step 5: Compare password
    const passwordMatch = await comparePassword(
      parsedUser.password,
      user.password
    );

    // Step 6: Handle failed login
    if (!passwordMatch) {
      const attempts = await incFailedAttempts(user.username);

      if (attempts >= 4) {
        await lockAccount(user.username);
        return res.status(403).json({
          status: 0,
          message:
            "Too many failed login attempts. Your account has been locked for 1 hour.",
          payload: [],
        });
      }

      return res.status(403).json({
        status: 0,
        message: `Invalid username or password, you have ${
          4 - attempts
        } attempts left`,
        payload: [],
      });
    }

    // Step 7: If password is correct
    await generateOTP(user.username);
    await resetFailedAttempts(user.username);

    return res.status(200).json({
      status: 1,
      message: "User login successfully.",
      payload: [
        {
          username: user.username,
        },
      ],
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
      message: error.message || "Internal Server Error",
      payload: [],
    });
  }
};

// Module --> Auth
// Method --> POST (Protected)
// Endpoint --> /api/v1/users/send-otp
// Description --> Sends OTP
export const sendOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedData = validateSendOtp.parse(req.body);
    const user = await getUserByUsername(parsedData.username);

    if (!user) {
      return res.status(400).json({
        status: 0,
        message: `User not found.`,
        payload: [],
      });
    }

    if (user.otp_token === null || user.otp_token === undefined) {
      return res.status(400).json({
        status: 0,
        message: `OTP token not found or generated.`,
        payload: [],
      });
    }

    let result = null;
    // if (parsedData.type === "email") {
    //   result = await sendEmail({
    //     to: user.email,
    //     subject: "OTP Verification",
    //     html: getOTPEmailTemplate(user.otp_token, user.fullname),
    //   });
    // } else {
    //   // result = await sendSms(
    //   //   user.phone,
    //   //   `Dear ${user.fullname}, to ensure the security of your account, We require verification through a one-time password (OTP).\n \nPlease find your OTP below:\n \nOTP: ${user.otp_token} \n \nKindly enter this OTP on the verification page to complete the process. If you did not initiate this verification, please contact our support. \n \nThank you for your cooperation`
    //   // );
    //   result = await sendSms(
    //     user.phone,
    //     `Dear ${user.fullname},
    //       For your account's protection, we're confirming a recent action.

    //       Your access key is provided below:
    //       Access Key: ${user.otp_token}

    //       Please enter this key on the verification page to proceed. If you didn't request this, kindly contact our support team.

    //     We appreciate your prompt attention.`
    //   );
    // }

    return res.status(200).json({
      status: 1,
      message: `OTP sent successfully.`,
      payload: [],
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

// Module --> Auth
// Method --> POST (Protected)
// Endpoint --> /api/v1/users/verify-otp
// Description --> Verifies provided OTP
export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedData = verifyOtpSchema.parse(req.body);
    const user = await getUserByUsername(parsedData.username);

    if (!user) {
      return res.status(400).json({
        status: 0,
        message: "User not found",
        payload: [],
      });
    }

    const isValid = compareOtp(user.otp_token, parsedData.otp);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        message: "Invalid OTP",
        payload: [],
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login date
    await updateLastLoginDateTime(user.id);

    // Get user menus
    const menus = await getUserMenus(user.id);

    return res.status(200).json({
      status: 1,
      message: "OTP validated successfully",
      payload: [
        {
          token,
          user_info: {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            contact: user.phone,
            isActive: user.is_active,
            image: user.image,
            redirection_url: user.redirection_url,
            userType: user.user_type,
            is_active: user.is_active,
            is_locked: user.is_locked,
          },
          menus,
        },
      ],
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

// Module --> API User
// Method --> GET (Protected)
// Endpoint --> /api/v1/api-users
// Description --> Fetch all API user
export const getApiUserProfiles = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateUserList.parse(req.body);
    const profiles = await getApiProfiles(parsed);
    return res.status(200).json({
      status: 1,
      message: "API User profiles fetched successfully",
      payload: profiles,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> API User
// Method --> GET (Protected)
// Endpoint --> /api/v1/api-users/:id
// Description --> Update API User Credentials
export const updateApiUserCreds = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    const apiUser = await getApiUserById(userId);
    if (!apiUser) {
      throw new Error("API User not found");
    }

    const updatedApiUser = await updateApiUserCredentials(apiUser.id);
    return res.status(200).json({
      status: 1,
      message: "API User profiles creds updated successfully",
      payload: [updatedApiUser],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
