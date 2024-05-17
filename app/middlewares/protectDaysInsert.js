const conn = require("../config/mysql_connection");
const daysInsert=async (req,res,next)=>{
    try{
        if(!req.params.tid){
             return res.redirect("/displayTrip");
        } 
        let result=await conn.query(`select count(*) as tid from trip_details where trip_id=? `,[req.params.tid]);
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

module.exports =daysInsert;