import { dataSet } from "../../dto/commonInterface";
import { UserId } from "../../index";
import conn from "../config/mysql_connection";
import { Request, Response, NextFunction } from "express";

interface countTid {
  tid: number;
}

const tripprotect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.query.tid) {
      return res.redirect("/displayTrip");
    }
    const result: dataSet = await conn.query(
      `select count(*) as tid from trip_details where trip_id=? AND (SELECT count(*) FROM trip_members WHERE trip_id=? and user_id=?)`,
      [req.query.tid, req.query.tid, (req.user as UserId).userId]
    );

    const resultInfo: countTid[] = result[0] as countTid[];
    if (resultInfo[0].tid >= 1) {
      next();
    } else {
      if (req.method === "POST") {
        return res.json({ error: true });
      }
      return res.redirect("/displayTrip");
    }
  } catch (error) {
    return res.redirect("/displayTrip");
  }
};

export default tripprotect;
