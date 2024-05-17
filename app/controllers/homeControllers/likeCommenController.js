const logger = require("../../config/logger");
const connection = require("../../config/mysql_connection");

const getUserInfo = () => {
  return {
    async getLikedBy(req, res) {
      try {
        const id = req.body.postId;
        const likedByUsers =
          "select users.id,user.profile_image, user.first_name, user.last_name, user.username from post_likes likes inner join users_auth users on users.id = likes.liked_by inner join user_profiles user on users.id = user.user_id where likes.post_id = ? and likes.isdeleted is null";

        const [result] = await connection.query(likedByUsers, id);

        return res.status(200).json({ data: result });
      } catch (error) {
        logger.error(
          "likeCommentController getLikedBy function: " + error.message
        );
      }
    },

    async getCommentBy(req, res) {
      try {
        const id = req.body.postId;

        const commentsByUser =
          "select comment.id as comment_id, users.id,user.profile_image, user.first_name, user.last_name, user.username, comment.comments from post_comment comment inner join users_auth users on users.id = comment.comment_by inner join user_profiles user on users.id = user.user_id where comment.post_id = ? and comment.deleted_at is null order by comment.create_at desc";

        const allReplyQuery = "select post_comment.id,reply.id as replyId, reply.created_at, reply.reply_comment, reply.reply_by,user.first_name, user.last_name, user.profile_image from post_comment inner join comment_reply reply on post_comment.id = reply.comment_id inner join user_profiles user on reply.reply_by = user.user_id where post_comment.post_id = ? and reply.deleted_at is null order by post_comment.id desc ,reply.created_at desc"

        const [result] = await connection.query(commentsByUser, id);
        const [allReplyRes] = await connection.query(allReplyQuery, id);
        return res
          .status(200)
          .json({ data: result, logedUserId: req.user.userId, allReply: allReplyRes });
      } catch (error) {
        logger.error(
          "likeCommet Controller getCommentBy function: " + error.message
        );
      }
    },

    async getComment(req, res) {
      try {
        const userId = req.user.userId;
        const postId = req.body.postId;
        const comment = req.body.comment;

        const data = {
          post_id: postId,
          comment_by: userId,
          comments: comment,
        };

        const storeComment = "insert into post_comment set ?";

        const updateCommentCount =
          "update posts set comment_count = comment_count + 1 where id = ? ";

        const [result] = await connection.query(storeComment, data);
        await connection.query(updateCommentCount, [postId]);

        const lastComment =
          "select comment.id as comment_id,users.id,user.profile_image, user.first_name, user.last_name, user.username, comment.comments from post_comment comment inner join users_auth users on users.id = comment.comment_by inner join user_profiles user on users.id = user.user_id where comment.post_id = ?and comment.id = ?";

        const [lastCommentRes] = await connection.query(lastComment, [
          postId,
          result.insertId,
        ]);

        return res.status(200).json({
          status: 200,
          lastComment: lastCommentRes,
          logedUserId: req.user.userId,
        });
      } catch (error) {
        logger.error(
          "likeCommet Controller getComment function: " + error.message
        );
      }
    },

    async removeComment(req, res) {
      try {
        const id = req.body.commentId;
  
        const dltCommentquery = "update post_comment set deleted_at = current_timestamp where id = ?";
        
        const updateCommentCount = "update posts set comment_count = comment_count - 1 where id = ?"
        await connection.query(dltCommentquery, id);
        await connection.query(updateCommentCount, req.body.postId);
      } catch (error) {
        logger.error("home controller removeComment function: "+ error.message)
      }
    },
  };
};

module.exports = getUserInfo;
