import { Request, Response } from "express";
import logger from "../config/logger";
import conn from "../config/mysql_connection";
import { UserId } from "../../index";
import { QueryResult, ResultSetHeader } from "mysql2";
import {
  notificationUser,
  accumalator,
  multiPostItem,
  notificationType,
  postData,postimages,
} from "../../dto/notificationControllerInterface";
import { UnknownConstraintError } from "sequelize";

interface NotificationController {
  postUserId(req: Request, res: Response): Promise<void>;
  getNotification(req: Request, res: Response): Promise<void>;
  getCommentReplyNotification(req: Request, res: Response): Promise<void>;
}

const notificationController: NotificationController = {
  async postUserId(req, res) {
    try {
      const result: Array<notificationUser> = (await conn.query<QueryResult>(
        `SELECT user_id FROM posts where id=?`,
        [req.body.postId]
      )) as unknown as Array<notificationUser>;

      const resultUserProfile = await conn.query(
        `SELECT post_images.isvideo, username, post_images.image, profile_image, first_name, last_name FROM post_likes INNER JOIN user_profiles ON post_likes.liked_by = user_profiles.user_id JOIN post_images ON post_images.post_id = post_likes.post_id WHERE post_likes.post_id = ?`,
        [req.body.postId]
      );

      const object = {
        post_id: req.body.postId.trim(),
        like_by: (req.user as UserId).userId,
        user_id: result[0].user_id,
        content: req.body.content.trim(),
      };

      if (result[0].user_id !== Number((req.user as UserId).userId)) {
        const insertNotification: Array<ResultSetHeader> =
          (await conn.query<QueryResult>(
            `INSERT INTO notification SET ?`,
            object
          )) as unknown as Array<ResultSetHeader>;

        if (insertNotification.length !== 0) {
          res.json({
            result: result[0].user_id,
            userDetail: resultUserProfile[0],
            sourceId: (req.user as UserId).userId,
          });
        }
      }
    } catch (error) {
      logger.error("notificationController postUserId function: ", error);
      res.redirect("/error");
    }
  },

  async getNotification(req, res) {
    try {
      const resultPost:Array<multiPostItem> = await conn.query<QueryResult>(
        `SELECT notification.id, notification.create_at, isvideo, notification.like_by, notification.user_id, notification.post_id, notification.content, post_images.image, username, profile_image, first_name, last_name FROM notification INNER JOIN user_profiles ON notification.like_by = user_profiles.user_id JOIN post_images ON post_images.post_id = notification.post_id WHERE notification.user_id = ? ORDER BY notification.id DESC`,
        [(req.user as UserId).userId]
      ) as unknown as Array<multiPostItem>;

      const multiTagePosts = resultPost.reduce((acc: accumalator,item:multiPostItem ) => {
          acc[item.id] ??= {
            like_by: item.like_by,
            user_id: item.user_id,
            post_id: [],
            content: item.content,
            image: item.image,
            username: item.username,
            profile_image: item.profile_image,
            first_name: item.first_name,
            last_name: item.last_name,
            create_at: item.create_at,
            isvideo: item.isvideo,
          };

          acc[item.id].post_id.push(item.post_id);
          return acc;
        },
        {}
      );

      const resultTrip = await conn.query(
        `SELECT notification_trip.create_at, notification_trip.create_user_id, notification_trip.create_user_id, username, profile_image, CONCAT(first_name, " ", last_name) AS name, trip_details.cover_image FROM notification_trip INNER JOIN user_profiles ON notification_trip.create_user_id = user_profiles.user_id INNER JOIN trip_details ON notification_trip.trip_id = trip_details.trip_id WHERE notification_trip.add_user_id = ? ORDER BY notification_trip.id DESC`,
        [(req.user as UserId).userId]
      );

      res.render("components/notification/notification", {
        userId: (req.user as UserId).userId,
        resultPost: multiTagePosts,
        resultTrip: resultTrip[0],
      });
    } catch (error) {
      logger.error("notificationController getNotification function: ", error);
      res.redirect("/error");
    }
  },

  async getCommentReplyNotification(req, res) {
    try {
      const getCommentReplyNotification:Array<postData> = await conn.query(
        `SELECT * FROM post_comment WHERE id=?;`,
        [req.body.comment_id]
      )as unknown as Array<postData>;

      const resultUserProfile:Array<postimages> = await conn.query<QueryResult>(
        `SELECT * FROM post_images JOIN user_profiles WHERE post_id=? AND user_id=? LIMIT 1;`,
        [
          getCommentReplyNotification[0].post_id,
          getCommentReplyNotification[0].comment_by,
        ]
      )as unknown as Array<postimages>;

      const object = {
        post_id: getCommentReplyNotification[0].post_id,
        like_by: (req.user as UserId).userId,
        user_id: resultUserProfile[0].user_id,
        content: req.body.content.trim(),
      };

      if (resultUserProfile[0].user_id !== (req.user as UserId).userId) {
        const insertNotification = await conn.query(
          `INSERT INTO notification SET ?`,
          object
        );

        res.json({
          sourceId: (req.user as UserId).userId,
          result: getCommentReplyNotification[0].comment_by,
          userDetail: resultUserProfile[0],
        });
      } else {
        res.end();
      }
    } catch (error) {
      logger.error(
        "notificationController getCommentReplyNotification function: ",
        error
      );
      res.redirect("/error");
    }
  },
};

export default notificationController;
