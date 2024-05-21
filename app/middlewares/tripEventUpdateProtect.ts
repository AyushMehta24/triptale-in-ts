import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { UserId } from "../../index";
import { QueryOptions, QueryResult } from "mysql2";

interface existsCheck {
  isexists: number;
}

const tripEventUpdateProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.query.tid || !/^\d+$/.test(req.query.tid.toString())) {
      return res.redirect("back");
    }
    if (!req.query.eid || !/^\d+$/.test(req.query.eid.toString())) {
      return res.redirect("back");
    }
    const result: Array<existsCheck> = (await conn.query<QueryResult>(
      `SELECT EXISTS(select id from trip_members where trip_id = (select trip_id from trip_events where id = ? and created_by = ? and deleted_at is null) and user_id = ? and deleted_at is null) as isexists`,
      [req.query.eid, (req.user as UserId).userId, (req.user as UserId).userId]
    )) as unknown as Array<existsCheck>;
    if (result[0].isexists == 1) {
      next();
    } else {
      if (req.path == "/eventdelete") {
        return res.json({ error: true });
      }
      return res.redirect("back");
    }
  } catch (error) {
    logger.error("middleware tripDayProtect: " + error);
    return res.redirect("/displayTrip");
  }
};

export default tripEventUpdateProtect;
