const logger = require("../../config/logger");
const conn = require("../../config/mysql_connection");

const updatePostProtect = async (req, res, next) => {
  try {
    if (!req.query.id || !/^\d+$/.test(req.query.id)) {
      return res.redirect("/userProfile");
    }
    const result = await conn.query(
      `SELECT EXISTS(SELECT * FROM posts WHERE id = ? and user_id = ? and isdeleted is null) as isexists`,[req.query.id,req.user.userId]
    );
    if (result[0][0].isexists) {
      next();
    } else {
      return res.redirect("/*");
    }
  } catch (error) {
    logger.error("middleware updatePostProtect: "+error);
    return res.redirect("/userProfile");
  }
};

module.exports = updatePostProtect;
