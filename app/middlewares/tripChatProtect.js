const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const tripChatProtect = async (req, res, next) => {
  try {
    let result = await conn.query(
      `select id from trip_members where trip_id = ? and user_id = ? and deleted_at is NULL`,[req.body.tripId,req.user.userId]
    );

    if (result[0].length == 1) {
      next();
    } else {
      return res.json({ error: "You have no access" });
    }
  } catch (error) {
    logger.error("middleware tripchatProtect: "+error);
    return res.json({ error: "Something went wrong" });
  }
};

module.exports = tripChatProtect;
