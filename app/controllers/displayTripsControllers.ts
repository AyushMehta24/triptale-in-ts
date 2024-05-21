import { Request, Response } from "express";
import logger from "../config/logger";
import connection from "../config/mysql_connection";
import { UserId } from "../../index";
import {
  tripInfo,
  tripDetails,
  chatId,
  tripChat,
  usernameTrip,
  newChat,
} from "../../dto/displaytripcontrollerInterface";
import { QueryResult, ResultSetHeader } from "mysql2";

interface TripDetails {
  trip_id: number;
  title: string;
  discription: string;
}

interface TripDay {
  id: number;
  trip_id: number;
  title: string;
  dates: string;
  location: string;
  discription: string;
  image: string | null;
}

interface TripEvent {
  id: number;
  trip_id: number;
  title: string;
  discription: string;
  image: string | null;
  start_time: string;
  end_time: string;
  created_by: number;
}

interface TripChatMessage {
  message: string;
  username: string;
  user_id: number;
  created_at: Date;
}

interface TripController {
  getTrips(req: Request, res: Response): Promise<void>;
  tripDetails(req: Request, res: Response): Promise<void>;
  tripImages(req: Request, res: Response): Promise<void>;
  tripChatUI(req: Request, res: Response): Promise<void>;
  getTripChat(
    req: Request,
    res: Response
  ): Promise<Response<Record<string, string>> | undefined>;
  insertTripChat(
    req: Request,
    res: Response
  ): Promise<Response<Record<string, string>>>;
}

const allTrips: TripController = {
  async getTrips(req, res) {
    try {
      const userId = (req.user as UserId).userId;

      const sql =
        "SELECT trip_details.cover_image, trip_details.trip_id, trip_details.start_date, trip_details.title, trip_details.discription, trip_members.user_id FROM trip_members JOIN trip_details ON trip_details.trip_id = trip_members.trip_id WHERE trip_members.user_id = ? AND trip_members.deleted_at IS NULL AND trip_details.deleted_at IS NULL";
      const result: Array<tripInfo> = (await connection.query<QueryResult>(
        sql,
        userId
      )) as unknown as Array<tripInfo>;
      if (result.length === 0) {
        const message = "No Trips To Show...";
        const errorType = "NoTrips";
        return res.render("components/displayTrips/tripDataNull", {
          message,
          errorType,
        });
      }

      res.render("components/displayTrips/index", { data: result });
    } catch (error) {
      logger.error("displayTrip controller getTrips: " + error);
    }
  },

  async tripDetails(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const tripId = req.params.tid;

      const sql1 = `SELECT details.trip_id, days.id, details.title AS mainTitle, details.discription AS mainDiscription, days.title, days.dates, days.location, days.discription, (SELECT image FROM trip_images WHERE day_id = days.id and deleted_at is NULL ORDER BY id LIMIT 1) as image FROM trip_days AS days JOIN trip_details AS details ON details.trip_id = days.trip_id JOIN trip_members AS members ON days.trip_id = members.trip_id WHERE members.user_id = ? AND details.deleted_at is NULL AND days.trip_id = ? AND members.deleted_at is NULL AND days.deleted_at is NULL ORDER BY days.dates ;`;

      //event details

      let eventSql = `select trip_events.id, trip_events.trip_id, trip_events.title,trip_events.discription, trip_events.image, trip_events.start_time, trip_events.end_time, trip_events.created_by from trip_events join trip_members on trip_events.trip_id = trip_members.trip_id join trip_details on trip_events.trip_id = trip_details.trip_id where trip_members.user_id = ? and trip_events.trip_id = ? and trip_details.deleted_at is  null and trip_events.deleted_at is null;;`;

      let [eventDetails] = await connection.query(eventSql, [userId, tripId]);

      //event details

      const result1: Array<tripDetails> = (await connection.query(sql1, [
        userId,
        tripId,
      ])) as unknown as Array<tripDetails>;
      if (result1.length === 0) {
        const sql = `SELECT trip_details.trip_id, trip_details.title as mainTitle, trip_details.discription as mainDiscription FROM trip_details join trip_members on trip_details.trip_id = trip_members.trip_id WHERE trip_members.user_id = ? AND trip_details.deleted_at is NULL AND trip_details.trip_id = ? AND trip_members.deleted_at is NULL ;`;

        const [result] = await connection.query(sql, [userId, tripId]);

        const message = "No Data is Available";
        const errorType = "NoTripsData";
        return res.render("components/displayTrips/tripDetails", {
          data: result,
          message,
          errorType,
          tripId,
          eventDetails: eventDetails,
        });
      }
      for (let i = 0; i < result1.length; i++) {
        if (result1[i].image == undefined) {
          result1[i].image = `AddImage.png`;
        }
      }

      res.render("components/displayTrips/tripDetails", {
        data: result1,
        message: "",
        errorType: "",
        tripId,
        eventDetails: eventDetails,
      });
    } catch (error) {
      logger.error("displayTrip controller tripDetails: " + error);
    }
  },

  async tripImages(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const tripId = req.params.tid;
      const dayId = req.params.did;

      let sql = `select trip_images.image from trip_days join trip_images on trip_days.id = trip_images.day_id where trip_days.trip_id = ? and trip_images.day_id = ? and trip_images.deleted_at is NULL and trip_days.deleted_at is NULL and is_video = 0`;

      const [result] = await connection.query(sql, [tripId, dayId]);

      sql = `select trip_images.image from trip_days join trip_images on trip_days.id = trip_images.day_id where trip_days.trip_id = ? and trip_images.day_id = ? and trip_images.deleted_at is NULL and trip_days.deleted_at is NULL and is_video = 1`;

      const [videoData] = await connection.query(sql, [tripId, dayId]);

      res.render("components/displayTrips/dayWiseImages", {
        data: result,
        video: videoData,
        userId: userId,
        tid: tripId,
        did: dayId,
      });
    } catch (error) {
      logger.error("displayTrip controller tripImages: " + error);
    }
  },

  async tripChatUI(req, res) {
    try {
      if (!/^\d+$/.test(req.params.tid)) {
        return res.redirect("/displaytrip");
      }
      let result: Array<chatId> = (await connection.query(
        `select id from trip_members where trip_id = ? and user_id = ? and deleted_at is NULL`,
        [req.params.tid, (req.user as UserId).userId]
      )) as unknown as Array<chatId>;

      if (result.length === 1) {
        return res.render("components/displayTrips/tripChat");
      } else {
        return res.redirect("/displaytrip");
      }
    } catch (error) {
      logger.error("displayTrip controller tripChatUI: " + error);
    }
  },

  async getTripChat(req, res) {
    try {
      let result: Array<Array<newChat>> = (await connection.query<QueryResult>(
        `select tc.message,u.username,u.user_id,tc.created_at from trip_chats as tc left join user_profiles as u on tc.user_id = u.user_id   where tc.trip_id = ?`,
        [req.body.tripId]
      )) as unknown as Array<Array<newChat>>;
      let userName: Array<usernameTrip> = (await connection.query<QueryResult>(
        `select username from user_profiles where user_id = ?`,
        [(req.user as UserId).userId]
      )) as unknown as Array<usernameTrip>;
      let offset = new Date().getTimezoneOffset();
      result[0].forEach((ele) => {
        ele.created_at = new Date(ele.created_at.toString()).getTime();
        ele.created_at -= offset * 60 * 1000;
        ele.created_at = new Date(ele.created_at);
      });
      return res.status(200).json({
        result: result[0],
        userId: (req.user as UserId).userId,
        userName: userName[0].username,
      });
    } catch (error) {
      logger.error("displayTrip controller getTripChat: " + error);
    }
  },

  async insertTripChat(req, res) {
    try {
      let { tripId, user, message } = req.body;
      let chat = {
        trip_id: tripId,
        user_id: user,
        message: message,
      };
      let result = await connection.query<ResultSetHeader>(
        `insert into trip_chats SET ?`,
        chat
      );

      if (result[0].affectedRows == 1) {
        return res.json({ success: true });
      } else {
        return res.status(200).json({ success: false });
      }
    } catch (error) {
      logger.error("displayTrip controller insertTripChat: " + error);
      return res.status(200).json({ success: false });
    }
  },
};

export default allTrips;
