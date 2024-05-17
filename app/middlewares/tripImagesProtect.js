const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const tripImagesProtect = async (req, res, next) => {
  try {
    const tid = req.params.tid;
    const did = req.params.did;
    const userId = req.user.userId;
    const sql = `select * from trip_days join trip_members on trip_members.trip_id  = trip_days.trip_id where trip_days.id = ? and trip_members.user_id = ? and  trip_days.deleted_at is null;
    `;
    const [result] = await conn.query(sql, [did,userId]);
    if (result.length > 0) {
      next();
    } else {
      return res.redirect("/displaytrip");
    }
  } catch (error) {
    logger.error("middleware tripImageProtect: "+error);
  }
};

module.exports = tripImagesProtect;
