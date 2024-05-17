
const logger = require("../../config/logger");
const conn = require("../../config/mysql_connection");

async function tripeventValidation(req, res, next) {
  try {
    let error = true
    let { title, description, start_time, end_time,image } = req.body;
    const validate_date = (date) => {
      let dateRegx = /^(000[1-9]|00[1-9]\d|0[1-9]\d\d|100\d|10[1-9]\d|1[1-9]\d{2}|[2-9]\d{3}|[1-9]\d{4}|1\d{5}|2[0-6]\d{4}|27[0-4]\d{3}|275[0-6]\d{2}|2757[0-5]\d|275760)-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])T(0\d|1\d|2[0-4]):(0\d|[1-5]\d)(?::(0\d|[1-5]\d))?(?:.(00\d|0[1-9]\d|[1-9]\d{2}))?$/gm
      if (!dateRegx.test(date)) {
        error = false
        return false;
      }
      return true;
    };

    
    if (req.file == undefined && req.path != "/eventupdate" ) {
      return res.send("Please Enable Javascript or use another browser")
    }
    if ( title.trim() == "" || description.trim() == "" || start_time == "" || end_time == "" ) {
      error = false;
      return res.send("All Field  required")
    }

    if (error) {
      if (!validate_date(start_time) || !validate_date(end_time)) {
        return res.send("Enter Start date and End date in valid format")
      } 
    }

    let findTripData = `SELECT start_date ,end_date FROM trip_details where trip_id = ?`;
    let tripId = req.params.tid || req.query.tid
    let [data] = await conn.query(findTripData, [tripId]);

   
      let startTrip = new Date(data[0].start_date)
      let endTrip = new Date(data[0].end_date)
      endTrip.setDate(endTrip.getDate()+1);
      let startEvent = new Date(start_time); 
      let endEvent =new Date(end_time);
     
      if (startEvent<startTrip) {
        return res.send(`* Select DateTime between ${startTrip.toLocaleDateString()} And ${endTrip.toLocaleDateString()}`)
      }else{
        if (startEvent>endEvent) {
        return res.send("* event end time should be after start time")
      }
      } 
      if (endEvent>endTrip) {
        return res.send(`* Select DateTime between ${startTrip.toLocaleDateString()} And ${endTrip.toLocaleDateString()}`)
      }else{
        if (startEvent>endEvent) {
       return res.send("* event end time should be after start time")
      }
      }

   next()
  } catch (e) {
    logger.error("validation middleware tripevent: " + e.message)
  }
}

module.exports = tripeventValidation;
