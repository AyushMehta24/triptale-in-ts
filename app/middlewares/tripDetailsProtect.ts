import { NextFunction, Request, Response } from "express";
const logger = require("../config/logger");
const conn = require("../config/mysql_connection");
import { UserId } from "../../index";

const tripDetailsProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tid = req.params.tid;
    const userId = (req.user as UserId).userId;

    // Check if tid is a valid number
    const numberRegex = /^\d+$/;
    if (!numberRegex.test(tid)) {
      return res.redirect("/urlNotFound");
    }

    // SQL query to check if the user has access to the trip
    const sql = `
      SELECT trip_details.trip_id 
      FROM trip_details 
      JOIN trip_members ON trip_details.trip_id = trip_members.trip_id
      WHERE trip_members.user_id = ? 
        AND trip_details.trip_id = ?
        AND trip_details.deleted_at IS NULL 
        AND trip_members.deleted_at IS NULL;
    `;

    // Execute the query
    const [result] = await conn.query(sql, [userId, tid]);

    // If the user has access, call the next middleware
    if (result.length > 0) {
      next();
    } else {
      // If the user doesn't have access, redirect to an appropriate page
      return res.redirect("/displaytrip");
    }
  } catch (error) {
    // Log any errors that occur during the execution of the middleware
    logger.error("middleware tripDetailsProtect: " + error);
    // Pass the error to the error handling middleware or send an error response
    res.status(500).send("Internal Server Error");
  }
};

module.exports = tripDetailsProtect;