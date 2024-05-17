const conn = require("../config/mysql_connection");
const triInsight=async (req,res,next)=>{
    try{
        if(!req.params.id){
             return res.redirect("/");
        } 
        const result=await conn.query(`SELECT count(*) as tid FROM trip_members where trip_id=? and user_id=?;`,[req.params.id,req.user.userId]);
        if(result[0][0].tid>=1){
            next();
        }else{
            return res.redirect('/')
        }

    }
    catch(error){
        return res.redirect('/')
    }
}
module.exports = triInsight;
