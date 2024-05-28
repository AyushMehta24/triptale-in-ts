import { Request, Response, NextFunction } from "express";
import logger from "../../config/logger";
import conn from "../../config/mysql_connection";
import { UserId } from "../../../index";
import { QueryResult } from "mysql2";
import { dataSet } from "../../../dto/commonInterface";

const updatePostProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId :string= req.query.id as string;

    if (!postId || !/^\d+$/.test(postId)) {
      return res.redirect("/userProfile");
    }

    const result:dataSet = await conn.query(
      `SELECT EXISTS(SELECT * FROM posts WHERE id = ? and user_id = ? and isdeleted IS NULL) as isexists`,
      [postId, (req.user as UserId).userId]
    );

    const resultInfo: {isexists:string}[] =
    result[0] as {isexists:string}[];

    if (resultInfo[0].isexists) {
      next();
    } else {
      return res.redirect("/*");
    }
  } catch (error) {
    logger.error("middleware updatePostProtect: " + error);
    return res.redirect("/userProfile");
  }
};

export default updatePostProtect;
