import { Request, Response, NextFunction } from "express";
import conn from "../config/mysql_connection";
import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { QueryResult } from "mysql2";
import { dataSet } from "../../dto/commonInterface";

interface countTid {
  tid: number;
}

const daysInsert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.tid) {
      return res.redirect("/displayTrip");
    }

    let result: dataSet = (await conn.query(
      `select count(*) as tid from trip_details where trip_id=? `,
      [req.params.tid]
    )) ;

    const resultInfo: countTid[] =
    result[0] as countTid[];

    if (resultInfo[0].tid >= 1) {
      next();
    } else {
      if (req.method == "POST") {
        return res.json({ error: true });
      }
      return res.redirect("/displayTrip");
    }
  } catch (error) {
    return res.redirect("/displayTrip");
  }
};

export default daysInsert;
