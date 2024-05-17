const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const tripDetailsProtect = async (req, res, next) => {
  try {
    const tid = req.params.tid;
    const userId = req.user.userId;

    const numberRegex = /^\d+$/;
    if (!numberRegex.test(tid)) {
      return res.redirect("/urlNotFound");
    }

    const sql = `select trip_details.trip_id from trip_details join trip_members on trip_details.trip_id = trip_members.trip_id
    where trip_members.user_id = ? and trip_details.trip_id = ?
    and trip_details.deleted_at is null 
    and trip_members.deleted_at is null;`;
    const [result] = await conn.query(sql, [userId, tid]);
    if (result.length > 0) {
      next();
    } else {
      return res.redirect("/displaytrip");
    }
  } catch (error) {
    logger.error("middleware tripDetailsProtect: " + error);
  }
};

module.exports = tripDetailsProtect;
