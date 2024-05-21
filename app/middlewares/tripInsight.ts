import { QueryResult } from "mysql2";
import { UserId } from "../../index";
import conn from "../config/mysql_connection";
import { Request, Response, NextFunction } from "express";

interface countTid {
  tid: number;
}

const triInsight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) {
      return res.redirect("/");
    }
    const result: Array<countTid> = (await conn.query<QueryResult>(
      `SELECT count(*) as tid FROM trip_members where trip_id=? and user_id=?;`,
      [req.params.id, (req.user as UserId).userId]
    )) as unknown as Array<countTid>;
    if (result[0].tid >= 1) {
      next();
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    return res.redirect("/");
  }
};

export default triInsight;
