const logger = require("../../config/logger");
const connection = require("../../config/mysql_connection");

const replyController = () => {
  return {
    async getReplyComment(req, res) {
      try {
        const replyData = {
          comment_id: req.body.CmtId,
          reply_comment: req.body.reply,
          reply_by: req.user.userId,
        };
  
        const replyQuery = "insert into comment_reply set ?";
  
        const [result] = await connection.query(replyQuery, replyData);
  
        const lastReply =
          "select reply.id as replyId,reply.comment_id, reply.reply_comment, user.profile_image, user.first_name, user.last_name from comment_reply reply inner join user_profiles user on reply.reply_by = user.user_id where reply.id = ?";
  
        const [lastReplyRes] = await connection.query(lastReply, result.insertId);
  
        res.status(200).json({ lastReply: lastReplyRes });
      } catch (error) {
        logger.error("replyCommentController getReplyComment function: " + error.message)
        res.render("components/error")
      }
    },

    async replyCommentDelete(req,res){
      try {
        const dltReplyComment = "update comment_reply set deleted_at = current_timestamp where id = ?";
  
        await connection.query(dltReplyComment, req.body.replyId);
      } catch (error) {
        logger.error("replyCommentCotroller replyCommentDelete function: "+ error.message);
        res.render("components/error");
      }
    }
  };
};

module.exports = replyController;
