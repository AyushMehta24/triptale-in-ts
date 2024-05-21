import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";
import { NextFunction, Request, Response } from "express";

const guest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if there's no token in cookies
    if (!req.cookies?.token) {
      return next(); // Proceed to the next middleware
    } else {
      // If there's a token, attempt to decode it
      try {
        const decoded: JwtPayload = jwt.verify(
          req.cookies.token,
          "welcome"
        ) as JwtPayload;
        // If decoding successful, user is authenticated, redirect to profile
        return res.redirect("/profile");
      } catch (err) {
        // If decoding fails, token might be invalid, proceed as guest
        logger.error("Error decoding JWT token:", err);
        return next();
      }
    }
  } catch (error) {
    // General error handling
    logger.error("Middleware guest:", error);
    return next(error);
  }
};

export default guest;
