import { Request, Response, query } from "express";
import { QueryResult, ResultSetHeader } from "mysql2";
import logger from "../../config/logger";
import connection from "../../config/mysql_connection";
import { UserId } from "../../../index";
import {
  getHomeInterface,
  getHomeInterfaceAcc,
  LikeCountInterface,
  getProfile,
} from "../../../dto/homeControllerInterfaace";

interface HomePost {
  id: number;
  userId: number;
  username: string;
  image: string;
  ismultiple: number;
  location: string;
  profile_image: string;
  like_count: number;
  comment_count: number;
  isdeleted: string | null;
  caption: string;
  create_at: Date;
  isvideo: number;
  flag: number;
  save_posts: number | null;
}

interface Profile {
  profile_image: string;
  user_id: number;
}

interface LikeCount {
  like_count: number;
}

const homeController = () => {
  return {
    async getHome(req: Request): Promise<HomePost[] | void> {
      const userId = (req.user as UserId).userId;
      try {
        const getHomePostQuery = `
          SELECT 
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
            (
              SELECT IF(isdeleted IS NULL, 0, 1)
              FROM post_likes pl
              WHERE pl.post_id = posts.id
              AND pl.liked_by = ?
            ) AS flag,
            (
              SELECT post_id
              FROM albums_post album
              INNER JOIN albums ON album.album_id = albums.id
              WHERE album.post_id = posts.id
              AND albums.user_id = ? LIMIT 1
            ) AS save_posts
          FROM posts
          INNER JOIN user_profiles user ON posts.user_id = user.user_id
          INNER JOIN post_images post ON post.post_id = posts.id
          INNER JOIN privacy ON posts.privacy_id = privacy.id
          WHERE posts.privacy_id = 1 AND posts.isdeleted IS NULL
          ORDER BY posts.create_at DESC`;

        const result: Array<getHomeInterface> =
          (await connection.query<QueryResult>(getHomePostQuery, [
            userId,
            userId,
          ])) as unknown as Array<getHomeInterface>;

        result.forEach((date) => {
          const offset = new Date().getTimezoneOffset();
          date.create_at = new Date(date.create_at).getTime();
          date.create_at -= offset * 60 * 1000;
          date.create_at = Number(new Date(date.create_at));
          const timeDiff = Date.now() - new Date(date.create_at).getTime();

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
            date.create_at = new Date(date.create_at).toDateString();
          }
        });

        const formattedResult = Object.values(
          result.reduce(
            (
              acc: getHomeInterfaceAcc,
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
                image: image,
                ismultiple,
                location,
                profile_image,
                privacy,
                like_count,
                comment_count,
                caption,
                create_at: new Date(create_at),
                flag: Number(flag) || 0,
                save_posts:
                  save_posts === undefined ? null : Number(save_posts),
                isvideo: isvideo,
              };

              // acc[id].image.push(image);
              // acc[id].isvideo.push(isvideo);
              return acc;
            },
            {} as Record<number, HomePost>
          )
        ) as HomePost[];

        return formattedResult;
      } catch (error) {
        logger.error("Home controller ", error);
      }
    },

    async getProfile(req: Request, res: Response): Promise<Response> {
      try {
        const id = (req.user as UserId).userId;

        const profileImageQuery =
          "SELECT profile_image, user_id FROM user_profiles WHERE user_id = ?;";
        const result: Array<getProfile> = (await connection.query<QueryResult>(
          profileImageQuery,
          id
        )) as unknown as Array<getProfile>;

        return res.status(200).json({ profile: result });
      } catch (error) {
        logger.error("Home Controller getProfile function: ", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    },

    async getLikeCount(req: Request, res: Response): Promise<Response> {
      try {
        const likeId = req.body.likeId;
        let result: [LikeCount[], QueryResult];

        if (req.body.flag === 1) {
          const updateLikeCountQuery =
            "UPDATE posts SET like_count = like_count + 1 WHERE id = ?";
          const likedByData =
            "INSERT INTO post_likes (post_id, liked_by) VALUES (?, ?) ON DUPLICATE KEY UPDATE isdeleted = NULL";

          await connection.query(updateLikeCountQuery, [likeId]);
          await connection.query(likedByData, [
            likeId,
            (req.user as UserId).userId,
          ]);
        } else {
          const updateLikeCountQuery =
            "UPDATE posts SET like_count = like_count - 1 WHERE id = ?";
          const removeLike =
            "UPDATE post_likes SET isdeleted = CURRENT_TIMESTAMP WHERE post_id = ? AND liked_by = ?";

          await connection.query(updateLikeCountQuery, [likeId]);
          await connection.query(removeLike, [
            likeId,
            (req.user as UserId).userId,
          ]);
        }

        const getLikeCount = "SELECT like_count FROM posts WHERE id = ?";
        const updateLikeCountQuery: Array<LikeCountInterface> =
          (await connection.query<QueryResult>(getLikeCount, [
            likeId,
          ])) as unknown as Array<LikeCountInterface>;

        return res
          .status(200)
          .json({ updateCount: updateLikeCountQuery[0].like_count });
      } catch (error) {
        logger.error("Home getlikeData: " + error);
        return res.status(500).json({ error: "Internal server error" });
      }
    },
  };
};

export default homeController;
