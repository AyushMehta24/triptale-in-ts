
import conn from "../../config/mysql_connection"
export async function firstTimeLogin(req, res, next) {
    let result = await conn.query(
        `select * from user_profiles where user_id = ?`
      ,[req.user.userId]);

      if(result[0].length==0){
        next()
      }else{
        res.redirect('/home');
      }
}


export async function checkIsProfileFill(req, res, next) {
  let result = await conn.query(
      `select * from user_profiles where user_id = ?`
    ,[req.user.userId]);

    if(result[0].length==0){
      res.redirect('/profile');
    }else{
      next()
     
    }
}
