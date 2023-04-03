import { User } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

const tokenScheme = z.object({
  id: z.string(),
  name: z.string(),
  refreshToken: z.string(),
  iat: z.number(),
  numberOfDecks: z
    .number()
    .min(0)
    .max(import.meta.env.USER_MAX_DECKS),
  exp: z.number(),
});

export type Token = z.infer<typeof tokenScheme>;

const secret = new TextEncoder().encode(import.meta.env.AUTH_SECRET);
const alg = "HS256";

export const validateToken = async (token: string) => {
  const maybePayload = await jwtVerify(token, secret);
  if (maybePayload) {
    const validatedPayload = tokenScheme.safeParse(maybePayload.payload);
    if (validatedPayload.success) {
      return validatedPayload.data;
    }
  }
  return null;
};

export const decodeToken = (token: string) => {
  const tokenBody = token.split(".")[1];
  const body = tokenScheme.safeParse(
    JSON.parse(decodeURIComponent(atob(tokenBody)))
  );
  if (body.success) {
    return body.data;
  }
  return null;
};

export const isTokenExpired = (token: string) => {
  const decodedToken = decodeToken(token);
  if (decodedToken) {
    return Date.now() > decodedToken.exp;
  }
  return true;
};

export const createAccessToken = async (
  payload: Pick<User, "id" | "name">
) => {
  const iat = Date.now();
  const expAcc = Date.now() + 2 * 60 * 60 * 1000;
  const expRef = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setIssuedAt(iat)
    .setExpirationTime(expRef)
    .sign(secret);
  const accessToken = await new SignJWT({ ...payload, refreshToken })
    .setProtectedHeader({ alg })
    .setIssuedAt(iat)
    .setExpirationTime(expAcc)
    .sign(secret);

  return accessToken;
};

export const getTokenFromHeader = (authorization: string) => {
  const maybeToken = authorization.split(" ")[1];
  if (maybeToken) {
    return maybeToken;
  }
  return null;
};

