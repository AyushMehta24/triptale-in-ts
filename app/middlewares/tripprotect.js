const conn = require("../config/mysql_connection");
const tripprotect=async (req,res,next)=>{
    try{
        if(!req.query.tid){
             return res.redirect("/displayTrip");
        } 
        const result=await conn.query(`select count(*) as tid from trip_details where trip_id=? AND (SELECT count(*) FROM trip_members WHERE trip_id=? and user_id=?)`,[req.query.tid,req.query.tid,req.user.userId]);
        if(result[0][0].tid>=1){
            next();
        }else{
            if(req.method == "POST"){
                return res.json({error:true})
            }
            return res.redirect('/displayTrip')
        }

    }
    catch(error){
        return res.redirect('/displayTrip')
    }
}
module.exports = tripprotect;
