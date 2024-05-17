const conn = require("../config/mysql_connection");
const logger = require("../config/logger");

const comboController = () => {
  return {
    async countries(req, res) {
      try {
        let result = await conn.query(`SELECT * FROM countries;`);
        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController countries function: ",error);
        res.redirect('/error')
      }
    },
    async states(req, res) {
      try {
        let result = await conn.query(
          `SELECT * FROM states where country_id=?`,
          [req.body.id]
        );

        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController states function: ",error);
        res.redirect('/error')
      }
    },
    async cities(req, res) {
      try {
        let result = await conn.query(
          `SELECT * FROM cities WHERE state_id = ?`,
          [req.body.id]
        );

        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController cities function: ",error);
        res.redirect('/error')
      }
    },
    async checkUsername(req, res) {
      try {
        let result = await conn.query(
          `SELECT * FROM user_profiles where username=?`,
          [req.body.username]
        );
        if (result[0].length == 0) {
          res.json({ isExists: false });
        } else {
          res.json({ isExists: true, userId: result[0][0].user_id });
        }
      } catch (error) {
        logger.error("comboController checkUsername function: ",error);
        res.redirect('/error')
      }
    },

   
  };
};

module.exports = comboController;
