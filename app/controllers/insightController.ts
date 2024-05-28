import { Request, Response } from "express";
import conn from "../config/mysql_connection";
import logger from "../config/logger";
import { UserId } from "../../index";
import { insightDetail } from "../../dto/insightControllerInterface";
import { QueryResult } from "mysql2";
import { dataSet } from "../../dto/commonInterface";

interface InsightController {
  insightDashbord(req: Request, res: Response): Promise<void>;
  fetchUsernameLike(req: Request, res: Response): Promise<void>;
  fetchUsernameComments(req: Request, res: Response): Promise<void>;
  tripInsight(req: Request, res: Response): Promise<void>;
  tripMembers(req: Request, res: Response): Promise<void>;
}

const insightController: InsightController = {
  async insightDashbord(req, res) {
    try {
      const insightDashbord: dataSet = (await conn.query(
        `SELECT like_count,comment_count FROM posts where user_id=? and id=? and isdeleted is null;`,
        [(req.user as UserId).userId, req.params.id]
      )) ;

      const insightInfo: insightDetail[] = insightDashbord[0] as insightDetail[];

      if (insightInfo.length !== 0) {
        const insightPost:dataSet = await conn.query(
          `SELECT * FROM posts join post_images on posts.id=post_images.post_id  where posts.id=? and isdeleted is null limit 1 ;`,
          [req.params.id]
        );

        res.render("components/insight/insightful", {
          insightPost: insightPost[0],/////////////////////////// doubt /////////////////////
          insightDashbord: insightInfo[0],
          type: "",
          id: req.params.id,
        });
      } else {
        res.redirect("/");
      }
    } catch (error) {
      logger.error("insightController insightDashbord function: ", error);
      res.redirect("/error");
    }
  },

  async fetchUsernameLike(req, res) {
    try {
      const fetchUsernameLike:dataSet = await conn.query(
        `SELECT username, profile_image, concat(first_name, " ", last_name) as name FROM post_likes inner join user_profiles where post_likes.liked_by=user_profiles.user_id  and post_likes.post_id = ? and post_likes.isdeleted is null;`,
        [req.body.postId]
      );

      res.json({ result: fetchUsernameLike[0] });
    } catch (error) {
      logger.error("insightController fetchUsernameLike function: ", error);
      res.redirect("/error");
    }
  },

  async fetchUsernameComments(req, res) {
    try {
      const fetchUsernameComments:dataSet = await conn.query(
        `SELECT username, comments, profile_image, concat(first_name, " ", last_name) as name FROM post_comment inner join user_profiles where post_comment.comment_by=user_profiles.user_id  and post_comment.post_id =? and post_comment.deleted_at is null;`,
        [req.body.postId]
      );

      res.json({ result: fetchUsernameComments[0] });
    } catch (error) {
      logger.error("insightController fetchUsernameComments function: ", error);
      res.redirect("/error");
    }
  },

  async tripInsight(req, res) {
    try {
      const [
        tripInsight,
        tripDayInsight,
        totaldays,
        totalevents,
        totalmembers,
        totalimage,
      ]:[dataSet,dataSet,dataSet,dataSet,dataSet,dataSet]= await Promise.all([
        conn.query<QueryResult>(`SELECT * FROM trip_details where trip_id=?`, [
          req.params.id,
        ]),
        conn.query<QueryResult>(
          `SELECT * FROM trip_details inner join trip_days on trip_details.trip_id=trip_days.trip_id  where trip_details.trip_id=1 ;`,
          [req.params.tripId]
        ),
        conn.query<QueryResult>(
          `SELECT count(*)as totaldays FROM trip_days where trip_id=?`,
          [req.params.id]
        ),
        conn.query<QueryResult>(
          `SELECT count(*) as totalevents FROM trip_events where trip_id=? and deleted_at is null`,
          [req.params.id]
        ),
        conn.query<QueryResult>(
          `SELECT count(*) AS totalmembers FROM trip_members where trip_id=? and deleted_at is null`,
          [req.params.id]
        ),
        conn.query<QueryResult>(
          `SELECT count(*) as totalimage from trip_days join trip_images on trip_days.id = trip_images.day_id where trip_days.trip_id = ? and trip_images.deleted_at is null`,
          [req.params.id]
        ),
      ]);

      res.render("components/insight/insightful", {
        id: req.params.id,
        tripInsight: tripInsight[0],
        totaldays: totaldays[0],
        totalevents: totalevents[0],
        totalmembers: totalmembers[0],
        totalimage: totalimage[0],
        type: "trip",
      });
    } catch (error) {
      logger.error("insightController tripInsight function: ", error);
      res.redirect("/error");
    }
  },

  async tripMembers(req, res) {
    try {
      const tripMembers:dataSet = await conn.query(
        `SELECT profile_image, concat(first_name, "", last_name) as name, username FROM trip_members join user_profiles on trip_members.user_id=user_profiles.user_id where trip_id=? and deleted_at is null;`,
        [req.body.postId]
      );

      res.json({ result: tripMembers[0] });
    } catch (error) {
      logger.error("insightController tripMembers function: ", error);
      res.redirect("/error");
    }
  },
};

export default insightController;
