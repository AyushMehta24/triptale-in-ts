const JwtStrategy = require("passport-jwt").Strategy;
const conn = require("../config/mysql_connection");

const cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

const passport = (passport) => {
       opts = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.SECRET_KEY,
  };
  
  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let result = await conn.query(
          `select * from users_auth where id = '${jwt_payload.userId}'`
        );
        if (result[0].length >= 1) {
          if (result[0][0].status === "Active") {
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

module.exports = passport;
