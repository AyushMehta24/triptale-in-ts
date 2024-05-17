const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const tripEventUpdateProtect = async (req, res, next) => {
  try {
    if (!req.query.tid || !/^\d+$/.test(req.query.tid)) {
      return res.redirect("back");
    }
    if (!req.query.eid || !/^\d+$/.test(req.query.eid)) {
      return res.redirect("back");
    }
    const result =await conn.query(`SELECT EXISTS(select id from trip_members where trip_id = (select trip_id from trip_events where id = ? and created_by = ? and deleted_at is null) and user_id = ? and deleted_at is null) as isexists`,[req.query.eid,req.user.userId,req.user.userId]);
          if(result[0][0].isexists == 1){
            next();
          } else {
            if (req.path == "/eventdelete") {
              return res.json({error:true})
            }
            return res.redirect("back");
          }
  } catch (error) {
    logger.error("middleware tripDayProtect: "+error);
    return res.redirect("/displayTrip");
  }
};

module.exports = tripEventUpdateProtect;
