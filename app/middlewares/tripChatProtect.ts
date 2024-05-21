import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { UserId } from "../../index";
import { QueryResult } from "mysql2";

interface Userid {
  id: number;
}

const tripChatProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let result: Array<Userid> = (await conn.query<QueryResult>(
      `select id from trip_members where trip_id = ? and user_id = ? and deleted_at is NULL`,
      [req.body.tripId, (req.user as UserId).userId]
    )) as unknown as Array<Userid>;

    if (result.length == 1) {
      next();
    } else {
      return res.json({ error: "You have no access" });
    }
  } catch (error) {
    logger.error("middleware tripchatProtect: " + error);
    return res.json({ error: "Something went wrong" });
  }
};

export default tripChatProtect;
