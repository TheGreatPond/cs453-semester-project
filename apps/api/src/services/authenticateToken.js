import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export const jwtSecret = env.JWT_SECRET;
export const jwtExpiresIn = "1h";

export function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Send a Bearer token in the Authorization header."
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "The access token is missing, invalid, or expired."
    });
  }
}