import { Request, Response } from "express";
import conn from "../config/mysql_connection";
import logger from "../config/logger";
import { QueryResult } from "mysql2";
import { combo } from "../../dto/combocontrollerInterface";

interface ComboController {
  countries(req: Request, res: Response): Promise<void>;
  states(req: Request, res: Response): Promise<void>;
  cities(req: Request, res: Response): Promise<void>;
  checkUsername(req: Request, res: Response): Promise<void>;
}

const comboController: () => ComboController = () => {
  return {
    async countries(req: Request, res: Response) {
      try {
        let result = await conn.query(`SELECT * FROM countries;`);
        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController countries function: ", error);
        res.redirect("/error");
      }
    },

    async states(req: Request, res: Response) {
      try {
        let result = await conn.query(
          `SELECT * FROM states where country_id=?`,
          [req.body.id]
        );

        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController states function: ", error);
        res.redirect("/error");
      }
    },

    async cities(req: Request, res: Response) {
      try {
        let result = await conn.query(
          `SELECT * FROM cities WHERE state_id = ?`,
          [req.body.id]
        );

        res.json({ result: result[0] });
      } catch (error) {
        logger.error("comboController cities function: ", error);
        res.redirect("/error");
      }
    },

    async checkUsername(req: Request, res: Response) {
      try {
        let result:Array<Array<combo>>  = await conn.query<QueryResult>(
          `SELECT * FROM user_profiles where username=?`,
          [req.body.username]
        ) as unknown as Array<Array<combo>>;

        if (result[0].length == 0) {
          res.json({ isExists: false });
        } else {
          res.json({ isExists: true, userId: result[0][0].user_id });
        }
      } catch (error) {
        logger.error("comboController checkUsername function: ", error);
        res.redirect("/error");
      }
    },
  };
};
