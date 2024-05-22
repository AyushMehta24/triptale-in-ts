const JwtStrategy = require("passport-jwt").Strategy;
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import conn from "../config/mysql_connection";
import { QueryResult } from "mysql2";
// import { Strategy as Jwt } from "passport";

interface userAuthDetails {
  id: number;
  email: string;
  password: string;
  salt: string;
  status: string;
  active_pin: string;
  create_at: string;
  pass_update_at: string;
}

const cookieExtractor = function (req: Request) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

const passportFunc = () => {
  let opts = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: "welcome",
  };

  passport.use(
    new JwtStrategy(opts, async function (
      jwt_payload: JwtPayload,
      done: Function
    ) {
      try {
        let [result]: Array<Array<userAuthDetails>> = await conn.query<QueryResult>(
          `select * from users_auth where id = '${jwt_payload.userId}'`
        ) as unknown as Array<Array<userAuthDetails>>;
        console.log(result);
        if (result.length >= 1) {
          if (result[0].status === "Active") {
            return done(null, jwt_payload);
          } else {
            return done(null, false);
          }
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export default passportFunc;
