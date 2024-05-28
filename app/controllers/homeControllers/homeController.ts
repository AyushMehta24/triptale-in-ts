import { Request, Response, query } from "express";
import {
  FieldPacket,
  QueryResult,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";
import logger from "../../config/logger";
import connection from "../../config/mysql_connection";
import { UserId } from "../../../index";
import {
  getHomeInterface,
  getHomeInterfaceAcc,
  LikeCountInterface,
  getProfileInterface,
} from "../../../dto/homeControllerInterfaace";
import { UpdateSet, dataSet } from "../../../dto/commonInterface";

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
  create_at: string | number;
  isvideo: number;
  flag: number;
  save_posts: number | null;
  privacy: string;
}

// type dataSet =[QueryResult, FieldPacket[]]

// interface Profile {
//   profile_image: string;
//   user_id: number;
// }

interface LikeCount {
  like_count: number;
}

export const getHome: (
  req: Request
) => Promise<RowDataPacket[] | undefined> = async (req: Request) => {
  const userId: string = (req.user as UserId).userId;
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

    const result: RowDataPacket[] = (await connection.query<QueryResult>(
      getHomePostQuery,
      [userId, userId]
    )) as RowDataPacket[];

    result.forEach((date: RowDataPacket): void => {
      const offset: number = new Date().getTimezoneOffset();
      date.create_at = new Date(date.create_at).getTime();
      date.create_at -= offset * 60 * 1000;
      date.create_at = Number(new Date(date.create_at));
      const timeDiff: number = Date.now() - new Date(date.create_at).getTime();

      const minute: number = Math.ceil(timeDiff / 1000 / 60);
      const hours: number = Math.ceil(minute / 60);
      const days: number = Math.ceil(hours / 24);
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

    return result;
  } catch (error) {
    logger.error("Home controller ", error);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const id: string = (req.user as UserId).userId;

    const profileImageQuery =
      "SELECT profile_image, user_id FROM user_profiles WHERE user_id = ?;";
    const result: dataSet = await connection.query(profileImageQuery, id);

    //   const profileImageQuery =
    //   "SELECT profile_image, user_id FROM user_profiles WHERE user_id = ?;";
    // const result: [getProfileInterface[],FieldPacket[]] =
    //   (await connection.query<getProfileInterface[]>(
    //     profileImageQuery,
    //     id
    //   )) ;

    return res.status(200).json({ profile: result[0] });
  } catch (error) {
    logger.error("Home Controller getProfile function: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const likeId: string = req.body.likeId;
    // let result: [LikeCount[], QueryResult];

    if (req.body.flag === 1) {
      const updateLikeCountQuery: string =
        "UPDATE posts SET like_count = like_count + 1 WHERE id = ?";
      const likedByData: string =
        "INSERT INTO post_likes (post_id, liked_by) VALUES (?, ?) ON DUPLICATE KEY UPDATE isdeleted = NULL";

      await connection.query(updateLikeCountQuery, [likeId]);
      await connection.query(likedByData, [
        likeId,
        (req.user as UserId).userId,
      ]);
    } else {
      const updateLikeCountQuery: string =
        "UPDATE posts SET like_count = like_count - 1 WHERE id = ?";
      const removeLike: string =
        "UPDATE post_likes SET isdeleted = CURRENT_TIMESTAMP WHERE post_id = ? AND liked_by = ?";

      await connection.query(updateLikeCountQuery, [likeId]);
      await connection.query(removeLike, [likeId, (req.user as UserId).userId]);
    }

    const getLikeCount: string = "SELECT like_count FROM posts WHERE id = ?";
    const updateLikeCountQuery: dataSet = await connection.query(getLikeCount, [
      likeId,
    ]);

    return res.status(200).json({ updateCount: updateLikeCountQuery[0] }); //doubt
  } catch (error) {
    logger.error("Home getlikeData: " + error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
