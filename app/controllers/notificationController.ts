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
  postData,
  postimages,
} from "../../dto/notificationControllerInterface";
import { dataSet, insertSet } from "../../dto/commonInterface";

interface NotificationController {
  postUserId(req: Request, res: Response): Promise<void>;
  getNotification(req: Request, res: Response): Promise<void>;
  getCommentReplyNotification(req: Request, res: Response): Promise<void>;
}

const notificationController: NotificationController = {
  async postUserId(req, res) {
    try {
      const result: dataSet = await conn.query<QueryResult>(
        `SELECT user_id FROM posts where id=?`,
        [req.body.postId]
      );

      const resultUserProfile: dataSet = await conn.query(
        `SELECT post_images.isvideo, username, post_images.image, profile_image, first_name, last_name FROM post_likes INNER JOIN user_profiles ON post_likes.liked_by = user_profiles.user_id JOIN post_images ON post_images.post_id = post_likes.post_id WHERE post_likes.post_id = ?`,
        [req.body.postId]
      );

      const UserIDDetails: notificationUser[] = result[0] as notificationUser[];

      const object = {
        post_id: req.body.postId.trim(),
        like_by: (req.user as UserId).userId,
        user_id: UserIDDetails[0].user_id,
        content: req.body.content.trim(),
      };

      if (UserIDDetails[0].user_id !== Number((req.user as UserId).userId)) {
        const insertNotification: insertSet = await conn.query(
          `INSERT INTO notification SET ?`,
          object
        );

        if (insertNotification[0].affectedRows !== 0) {
          res.json({
            result: UserIDDetails[0].user_id,
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
      const resultPost: dataSet = (await conn.query(
        `SELECT notification.id, notification.create_at, isvideo, notification.like_by, notification.user_id, notification.post_id, notification.content, post_images.image, username, profile_image, first_name, last_name FROM notification INNER JOIN user_profiles ON notification.like_by = user_profiles.user_id JOIN post_images ON post_images.post_id = notification.post_id WHERE notification.user_id = ? ORDER BY notification.id DESC`,
        [(req.user as UserId).userId]
      )) ;

      // multiPostItem
      const resultPostDetails: multiPostItem[] =
      resultPost[0] as multiPostItem[];

      const multiTagePosts = resultPostDetails.reduce(
        (acc: accumalator, item: multiPostItem) => {
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

      const resultTrip:dataSet = await conn.query(
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
      const getCommentReplyNotification:dataSet = (await conn.query(
        `SELECT * FROM post_comment WHERE id=?;`,
        [req.body.comment_id]
      )) ;

      const postDetails: multiPostItem[] = getCommentReplyNotification[0] as multiPostItem[];


      const resultUserProfile: dataSet =
        (await conn.query(
          `SELECT * FROM post_images JOIN user_profiles WHERE post_id=? AND user_id=? LIMIT 1;`,
          [
            postDetails[0].post_id,
            postDetails[0].comment_by,
          ]
        )) 

        const postImagesDetails: postimages[] = getCommentReplyNotification[0] as postimages[];


      const object = {
        post_id: postDetails[0].post_id,
        like_by: (req.user as UserId).userId,
        user_id: postImagesDetails[0].user_id,
        content: req.body.content.trim(),
      };

      if (postImagesDetails[0].user_id !== (req.user as UserId).userId) {
        const insertNotification:dataSet = await conn.query(
          `INSERT INTO notification SET ?`,
          object
        );

        res.json({
          sourceId: (req.user as UserId).userId,
          result: postImagesDetails[0].comment_by,
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
