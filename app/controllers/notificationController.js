const logger = require("../config/logger");
const conn = require("../config/mysql_connection");

const notificationController = () => {
  return {
    async postUserId(req, res) {
      try {
        let result = await conn.query(`SELECT user_id FROM posts where id=?`, [
          req.body.postId,
        ]);

        let resultUserProfile = await conn.query(
          `SELECT post_images.isvideo,username,post_images.image,profile_image,first_name , last_name FROM post_likes inner join user_profiles  on post_likes.liked_by=user_profiles.user_id join post_images on post_images.post_id = post_likes.post_id where post_likes.post_id =?
        `,
          [req.body.postId]
        );

        let object = {
          post_id: req.body.postId.trim(),
          like_by: req.user.userId,
          user_id: result[0][0].user_id,
          content: req.body.content.trim(),
        };
        if (result[0][0].user_id != req.user.userId) {
          let insertNotification = await conn.query(
            `INSERT INTO notification set ?
          `,
            object
          );
          if (insertNotification[0].length != 0) {
            res.json({
              result: result[0][0].user_id,
              userDetail: resultUserProfile[0],
              sourceId: req.user.userId,
            });
          }
        }
      } catch (error) {
        logger.error("notificationController postUserId function: ", error);
        res.redirect('/error')
      }
    },
    async getNotification(req, res) {
      try {
        let [resultPost] = await conn.query(
          `SELECT notification.id, notification.create_at,isvideo,notification.like_by,notification.user_id,notification.post_id, notification.content,post_images.image, username, profile_image,first_name , last_name FROM notification inner join user_profiles on notification.like_by=user_profiles.user_id join post_images on post_images.post_id = notification.post_id  where notification.user_id=? ORDER BY notification.id desc`,
          [req.user.userId]
        );

        let multiTagePosts = resultPost.reduce((accumulator, item) => {
          accumulator[item.id] ??= {
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
            isvideo:item.isvideo,
          };

          accumulator[item.id].post_id.push(item.post_id);
          return accumulator;
        }, {});

        let resultTrip = await conn.query(
          `SELECT notification_trip.create_at, notification_trip.create_user_id,notification_trip.create_user_id, username, profile_image,concat(first_name ," ",last_name)as name ,trip_details.cover_image FROM notification_trip inner join user_profiles on notification_trip.create_user_id=user_profiles.user_id inner join trip_details on notification_trip.trip_id=trip_details.trip_id where notification_trip.add_user_id=? ORDER BY notification_trip.id desc`,
          [req.user.userId]
        );

        res.render("components/notification/notification", {
          userId: req.user.userId,
          resultPost: multiTagePosts,
          resultTrip: resultTrip[0],
        });
      } catch (error) {
        logger.error(
          "notificationController getNotification function: ",
          error
        );
        res.redirect('/error')
      }
    },
    async getCommentReplyNotification(req, res) {
      try {
        let getCommentReplyNotification = await conn.query(
          `SELECT * FROM post_comment where id=?;`,
          [req.body.comment_id]
        );

        let resultUserProfile = await conn.query(
          `SELECT * FROM post_images join user_profiles where post_id=? and user_id=? limit 1 ;`,
          [
            getCommentReplyNotification[0][0].post_id,
            getCommentReplyNotification[0][0].comment_by,
          ]
        );

        let object = {
          post_id: getCommentReplyNotification[0][0].post_id,
          like_by: req.user.userId,
          user_id: resultUserProfile[0][0].user_id,
          content: req.body.content.trim(),
        };
        if (resultUserProfile[0][0].user_id != req.user.userId) {
          let insertNotification = await conn.query(
            `INSERT INTO notification set ?
            `,
            object
          );
          res.json({
            sourceId: req.user.userId,
            result: getCommentReplyNotification[0][0].comment_by,
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
        res.redirect('/error')
      }
    },
  };
};

module.exports = notificationController;
