import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { Request, Response, NextFunction } from "express";
import { UserId } from "../../index";
import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { QueryResult } from "mysql2";
import { dataSet } from "../../dto/commonInterface";

interface Data {
  isexists: number;
}

const tripDaysProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.query.did || !/^\d+$/.test(req.query.did as string)) {
      return res.redirect("/displayTrip");
    }
    const result: dataSet = (await conn.query(
      `SELECT EXISTS(select id from trip_members where trip_id in (select trip_id from trip_days where id = ? and trip_days.deleted_at is null) and user_id = ? and deleted_at is NULL) as isexists`,
      [req.query.did, (req.user as UserId).userId]
    )) ;

    const resultInfo: Data[] =
    result[0] as Data[];
    if (resultInfo[0].isexists == 1) {
      next();
    } else {
      if (req.method == "POST" && req.path == "/deleteday") {
        return res.json({ error: true });
      }
      if (req.method == "POST" && req.path == "/updateday") {
        return res.json({ error: true });
      }
      return res.redirect("/displayTrip");
    }
  } catch (error) {
    logger.error("middleware tripDayProtect: " + error);
    return res.redirect("/displayTrip");
  }
};

export default tripDaysProtect;
