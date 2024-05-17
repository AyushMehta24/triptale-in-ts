const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generate_unique_id = require("generate-unique-id");

const authController = () => {
  return {
    getLoginForm(req, res) {
      res.render("components/auth/login", { layout: "layouts/loginRegister" });
    },
    getRegisterForm(req, res) {
      res.render("components/auth/register", {
        layout: "layouts/loginRegister",
      });
    },
    async registerUser(req, res) {
      try {
        const salt = generate_unique_id({ length: 4 });
        const activation_key = generate_unique_id({ length: 12 });

        let result = await conn.query(
          `select id,status,active_pin from users_auth where email = ?`,
          [req.body.email]
        );
        if (result[0].length >= 1) {
          if (result[0][0].status === "inActive") {
            let update = await conn.query(
              `update users_auth set created_at = CURRENT_TIMESTAMP  where email = ?`,
              [req.body.email]
            );
            return res.send({
              success: true,
              alert:
                "You are Already Registered But Your Account is InActive Click Below link for Activate",
              activationLink: `http://${req.hostname}:${process.env.PORT}/activateuser?email=${req.body.email}&activationKey=${result[0][0].active_pin}`,
            });
          }
          return res.send({
            success: false,
            alert: "Already User Exists with This email Try another one",
          });
        } else {
          let detail = {
            email: req.body.email.trim(),
            password: await bcrypt.hash(req.body.password.trim() + salt, 10),
            salt: salt,
            status: "inActive",
            active_pin: activation_key,
          };
          result = await conn.query("insert into users_auth SET ?", detail);
          if (result[0].affectedRows ) {
            return res.send({
              success: true,
              alert: "Click Below Link for Activate Your account",
              activationLink: `http://${req.hostname}:${process.env.PORT}/activateuser?email=${req.body.email}&activationKey=${activation_key}`,
            });
          } else {
            return res.send({
              success: false,
              alert: "Something Went Wrong Try Again",
            });
          }
        }
      } catch (error) {
        logger.error("Auth controller registerUser: "+error);
        return res.send({
          success: false,
          alert: "Something Went Wrong Try Again",
        });
      }
    },  
    async activeUser(req, res) {
      try {
        let email = req.query.email;
        let activation_key = req.query.activationKey;
        let result = await conn.query(
          `select active_pin,created_at from users_auth where email = ?`,
          [email]
        );
        if (result[0].length >= 1) {
          if (activation_key == result[0][0].active_pin) {
            let datetime = new Date(result[0][0].created_at);
            let curdate = new Date();
            let diff = curdate - datetime;
            diff = parseInt(diff / (1000 * 60));

            if (diff < 120) {
              let active = await conn.query(
                `update users_auth set status = "Active" where email = ?`,
                [email]
              );
              if (active[0].affectedRows >= 1) {
                return res.send(
                  "Your Account is Activated. You Can Login Now "
                );
              } else {
                return res.send("Something Went Wrong Try Again");
              }
            } else {
              let del = await conn.query(
                `delete from users_auth where email = ?`,
                [email]
              );
              return res.send("Activation Link Expires Register Again");
            }
          } else {
            return res.send("Something Wrong in Activation Link!!!");
          }
        } else {
          return res.send("Something Wrong in Activation Link!!!");
        }
      } catch (error) {
        logger.error("Auth Controller activeuser: "+error);
        return res.redirect("/error")
      }
    },
    async loginUser(req, res) {
      try {
        let result = await conn.query(
          `select id,status,password,salt from users_auth where email = ?`,
          [req.body.email]
        );

        if (result[0].length >= 1) {
          if (result[0][0].status === "Active") {
            if (
              await bcrypt.compare(
                req.body.password.trim() + result[0][0].salt,
                result[0][0].password
              )
            ) {
              const token = jwt.sign(
                { userId: result[0][0].id },
                process.env.SECRET_KEY
              );
              const logDetails = {
                user_email: req.body.email,
                password: await bcrypt.hash(req.body.password.trim(), 10),
                islogged: 1,
                ipAddress:req.socket.remoteAddress
              };
              try {
                let result = await conn.query(
                  `INSERT INTO user_login_logs SET ?`,
                  logDetails
                );
              } catch (error) {
                logger.error(error);
              }

              res.cookie("token", token, { maxAge: 10000 * 1000 });
              return res.send({
                success: true,
                alert: "You are logged in Now",
              });
            } else {
              const logDetails = {
                user_email: req.body.email,
                password: await bcrypt.hash(req.body.password.trim(), 10),
                islogged: 0,
                ipAddress:req.socket.remoteAddress
              };
              try {
                let result = await conn.query(
                  `INSERT INTO user_login_logs SET ?`,
                  logDetails
                );
              } catch (error) {
                logger.error(error);
              }
              return res.send({
                success: false,
                alert: "Wrong Credential Try Again",
              });
            }
          } else {
            return res.send({
              success: false,
              alert: "Your Account is now InActive register again",
            });
          }
        } else {
          return res.send({
            success: false,
            alert: "Wrong Credential Try Again",
          });
        }
      } catch (error) {
        logger.error("Auth controller loginUser: "+error);
        return res.send({
          success: false,
          alert: "Something went Wrong Try Again",
        });
      }
    },
    getForm(req, res) {
      res.render("components/auth/forgotPass", {
        layout: "layouts/loginRegister.ejs",
      });
    },
    async getUpdatePassForm(req, res) {
      try {
        const email = req.query.email;
        const activation_key = req.query.activationKey;
        let result = await conn.query(
          `select active_pin,pass_updated_at from users_auth where email = ?`,
          [email]
        );
        if (result[0].length >= 1) {
          if (activation_key == result[0][0].active_pin) {
            const datetime = new Date(result[0][0].pass_updated_at);
            const curdate = new Date();
            let diff = curdate - datetime;
            diff = parseInt(diff / (1000 * 60));

            if (diff < 3) {
              res.render("components/auth/forgotPassInputs", {
                layout: "layouts/forgotPassword.ejs",
              });
            } else {
              return res.send("Link Expired Generate Again");
            }
          } else {
            return res.send("Something Wrong in This Link!!!");
          }
        } else {
          return res.send("Something Wrong in This Link!!!");
        }
      } catch (error) {
        logger.error("Auth Controller getUpdatePassForm: "+error);
        return res.send("Something Went Wrong Try Again...");
      }
    },
    async forgotForm(req, res) {
      try {
        let result = await conn.query(
          `select status,active_pin from users_auth where email = ?`,
          [req.body.email]
        );
        if (result[0].length >= 1) {
          if (result[0][0].status === "Active") {
            let update = await conn.query(
              `update users_auth SET pass_updated_at = CURRENT_TIMESTAMP where email = ?`,
              [req.body.email]
            );

            return res.send({
              success: true,
              alert: "Click Below Link for Change Your account Password",
              forgotPassLink: `http://${req.hostname}:${process.env.PORT}/changepassword?email=${req.body.email}&activationKey=${result[0][0].active_pin}`,
            });
          } else {
            return res.send({
              success: false,
              alert: "Your Account is now InActive register again",
            });
          }
        } else {
          return res.send({
            success: false,
            alert: "Wrong Credential Try Again",
          });
        }
      } catch (error) {
        logger.error("Auth Controller forgotForm: "+error);
        return res.redirect("/error")
      }
    },
    async UpdatePass(req, res) {
      try {
            let result = await conn.query(
              `select pass_updated_at from users_auth where email = ?`,
              [req.body.email]
            );
            const datetime = new Date(result[0][0].pass_updated_at);
            const curdate = new Date();
            let diff = curdate - datetime;
            diff = parseInt(diff / (1000 * 60));

            if (diff < 3) {
              const salt = generate_unique_id({ length: 4 });
              const detail = {
                password: await bcrypt.hash(
                  req.body.password.trim() + salt,
                  10
                ),
                salt: salt,
              };
              let update = await conn.query(
                `update  users_auth SET ? where email = '${req.body.email}'`,
                detail
              );
              if (update[0].affectedRows) {
                return res.send({
                  success: true,
                  alert: "Your Password Has Been Changed you can Login Now",
                });
              }
            } else {
              return res.send({
                success: false,
                alert: "Change Password Session Expired",
                redirect: true,
              });
            }
      } catch (error) {
        logger.error("Auth Controller updatePass: "+error);
        return res.send({
          success: false,
          alert: "Something Went Wrong Try Again",
        });
      }
    },
    async InsertProfile(req, res) {
      let profile_name = "";
      if (req.file == undefined) {
        profile_name = "/profile/avatar.png";
      } else {
        profile_name = `/profile/${req.user.userId}/${req.file.filename}`;
      }

      let details = {
        user_id: req.user.userId,
        first_name: req.body.first_name.trim(),
        last_name: req.body.last_name.trim(),
        username: req.body.username.trim(),
        user_bio: req.body.user_bio.trim(),
        user_dob: req.body.user_dob.trim(),
        city_id: req.body.city_id,
        profile_image: profile_name,
        gender: req.body.gender.trim(),
      };

      try {
        let insert = await conn.query(
          `INSERT INTO user_profiles SET ?;`,
          details
        );

        let interests=req.body.userInterests || []

        interests?.map(async(item)=>{
          let object={
            user_id:req.user.userId,
            interests:item
          }
          let insert = await conn.query(
            `INSERT INTO user_interests SET ?;`,
            object
          );
        })

        if (insert.insertId != "") {
          return res.redirect("/home");
        }
      } catch (err) {
        logger.error("authController InsertProfile function: ",err);
        res.redirect('/error')
      }
    },
    async UpdateProfile(req, res) {
     
      let profile_name = "";
      if (req.file == undefined) {
        profile_name = req.body.filename;
      } else {
        profile_name = `/profile/${req.user.userId}/${req.file.filename}`;
        
      }
console.log(req.body.gender);
      try {
        let update = await conn.query(
          `UPDATE user_profiles SET first_name = ?,last_name = ?,user_bio =?,user_dob = ?,city_id =?,profile_image =?,gender=? WHERE user_id = ?`,
          [
            req.body.first_name.trim(),
            req.body.last_name.trim(),
            req.body.user_bio.trim(),
            req.body.user_dob.trim(),
            req.body.city_id.trim(),
            profile_name,
            req.body.gender,
            req.user.userId
          ]
        );

        if (update[0] != "") {
          res.redirect("/userProfile");
        } else {
          res.redirect("/getProfile");
        }
      } catch (error) {
        logger.error("authController UpdateProfile function: ",error);
        res.redirect('/error')
      }
    },
    async GetProfile(req, res) {
      try {
        let getProfile = await conn.query(
          `SELECT * FROM user_profiles join users_auth on user_profiles.user_id=users_auth.id  where user_profiles.user_id=?;`,
          [req.user.userId]
        );
        if (getProfile[0].length != 0) {
          res.render("components/auth/profileDetails", {
            layout: "layouts/bioProfile",
            type: "update",
            result: getProfile[0],
          });
        } else {
          res.redirect("/pagenotfound");
        }
      } catch (error) {
        logger.error("authController GetProfile function: ",error);
        res.redirect('/error')
      }
    },
    GetResetPasswordForm(req, res) {
      return res.render("components/auth/changePassword");
    },
    async resetPassword(req, res) {
      try {
            let result = await conn.query(
              `select salt,password from users_auth where id = ?`,
              [req.user.userId]
            );
            if (
              await bcrypt.compare(
                req.body.CurrentPassword.trim() + result[0][0].salt,
                result[0][0].password
              )
            ) {
              const salt = generate_unique_id({ length: 4 });
              const detail = {
                password: await bcrypt.hash(
                  req.body.password.trim() + salt,
                  10
                ),
                salt: salt,
              };
              let update = await conn.query(
                `update  users_auth SET ? where id = '${req.user.userId}'`,
                detail
              );
              if (update[0].affectedRows){
                return res.send({
                  success: true,
                  alert: "Your Password Has Been Changed",
                });
              }
            } else {
              return res.send({
                success: false,
                alert: "Wrong Current Password",
              });
            }
      } catch (error) {
        logger.log("Auth Controller resetPassword: "+error);
        return res.send({
          success: false,
          alert: "Something Went Wrong Try Again",
        });
      }
    },
  };
};

module.exports = authController;
