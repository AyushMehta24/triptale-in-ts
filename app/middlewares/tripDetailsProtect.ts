import { NextFunction, Request, Response } from "express";
import { UserId } from "../../index";
import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { QueryResult } from "mysql2";
import { dataSet } from "../../dto/commonInterface";
const tripDetailsProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tid:string = req.params.tid;
    const userId:string = (req.user as UserId).userId;

    // Check if tid is a valid number
    const numberRegex:RegExp = /^\d+$/;
    if (!numberRegex.test(tid)) {
      return res.redirect("/urlNotFound");
    }

    // SQL query to check if the user has access to the trip
    const sql:string = `
      SELECT trip_details.trip_id 
      FROM trip_details 
      JOIN trip_members ON trip_details.trip_id = trip_members.trip_id
      WHERE trip_members.user_id = ? 
        AND trip_details.trip_id = ?
        AND trip_details.deleted_at IS NULL 
        AND trip_members.deleted_at IS NULL;
    `;

    // Execute the query
    const result:dataSet = await conn.query(sql, [userId, tid]) 

    const resultInfo: {trip_id:string}[] =
    result[0] as {trip_id:string}[];

    // If the user has access, call the next middleware
    if (resultInfo.length > 0) {
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

export default tripDetailsProtect;
