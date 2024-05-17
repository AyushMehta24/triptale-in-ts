const conn = require("../../config/mysql_connection");
const homeController = require("../../controllers/homeControllers/homeController");

async function firstTimeLogin(req, res, next) {
    let result = await conn.query(
        `select * from user_profiles where user_id = ?`
      ,[req.user.userId]);

      if(result[0].length==0){
        next()
      }else{
        res.redirect('/home');
      }
}


async function checkIsProfileFill(req, res, next) {
  let result = await conn.query(
      `select * from user_profiles where user_id = ?`
    ,[req.user.userId]);

    if(result[0].length==0){
      res.redirect('/profile');
    }else{
      next()
     
    }
}
module.exports = {firstTimeLogin,checkIsProfileFill};