import logger from "../../config/logger";
import connection from "../../config/mysql_connection";
import { UserId } from "../../../index";
import { Request, Response } from "express";
import { QueryResult, ResultSetHeader } from "mysql2";
import { replyDataInterface } from "../../../dto/replyCommentControllerInterface";
import { UpdateSet, dataSet } from "../../../dto/commonInterface";

export async function getReplyComment(req: Request, res: Response) {
  try {
    const replyData: replyDataInterface = {
      comment_id: req.body.CmtId,
      reply_comment: req.body.reply,
      reply_by: (req.user as UserId).userId,
    };

    const replyQuery :string= "insert into comment_reply set ?";

    const result:UpdateSet = await connection.query(
      replyQuery,
      replyData
    );

    const lastReply :string=
      "select reply.id as replyId,reply.comment_id, reply.reply_comment, user.profile_image, user.first_name, user.last_name from comment_reply reply inner join user_profiles user on reply.reply_by = user.user_id where reply.id = ?";

    const lastReplyRes:dataSet = await connection.query(
      lastReply,
      result[0].insertId
    );

    res.status(200).json({ lastReply: lastReplyRes[0] });
  } catch (error) {
    logger.error("replyCommentController getReplyComment function: " + error);
    res.render("components/error");
  }
}

export async function replyCommentDelete(req: Request, res: Response) {
  try {
    const dltReplyComment:string =
      "update comment_reply set deleted_at = current_timestamp where id = ?";

    await connection.query(dltReplyComment, req.body.replyId);
  } catch (error) {
    logger.error("replyCommentCotroller replyCommentDelete function: " + error);
    res.render("components/error");
  }
}
