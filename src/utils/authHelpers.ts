// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// const secret = process.env.JWT_SECRET;
// const expiration = process.env.JWT_EXPIRATION;

// if (!secret) {
//   throw new Error("JWT_SECRET is not defined in the environment variables.");
// }

// if (!expiration) {
//   throw new Error(
//     "JWT_EXPIRATION is not defined in the environment variables."
//   );
// }

// export const hashPassword = async (password: string): Promise<string> => {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// };

// export const comparePassword = async (
//   password: string,
//   hashedPassword: string
// ): Promise<boolean> => {
//   return await bcrypt.compare(password, hashedPassword);
// };

// export const generateToken = (user_id: number): string => {
//   // @ts-ignore
//   return jwt.sign({ user_id }, secret, {
//     expiresIn: expiration,
//   });
// };
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

const secret: string = process.env.JWT_SECRET ?? (() => { throw new Error("JWT_SECRET not defined"); })();
const expirationRaw: string = process.env.JWT_EXPIRATION ?? (() => { throw new Error("JWT_EXPIRATION not defined"); })();
const issuer: string = process.env.JWT_ISSUER ?? (() => { throw new Error("JWT_ISSUER not defined"); })();
const audience: string = process.env.JWT_AUDIENCE ?? (() => { throw new Error("JWT_AUDIENCE not defined"); })();

const expiration: jwt.SignOptions["expiresIn"] = expirationRaw as jwt.SignOptions["expiresIn"];

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
export const generateToken = (user_id: number): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: expiration,
    issuer: issuer,
    audience: audience,
  };

  return jwt.sign({ user_id }, secret, options);
};
