import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";
import { NextFunction, Request, Response } from "express";

const guest = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cookies?.token) {
      next();
    } else {
      try {
        let decoded: JwtPayload = jwt.verify(
          req.cookies.token,
          "welcome"
        ) as JwtPayload;
        return res.redirect("/profile");
      } catch (err) {
        next();
      }
    }
  } catch (error) {
    logger.error("middleware guest: " + error);
  }
};

module.exports = guest;
