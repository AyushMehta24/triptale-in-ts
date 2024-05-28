import { QueryResult } from "mysql2";
import { UserId } from "../../index";
import conn from "../config/mysql_connection";
import { Request, Response, NextFunction } from "express";
import { dataSet } from "../../dto/commonInterface";

interface countTid {
  tid: number;
}

const triInsight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) {
      return res.redirect("/");
    }
    const result: dataSet = (await conn.query(
      `SELECT count(*) as tid FROM trip_members where trip_id=? and user_id=?;`,
      [req.params.id, (req.user as UserId).userId]
    )) ;

    const resultInfo: countTid[] =
    result[0] as countTid[];

    // countTid
    if (resultInfo[0].tid >= 1) {
      next();
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    return res.redirect("/");
  }
};

export default triInsight;
