import logger from "../../config/logger";
import connection from "../../config/mysql_connection";
import { UserId } from "../../../index";
import { Request, Response } from "express";
import { QueryResult, ResultSetHeader } from "mysql2";
import { Result } from "express-validator";
import { likedByInterface } from "../../../dto/likecommentInterface";
import { UpdateSet, dataSet } from "../../../dto/commonInterface";

export async function getLikedBy(req: Request, res: Response) {
  try {
    const id: string = req.body.postId;
    const likedByUsers: string =
      "select users.id,user.profile_image, user.first_name, user.last_name, user.username from post_likes likes inner join users_auth users on users.id = likes.liked_by inner join user_profiles user on users.id = user.user_id where likes.post_id = ? and likes.isdeleted is null";

    const result: dataSet = await connection.query<QueryResult>(
      likedByUsers,
      id
    );

    return res.status(200).json({ data: result[0] });
  } catch (error) {
    logger.error("likeCommentController getLikedBy function: " + error);
  }
}

export async function getCommentBy(req: Request, res: Response) {
  try {
    const id: string = req.body.postId;

    const commentsByUser:string =
      "select comment.id as comment_id, users.id,user.profile_image, user.first_name, user.last_name, user.username, comment.comments from post_comment comment inner join users_auth users on users.id = comment.comment_by inner join user_profiles user on users.id = user.user_id where comment.post_id = ? and comment.deleted_at is null order by comment.create_at desc";

    const allReplyQuery :string=
      "select post_comment.id,reply.id as replyId, reply.created_at, reply.reply_comment, reply.reply_by,user.first_name, user.last_name, user.profile_image from post_comment inner join comment_reply reply on post_comment.id = reply.comment_id inner join user_profiles user on reply.reply_by = user.user_id where post_comment.post_id = ? and reply.deleted_at is null order by post_comment.id desc ,reply.created_at desc";

    const result:dataSet = await connection.query(commentsByUser, id);
    const allReplyRes:dataSet = await connection.query(allReplyQuery, id);
    return res.status(200).json({
      data: result[0],
      logedUserId: (req.user as UserId).userId,
      allReply: allReplyRes[0],
    });
  } catch (error) {
    logger.error("likeCommet Controller getCommentBy function: " + error);
  }
}
export async function getComment(req: Request, res: Response) {
  try {
    const userId:string = (req.user as UserId).userId;
    const postId:string = req.body.postId;
    const comment:string = req.body.comment;

    const data = {
      post_id: postId,
      comment_by: userId,
      comments: comment,
    };

    const storeComment:string = "insert into post_comment set ?";

    const updateCommentCount :string=
      "update posts set comment_count = comment_count + 1 where id = ? ";

    const result:UpdateSet = await connection.query(storeComment, data);
    await connection.query(updateCommentCount, [postId]);

    const lastComment =
      "select comment.id as comment_id,users.id,user.profile_image, user.first_name, user.last_name, user.username, comment.comments from post_comment comment inner join users_auth users on users.id = comment.comment_by inner join user_profiles user on users.id = user.user_id where comment.post_id = ?and comment.id = ?";

    const lastCommentRes:dataSet = await connection.query(lastComment, [
      postId,
      result[0].insertId,
    ]);

    return res.status(200).json({
      status: 200,
      lastComment: lastCommentRes[0],
      logedUserId: (req.user as UserId).userId,
    });
  } catch (error) {
    logger.error("likeCommet Controller getComment function: " + error);
  }
}

export async function removeComment(req: Request, res: Response) {
  try {
    const id:string = req.body.commentId;

    const dltCommentquery :string=
      "update post_comment set deleted_at = current_timestamp where id = ?";

    const updateCommentCount :string=
      "update posts set comment_count = comment_count - 1 where id = ?";
    await connection.query(dltCommentquery, id);
    await connection.query(updateCommentCount, req.body.postId);
  } catch (error) {
    logger.error("home controller removeComment function: " + error);
  }
}
