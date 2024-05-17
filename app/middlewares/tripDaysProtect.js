const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const tripDaysProtect = async (req, res, next) => {
  try {
    if (!req.query.did || !/^\d+$/.test(req.query.did)) {
      return res.redirect("/displayTrip");
    }
    const result =await conn.query(`SELECT EXISTS(select id from trip_members where trip_id in (select trip_id from trip_days where id = ? and trip_days.deleted_at is null) and user_id = ? and deleted_at is NULL) as isexists`,[req.query.did,req.user.userId]);
          if(result[0][0].isexists == 1){
            next();
          } else {
            if(req.method == "POST" && req.path == "/deleteday"){
            return res.json({error:true})
            }
            if (req.method == "POST" && req.path == "/updateday") {
            return res.json({error:true})
            }
            return res.redirect("/displayTrip");
          }
  } catch (error) {
    logger.error("middleware tripDayProtect: "+error);
    return res.redirect("/displayTrip");
  }
};

module.exports = tripDaysProtect;
