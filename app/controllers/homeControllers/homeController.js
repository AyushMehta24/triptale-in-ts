const logger = require("../../config/logger");
const connection = require("../../config/mysql_connection");

const homeController = () => {
  return {
    async getHome(req) {
      const userId = req.user.userId;
      try {
        const getHomePostQuery = `SELECT 
                posts.id,
                user.id AS userId,
                user.username,
                post.image,
                posts.ismultiple,
                posts.location,
                user.profile_image,
                posts.like_count,
                posts.comment_count,
                posts.isdeleted,
                posts.caption,
                posts.create_at,
                post.isvideo,
                (SELECT 
                        IF(isdeleted IS NULL, 0, 1)
                    FROM
                        post_likes pl
                    WHERE
                        pl.post_id = posts.id
                            AND pl.liked_by = ?) AS flag,
                (SELECT 
                        post_id
                    FROM
                        albums_post album
                            INNER JOIN
                        albums ON album.album_id = albums.id
                    WHERE
                        album.post_id = posts.id
                            AND albums.user_id = ? limit 1) as save_posts
                    FROM
                        posts
                            INNER JOIN
                        user_profiles user ON posts.user_id = user.user_id
                            INNER JOIN
                        post_images post ON post.post_id = posts.id
                            INNER JOIN
                        privacy ON posts.privacy_id = privacy.id
                    WHERE
                        posts.privacy_id = 1
                            AND posts.isdeleted IS NULL
                    ORDER BY posts.create_at DESC`;

        let [result] = await connection.query(getHomePostQuery, [
          userId,
          userId,
        ]);
        result.forEach((date) => {
          const offset = new Date().getTimezoneOffset();
          date.create_at = new Date(date.create_at).getTime();
          date.create_at -= offset * 60 * 1000;
          date.create_at = new Date(date.create_at);
          const timeDiff = new Date(Date.now()) - date.create_at;

          const minute = Math.ceil(timeDiff / 1000 / 60);
          const hours = Math.ceil(minute / 60);
          const days = Math.ceil(hours / 24);
          if (minute <= 59) {
            date.create_at = minute + " minutes ago";
          } else if (hours <= 24) {
            date.create_at = hours + " hours ago";
          } else if (days <= 5) {
            date.create_at = days + " days ago";
          } else {
            date.create_at = date.create_at.toDateString();
          }
        });
        result = Object.values(
          result.reduce(
            (
              acc,
              {
                id,
                userId,
                username,
                image,
                ismultiple,
                location,
                profile_image,
                privacy,
                like_count,
                comment_count,
                caption,
                create_at,
                flag,
                save_posts,
                isvideo,
              }
            ) => {
              acc[id] ??= {
                id,
                userId,
                username,
                image: [],
                ismultiple,
                location,
                profile_image,
                privacy,
                like_count,
                comment_count,
                caption,
                create_at,
                flag,
                save_posts,
                isvideo: [],
              };

              acc[id].image.push(image);
              acc[id].isvideo.push(isvideo);
              return acc;
            },
            {}
          )
        );
        return result;
      } catch (error) {
        logger.error("Home controller " + error.message);
      }
    },

    async getProfile(req, res) {
      try {
        const id = req.user.userId;

        const profileImageQuery =
          "select profile_image,user_id from user_profiles where user_id = ? ;";
        const [result] = await connection.query(profileImageQuery, id);

        res.status(200).json({
          profile: result,
        });
      } catch (error) {
        logger.error("Home Controller getProfile function: " + error.message);
      }
    },

    async getLikeCount(req, res) {
      try {
        const likeId = req.body.likeId;
        let result;
        if (req.body.flag == 1) {
          const updateLikeCountQuery =
            "update posts set like_count = like_count + 1 where id = ? ";

          const likedByData =
            "insert into post_likes (post_id, liked_by) values (?) on duplicate key update isdeleted = null";

          await connection.query(updateLikeCountQuery, [likeId]);

          await connection.query(likedByData, [[likeId, req.user.userId]]);
        } else {
          const updateLikeCountQuery =
            "update posts set like_count = like_count - 1 where id = ? ";

          const removeLike =
            "update post_likes set isdeleted = current_timestamp where post_id = ? and liked_by = ?";

          await connection.query(updateLikeCountQuery, [likeId]);

          await connection.query(removeLike, [likeId, req.user.userId]);
        }

        const getLikeCount = "select like_count from posts where id = ? ";

        [result] = await connection.query(getLikeCount, [likeId]);
        return res.status(200).json({ updateCount: result });
      } catch (error) {
        logger.error("Home getlikeData: " + error);
      }
    },
  };
};

module.exports = homeController;
