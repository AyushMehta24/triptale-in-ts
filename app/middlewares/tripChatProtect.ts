import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { UserId } from "../../index";
import { QueryResult } from "mysql2";
import { dataSet } from "../../dto/commonInterface";

interface Userid {
  id: number;
}

const tripChatProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let result: dataSet = (await conn.query(
      `select id from trip_members where trip_id = ? and user_id = ? and deleted_at is NULL`,
      [req.body.tripId, (req.user as UserId).userId]
    )) ;

    const resultInfo: Userid[] =
    result[0] as Userid[];

    if (resultInfo.length == 1) {
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
